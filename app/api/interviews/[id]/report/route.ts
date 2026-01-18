import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: interview, error } = await supabaseAdmin
      .from("interviews")
      .select("*, problems(*)")
      .eq("id", id)
      .single();

    if (error || !interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${String(secs).padStart(2, "0")}`;
    };

    const report = {
      id: interview.id,
      problem: interview.problems?.title || "Unknown Problem",
      category: interview.problems?.category || "Unknown",
      difficulty_elo: interview.problems?.difficulty_elo || 0,
      date: new Date(interview.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      duration: formatDuration(interview.duration_sec || 0),
      duration_sec: interview.duration_sec || 0,
      
      performance_score: interview.performance_score || 0,
      problem_solving_score: interview.problem_solving_score || 0,
      code_correctness_score: interview.code_correctness_score || 0,
      communication_score: interview.communication_score || 0,
      time_efficiency_score: interview.time_efficiency_score || 0,
      edge_cases_score: interview.edge_cases_score || 0,
      
      strengths: interview.strengths || [],
      weaknesses: interview.weaknesses || [],
      key_mistakes: interview.key_mistakes || [],
      recommendations: interview.recommendations || [],
      
      transcript: interview.transcript || [],
      timeline: interview.overshoot_report?.timeline || [],
      
      elo_change: interview.elo_change || 0,
      status: interview.status,
    };

    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch interview report" }, { status: 500 });
  }
}
