import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { evaluateCode } from "@/lib/qwen";

export async function POST(request: Request) {
  try {
    const { interviewId, code, language = "javascript" } = await request.json();

    if (!interviewId || !code) {
      return NextResponse.json(
        { error: "interviewId and code are required" },
        { status: 400 }
      );
    }

    // Fetch interview with problem details
    const { data: interview, error: interviewError } = await supabaseAdmin
      .from("interviews")
      .select("*, problems(*)")
      .eq("id", interviewId)
      .single();

    if (interviewError || !interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const problem = interview.problems;

    // Evaluate the code
    const evaluation = await evaluateCode(
      code,
      problem.statement,
      problem.solution_approach || "",
      language
    );

    // Generate detailed feedback message
    let feedbackMessage = "";
    
    if (evaluation.isCorrect && evaluation.correctnessScore >= 80) {
      // Great solution
      feedbackMessage = `Excellent work! Your solution is correct with a score of ${evaluation.correctnessScore}%. `;
      feedbackMessage += `Time complexity: ${evaluation.timeComplexity}, Space complexity: ${evaluation.spaceComplexity}. `;
      
      if (evaluation.suggestions.length > 0) {
        feedbackMessage += `\n\nHere are some potential enhancements: ${evaluation.suggestions.slice(0, 2).join(". ")}. `;
      }
      
      if (evaluation.edgeCasesHandled.length > 0) {
        feedbackMessage += `\n\nGreat job handling these edge cases: ${evaluation.edgeCasesHandled.join(", ")}.`;
      }
    } else if (evaluation.correctnessScore >= 50) {
      // Partial solution
      feedbackMessage = `Good attempt! Your solution scored ${evaluation.correctnessScore}%. `;
      feedbackMessage += evaluation.explanation + " ";
      
      if (evaluation.edgeCasesMissed.length > 0) {
        feedbackMessage += `\n\nConsider these edge cases you might have missed: ${evaluation.edgeCasesMissed.join(", ")}. `;
      }
      
      if (evaluation.suggestions.length > 0) {
        feedbackMessage += `\n\nSuggestions to improve: ${evaluation.suggestions.join(". ")}`;
      }
      
      feedbackMessage += "\n\nWould you like to try again or discuss the approach?";
    } else {
      // Needs work
      feedbackMessage = `Your solution needs some work. ${evaluation.explanation} `;
      
      if (evaluation.suggestions.length > 0) {
        feedbackMessage += `\n\nHere's what to consider: ${evaluation.suggestions.join(". ")}`;
      }
      
      feedbackMessage += "\n\nLet me help you think through this. What's your general approach to solving this problem?";
    }

    // Update interview transcript with the code submission and feedback
    const transcript = interview.transcript || [];
    
    transcript.push({
      time: new Date().toISOString(),
      speaker: "User",
      text: `[Submitted Code]\n\`\`\`${language}\n${code}\n\`\`\``,
      type: "code_submission"
    });
    
    transcript.push({
      time: new Date().toISOString(),
      speaker: "AI",
      text: feedbackMessage,
      type: "code_feedback"
    });

    // Update the interview
    await supabaseAdmin
      .from("interviews")
      .update({ 
        transcript,
        // Store the latest code
      })
      .eq("id", interviewId);

    return NextResponse.json({
      evaluation,
      feedback: feedbackMessage,
      passed: evaluation.isCorrect && evaluation.correctnessScore >= 70,
    });
  } catch (error) {
    console.error("Code evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate code" },
      { status: 500 }
    );
  }
}


