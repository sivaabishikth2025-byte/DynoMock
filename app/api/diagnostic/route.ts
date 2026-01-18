import { NextResponse } from "next/server";
import { supabaseAdmin, DEMO_USER_ID } from "@/lib/supabase";
import { evaluateCode } from "@/lib/qwen";

export async function GET() {
  try {
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("field")
      .eq("id", DEMO_USER_ID)
      .single();

    const field = user?.field || "SWE";

    const { data: problems, error } = await supabaseAdmin
      .from("problems")
      .select("*")
      .eq("field", field)
      .order("difficulty_elo")
      .limit(5);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const diagnosticProblems = problems?.map(p => ({
      ...p,
      time_limit_sec: 600,
    })) || [];

    return NextResponse.json(diagnosticProblems);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch diagnostic problems" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { results } = body;

    if (!results || !Array.isArray(results)) {
      return NextResponse.json({ error: "Results array required" }, { status: 400 });
    }

    let totalWeight = 0;
    let weightedSum = 0;
    const categoryResults: Record<string, { correct: number; total: number }> = {};
    const evaluatedResults: Array<{
      problem_id: string;
      is_correct: boolean;
      evaluation: Record<string, unknown>;
    }> = [];

    for (let i = 0; i < results.length; i++) {
      const { problem_id, time_spent_sec, code_submitted, language = "javascript" } = results[i];
      
      const { data: problem } = await supabaseAdmin
        .from("problems")
        .select("*")
        .eq("id", problem_id)
        .single();

      if (!problem) continue;

      let evaluation;
      let isCorrect = false;

      if (code_submitted && code_submitted.trim().length > 20) {
        try {
          evaluation = await evaluateCode(
            code_submitted,
            problem.statement,
            problem.solution_approach || "",
            language
          );
          isCorrect = evaluation.isCorrect;
        } catch (evalError) {
          console.error("Evaluation error:", evalError);
          evaluation = {
            isCorrect: false,
            correctnessScore: 0,
            explanation: "Evaluation failed",
            suggestions: [],
          };
        }
      } else {
        evaluation = {
          isCorrect: false,
          correctnessScore: 0,
          explanation: "No solution submitted or solution too short",
          suggestions: ["Submit a complete solution"],
        };
      }

      evaluatedResults.push({
        problem_id,
        is_correct: isCorrect,
        evaluation,
      });

      const weight = i + 1;
      const baseElo = isCorrect ? problem.difficulty_elo + 50 : problem.difficulty_elo - 50;
      weightedSum += baseElo * weight;
      totalWeight += weight;

      if (!categoryResults[problem.category]) {
        categoryResults[problem.category] = { correct: 0, total: 0 };
      }
      categoryResults[problem.category].total++;
      if (isCorrect) {
        categoryResults[problem.category].correct++;
      }

      const { error: insertError } = await supabaseAdmin.from("attempts").insert({
        user_id: DEMO_USER_ID,
        problem_id,
        mode: "diagnostic",
        is_correct: isCorrect,
        time_spent_sec,
        code_submitted,
        feedback: evaluation,
        elo_delta: 0,
      });

      if (insertError) {
        console.error("Failed to insert attempt:", insertError);
      }
    }

    const calculatedElo = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 1200;
    const finalElo = Math.max(800, Math.min(2200, calculatedElo));

    const categoryStrengths: Record<string, number> = {};
    const weakCategories: string[] = [];

    for (const [category, data] of Object.entries(categoryResults)) {
      const strength = data.correct / data.total;
      categoryStrengths[category] = strength;
      if (strength < 0.5) {
        weakCategories.push(category);
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        current_elo: finalElo,
        category_strengths: categoryStrengths,
        weak_categories: weakCategories,
        completed_diagnostic: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", DEMO_USER_ID);

    if (updateError) {
      console.error("Failed to update user:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const correct = evaluatedResults.filter(r => r.is_correct).length;
    const accuracy = Math.round((correct / evaluatedResults.length) * 100);

    return NextResponse.json({
      elo: finalElo,
      category_strengths: categoryStrengths,
      weak_categories: weakCategories,
      problems_solved: correct,
      total_problems: evaluatedResults.length,
      accuracy,
      evaluations: evaluatedResults,
    });
  } catch (err) {
    console.error("Diagnostic POST error:", err);
    return NextResponse.json({ error: "Failed to process diagnostic" }, { status: 500 });
  }
}
