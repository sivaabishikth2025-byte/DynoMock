import { NextResponse } from "next/server";
import { supabaseAdmin, DEMO_USER_ID } from "@/lib/supabase";
import { calculateEloDelta, updateUserElo } from "@/lib/elo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get("problem_id");
    const mode = searchParams.get("mode");

    let query = supabaseAdmin
      .from("attempts")
      .select("*, problems(*)")
      .eq("user_id", DEMO_USER_ID)
      .order("created_at", { ascending: false });

    if (problemId) {
      query = query.eq("problem_id", problemId);
    }
    if (mode) {
      query = query.eq("mode", mode);
    }

    const { data: attempts, error } = await query.limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(attempts);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      problem_id,
      mode = "practice",
      is_correct,
      time_spent_sec,
      code_submitted,
      feedback = {},
    } = body;

    const { data: problem } = await supabaseAdmin
      .from("problems")
      .select("*")
      .eq("id", problem_id)
      .single();

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", DEMO_USER_ID)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const eloDelta = calculateEloDelta(
      user.current_elo,
      problem.difficulty_elo,
      is_correct,
      time_spent_sec
    );

    const { data: attempt, error } = await supabaseAdmin
      .from("attempts")
      .insert({
        user_id: DEMO_USER_ID,
        problem_id,
        mode,
        is_correct,
        time_spent_sec,
        code_submitted,
        feedback,
        elo_delta: eloDelta,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await updateUserElo(DEMO_USER_ID, eloDelta, problem.category, is_correct);

    return NextResponse.json({
      attempt,
      elo_delta: eloDelta,
      new_elo: user.current_elo + eloDelta,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create attempt" }, { status: 500 });
  }
}
