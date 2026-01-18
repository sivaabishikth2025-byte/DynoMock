import { NextResponse } from "next/server";
import { supabaseAdmin, DEMO_USER_ID } from "@/lib/supabase";
import { getInterviewProblem, calculateEloDelta, updateUserElo } from "@/lib/elo";
import { generateInterviewFeedback } from "@/lib/qwen";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const { data: interview, error } = await supabaseAdmin
        .from("interviews")
        .select("*, problems(*)")
        .eq("id", id)
        .single();

      if (error || !interview) {
        return NextResponse.json({ error: "Interview not found" }, { status: 404 });
      }

      return NextResponse.json(interview);
    }

    const { data: interviews, error } = await supabaseAdmin
      .from("interviews")
      .select("*, problems(title, category, difficulty_elo)")
      .eq("user_id", DEMO_USER_ID)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(interviews);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { problem_id, field } = body;

    let selectedProblem;

    if (problem_id) {
      const { data: problem } = await supabaseAdmin
        .from("problems")
        .select("*")
        .eq("id", problem_id)
        .single();
      selectedProblem = problem;
    } else {
      // Pass user's field to get appropriate problem
      selectedProblem = await getInterviewProblem(DEMO_USER_ID, field || "SWE");
    }

    if (!selectedProblem) {
      return NextResponse.json({ error: "No suitable problem found" }, { status: 404 });
    }

    const { data: interview, error } = await supabaseAdmin
      .from("interviews")
      .insert({
        user_id: DEMO_USER_ID,
        problem_id: selectedProblem.id,
        transcript: [
          {
            time: new Date().toISOString(),
            speaker: "AI",
            text: `Hello! I'm your AI interviewer today. Let's work on "${selectedProblem.title}". Here's the problem: ${selectedProblem.statement.slice(0, 300)}${selectedProblem.statement.length > 300 ? '...' : ''} Take your time to understand it, and when you're ready, walk me through your initial thoughts.`,
          },
        ],
        status: "in_progress",
        strengths: [],
        weaknesses: [],
        key_mistakes: [],
        recommendations: [],
        overshoot_report: {},
      })
      .select("*, problems(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(interview);
  } catch (err) {
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, 
      transcript_entry, 
      end_interview, 
      code_submitted, 
      hints_used = 0, 
      duration_sec,
      interview_passed,
      correct_answers,
      questions_attempted
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Interview ID required" }, { status: 400 });
    }

    const { data: interview } = await supabaseAdmin
      .from("interviews")
      .select("*, problems(*)")
      .eq("id", id)
      .single();

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (transcript_entry) {
      const updatedTranscript = [...(interview.transcript || []), transcript_entry];

      const { data: updated, error } = await supabaseAdmin
        .from("interviews")
        .update({ transcript: updatedTranscript })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(updated);
    }

    if (end_interview) {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", DEMO_USER_ID)
        .single();

      const problem = interview.problems;
      const transcript = interview.transcript || [];

      let feedback;
      try {
        feedback = await generateInterviewFeedback(
          problem?.statement || "",
          problem?.category || "Unknown",
          transcript.map((t: { time: string; speaker: string; text: string }) => ({
            speaker: t.speaker,
            text: t.text,
          })),
          code_submitted || "",
          duration_sec || 0,
          hints_used
        );
      } catch (feedbackError) {
        console.error("Feedback generation error:", feedbackError);
        feedback = {
          performanceScore: 50,
          problemSolvingScore: 50,
          codeCorrectnessScore: 50,
          communicationScore: 50,
          timeEfficiencyScore: 50,
          edgeCasesScore: 50,
          strengths: ["Completed the interview"],
          weaknesses: ["Unable to fully evaluate"],
          keyMistakes: [],
          recommendations: ["Practice more problems in this category"],
          detailedAnalysis: "Interview completed.",
        };
      }

      // New pass condition: 3 correct answers = pass
      // If interview_passed is provided from frontend, use that; otherwise fallback to performance score
      const isCorrect = interview_passed !== undefined ? interview_passed : feedback.performanceScore >= 60;
      
      // Adjust performance score based on correct answers if provided
      if (correct_answers !== undefined && questions_attempted !== undefined) {
        const accuracyBonus = questions_attempted > 0 ? Math.round((correct_answers / questions_attempted) * 100) : 50;
        feedback.performanceScore = Math.max(feedback.performanceScore, accuracyBonus);
        feedback.detailedAnalysis = `You answered ${correct_answers} out of ${questions_attempted} questions correctly. ${feedback.detailedAnalysis}`;
      }
      
      const eloDelta = calculateEloDelta(
        user?.current_elo || 1200,
        problem?.difficulty_elo || 1200,
        isCorrect,
        duration_sec || 1800
      );

      const timeline = [
        { time: "00:00", event: "Interview started", type: "neutral" },
        { time: formatTime(Math.floor((duration_sec || 0) / 4)), event: "Problem explained", type: "positive" },
        { time: formatTime(Math.floor((duration_sec || 0) / 2)), event: hints_used > 0 ? `${hints_used} hint(s) used` : "Making progress", type: hints_used > 0 ? "warning" : "positive" },
        { 
          time: formatTime(duration_sec || 0), 
          event: isCorrect 
            ? `Interview passed (${correct_answers || 0}/${questions_attempted || 0} correct)` 
            : "Interview ended", 
          type: isCorrect ? "positive" : "neutral" 
        },
      ];

      const { data: finalInterview, error } = await supabaseAdmin
        .from("interviews")
        .update({
          status: "completed",
          performance_score: feedback.performanceScore,
          problem_solving_score: feedback.problemSolvingScore,
          code_correctness_score: feedback.codeCorrectnessScore,
          communication_score: feedback.communicationScore,
          time_efficiency_score: feedback.timeEfficiencyScore,
          edge_cases_score: feedback.edgeCasesScore,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
          key_mistakes: feedback.keyMistakes,
          recommendations: feedback.recommendations,
          elo_change: eloDelta,
          duration_sec: duration_sec || 0,
          overshoot_report: { 
            timeline,
            detailedAnalysis: feedback.detailedAnalysis,
            codeSubmitted: code_submitted,
            correctAnswers: correct_answers || 0,
            questionsAttempted: questions_attempted || 0,
            passed: isCorrect,
          },
        })
        .eq("id", id)
        .select("*, problems(*)")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (user && problem) {
        await updateUserElo(DEMO_USER_ID, eloDelta, problem.category, isCorrect);
      }

      return NextResponse.json({
        ...finalInterview,
        elo_delta: eloDelta,
        new_elo: (user?.current_elo || 1200) + eloDelta,
      });
    }

    return NextResponse.json(interview);
  } catch (err) {
    console.error("Interview PUT error:", err);
    return NextResponse.json({ error: "Failed to update interview" }, { status: 500 });
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
