import { NextResponse } from "next/server";
import { evaluateCode } from "@/lib/qwen";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { code, problemId, language = "javascript" } = await request.json();

    if (!code || !problemId) {
      return NextResponse.json(
        { error: "Code and problemId are required" },
        { status: 400 }
      );
    }

    const { data: problem, error: problemError } = await supabaseAdmin
      .from("problems")
      .select("*")
      .eq("id", problemId)
      .single();

    if (problemError || !problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    const evaluation = await evaluateCode(
      code,
      problem.statement,
      problem.solution_approach || "",
      language
    );

    return NextResponse.json({
      ...evaluation,
      problemTitle: problem.title,
      problemCategory: problem.category,
    });
  } catch (error) {
    console.error("Evaluate code error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate code" },
      { status: 500 }
    );
  }
}
