import { NextResponse } from "next/server";
import { supabaseAdmin, DEMO_USER_ID } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", DEMO_USER_ID)
      .single();

    if (error || !user) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          id: DEMO_USER_ID,
          name: "Demo User",
          email: "demo@dynomock.com",
          field: "SWE",
          target_company: "Google",
          role_level: "New Grad",
          current_elo: 1200,
          category_strengths: {},
          weak_categories: [],
          completed_diagnostic: false,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      return NextResponse.json(newUser);
    }

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", DEMO_USER_ID)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
