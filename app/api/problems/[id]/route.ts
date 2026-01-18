import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: problem, error } = await supabaseAdmin
      .from("problems")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json(problem);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}
