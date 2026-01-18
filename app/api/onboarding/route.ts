import { NextResponse } from "next/server";
import { supabaseAdmin, DEMO_USER_ID } from "@/lib/supabase";

// Initial ELO based on role level
const ROLE_ELO: Record<string, number> = {
  // SWE
  intern: 1100,
  new_grad: 1200,
  mid: 1350,
  senior: 1500,
  staff: 1650,
  // QF
  quant_researcher: 1400,
  quant_developer: 1350,
  portfolio_manager: 1600,
  // IB
  analyst: 1200,
  associate: 1400,
  vp: 1500,
  director: 1600,
};

// Category strengths based on field
const FIELD_CATEGORIES: Record<string, string[]> = {
  SWE: ["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming", "System Design"],
  QF: ["Probability", "Statistics", "Stochastic Calculus", "Brain Teasers", "Mental Math", "Options"],
  IB: ["Valuation", "DCF", "LBO", "M&A", "Accounting", "Behavioral"],
};

export async function POST(request: Request) {
  try {
    const { field, targetCompany, roleLevel } = await request.json();

    if (!field || !targetCompany || !roleLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate initial ELO based on role
    const initialElo = ROLE_ELO[roleLevel] || 1200;
    
    // Get categories for the field
    const categories = FIELD_CATEGORIES[field] || FIELD_CATEGORIES.SWE;
    
    // Initialize category strengths (neutral starting point)
    const categoryStrengths: Record<string, number> = {};
    categories.forEach((cat) => {
      categoryStrengths[cat] = 50; // Start at 50% for all categories
    });

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", DEMO_USER_ID)
      .single();

    // Try to update/create with new columns, fallback to basic columns if they don't exist
    if (existingUser) {
      // Try updating with all new columns first
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          current_elo: initialElo,
          category_strengths: categoryStrengths,
          weak_categories: [],
          completed_diagnostic: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", DEMO_USER_ID);

      if (updateError) {
        console.error("Error updating user (trying basic update):", updateError);
        // Try a simpler update with just ELO
        const { error: basicError } = await supabaseAdmin
          .from("users")
          .update({
            current_elo: initialElo,
            updated_at: new Date().toISOString(),
          })
          .eq("id", DEMO_USER_ID);
          
        if (basicError) {
          console.error("Basic update also failed:", basicError);
        }
      }
    } else {
      // Create new user with basic columns
      const { error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          id: DEMO_USER_ID,
          email: "demo@dynomock.com",
          name: "Demo User",
          current_elo: initialElo,
          category_strengths: categoryStrengths,
          weak_categories: [],
          completed_diagnostic: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error creating user:", insertError);
        // The user might already exist from another session, just continue
      }
    }

    // Store onboarding preferences in localStorage via response
    // This ensures preferences are available even if DB columns don't exist
    return NextResponse.json({
      success: true,
      user: {
        field,
        targetCompany,
        roleLevel,
        initialElo,
        categories,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", DEMO_USER_ID)
      .single();

    if (error || !user) {
      return NextResponse.json({
        onboardingCompleted: false,
      });
    }

    return NextResponse.json({
      onboardingCompleted: user.onboarding_completed || false,
      field: user.field,
      targetCompany: user.target_company,
      roleLevel: user.role_level,
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json({
      onboardingCompleted: false,
    });
  }
}

