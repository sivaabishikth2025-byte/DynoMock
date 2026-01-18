import { NextResponse } from "next/server";
import { supabaseAdmin, DEMO_USER_ID } from "@/lib/supabase";
import { getRecommendedProblems } from "@/lib/elo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const company = searchParams.get("company");
    const category = searchParams.get("category");
    const recommended = searchParams.get("recommended") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (recommended) {
      const problems = await getRecommendedProblems(DEMO_USER_ID, limit);
      return NextResponse.json(problems);
    }

    let query = supabaseAdmin.from("problems").select("*");

    if (field) {
      query = query.eq("field", field);
    }
    if (company) {
      query = query.eq("company", company);
    }
    if (category) {
      query = query.eq("category", category);
    }

    const { data: problems, error } = await query.limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(problems);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}
