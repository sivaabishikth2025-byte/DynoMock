import { NextResponse } from "next/server";
import { supabaseAdmin, DEMO_USER_ID } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { interviewId, currentProblemId, field } = await request.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: "interviewId is required" },
        { status: 400 }
      );
    }

    // Get user's ELO
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("current_elo, field")
      .eq("id", DEMO_USER_ID)
      .single();

    const userElo = user?.current_elo || 1200;
    // Use provided field or fallback to user's field
    const userField = field || user?.field || "SWE";

    // Get problems for user's field, excluding current problem
    let query = supabaseAdmin
      .from("problems")
      .select("*")
      .eq("field", userField)
      .gte("difficulty_elo", userElo - 200)
      .lte("difficulty_elo", userElo + 200);
    
    if (currentProblemId) {
      query = query.neq("id", currentProblemId);
    }

    const { data: problems, error: problemsError } = await query;

    if (problemsError || !problems || problems.length === 0) {
      // Fallback: get any problem in user's field except current
      let fallbackQuery = supabaseAdmin
        .from("problems")
        .select("*")
        .eq("field", userField);
      
      if (currentProblemId) {
        fallbackQuery = fallbackQuery.neq("id", currentProblemId);
      }

      const { data: fallbackProblems } = await fallbackQuery;

      if (!fallbackProblems || fallbackProblems.length === 0) {
        // Final fallback: any problem
        const { data: anyProblems } = await supabaseAdmin
          .from("problems")
          .select("*")
          .neq("id", currentProblemId || "");

        if (!anyProblems || anyProblems.length === 0) {
          return NextResponse.json(
            { error: "No other problems available" },
            { status: 404 }
          );
        }

        const randomProblem = anyProblems[Math.floor(Math.random() * anyProblems.length)];
        
        await supabaseAdmin
          .from("interviews")
          .update({ problem_id: randomProblem.id })
          .eq("id", interviewId);

        return NextResponse.json({ problem: randomProblem });
      }

      const randomProblem = fallbackProblems[Math.floor(Math.random() * fallbackProblems.length)];
      
      // Update the interview with the new problem
      await supabaseAdmin
        .from("interviews")
        .update({ problem_id: randomProblem.id })
        .eq("id", interviewId);

      return NextResponse.json({ problem: randomProblem });
    }

    // Pick a random problem from the filtered list
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];

    // Update the interview with the new problem
    const { error: updateError } = await supabaseAdmin
      .from("interviews")
      .update({ problem_id: randomProblem.id })
      .eq("id", interviewId);

    if (updateError) {
      console.error("Error updating interview:", updateError);
    }

    return NextResponse.json({ problem: randomProblem });
  } catch (error) {
    console.error("Next question error:", error);
    return NextResponse.json(
      { error: "Failed to get next question" },
      { status: 500 }
    );
  }
}


