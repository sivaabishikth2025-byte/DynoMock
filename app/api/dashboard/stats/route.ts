import { NextResponse } from "next/server";
import { supabaseAdmin, DEMO_USER_ID } from "@/lib/supabase";

// Field-specific categories
const FIELD_CATEGORIES: Record<string, string[]> = {
  SWE: ["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming", "System Design", "Linked Lists"],
  QF: ["Probability", "Statistics", "Stochastic Calculus", "Brain Teasers", "Mental Math", "Options", "Market Making"],
  IB: ["Valuation", "DCF", "LBO", "M&A", "Accounting", "Behavioral", "Financial Statements"],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userField = searchParams.get("field") || "SWE"; // Default to SWE

    // Fetch user data
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", DEMO_USER_ID)
      .single();

    // Fetch all attempts for user's field
    const { data: attempts } = await supabaseAdmin
      .from("attempts")
      .select("*, problems(id, title, category, field)")
      .eq("user_id", DEMO_USER_ID)
      .order("created_at", { ascending: false });

    // Filter attempts by field
    const fieldAttempts = (attempts || []).filter(a => 
      (a.problems as any)?.field === userField || !(a.problems as any)?.field
    );

    // Fetch all interviews (could also filter by field if problems are field-specific)
    const { data: interviews } = await supabaseAdmin
      .from("interviews")
      .select("*, problems(field)")
      .eq("user_id", DEMO_USER_ID)
      .order("created_at", { ascending: false });

    // Filter interviews by field
    const fieldInterviews = (interviews || []).filter(i => 
      (i.problems as any)?.field === userField || !(i.problems as any)?.field
    );

    // Fetch total problems count for user's field
    const { count: totalProblems } = await supabaseAdmin
      .from("problems")
      .select("*", { count: "exact", head: true })
      .eq("field", userField);

    // Calculate stats (field-specific)
    const uniqueProblemsSolved = new Set(
      fieldAttempts.filter(a => a.is_correct || (a.score && a.score >= 70)).map(a => a.problem_id)
    ).size;

    const totalAttempts = fieldAttempts.length;
    const successfulAttempts = fieldAttempts.filter(a => a.is_correct || (a.score && a.score >= 70)).length;
    const accuracy = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0;

    // Calculate streak from all attempts (not field-specific for engagement)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);
    
    const attemptDates = new Set(
      (attempts || []).map(a => {
        const d = new Date(a.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    // Check consecutive days
    while (attemptDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // If no activity today, check if yesterday started the streak
    if (streak === 0) {
      checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);
      while (attemptDates.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Interview stats (field-specific)
    const completedInterviews = fieldInterviews.filter(i => i.status === "completed");
    const passedInterviews = completedInterviews.filter(i => 
      (i.performance_score && i.performance_score >= 70) || i.elo_change > 0 || i.interview_passed
    );

    // Recent activity - get last 5 attempts with problem info (field-specific)
    const recentActivity = fieldAttempts.slice(0, 5).map(a => ({
      id: a.id,
      problemId: a.problem_id,
      title: (a.problems as any)?.title || "Unknown Problem",
      category: (a.problems as any)?.category || "Unknown",
      score: a.score || (a.is_correct ? 100 : 0),
      createdAt: a.created_at,
    }));

    // Calculate achievements
    const achievements = [
      { 
        id: "first-steps", 
        title: "First Steps", 
        description: "Solve your first problem", 
        unlocked: uniqueProblemsSolved >= 1 
      },
      { 
        id: "problem-solver", 
        title: "Problem Solver", 
        description: "Solve 10 problems", 
        unlocked: uniqueProblemsSolved >= 10 
      },
      { 
        id: "on-fire", 
        title: "On Fire", 
        description: "3-day streak", 
        unlocked: streak >= 3 
      },
      { 
        id: "interview-ready", 
        title: "Interview Ready", 
        description: "Complete first mock interview", 
        unlocked: completedInterviews.length >= 1 
      },
      { 
        id: "consistent", 
        title: "Consistent", 
        description: "7-day streak", 
        unlocked: streak >= 7 
      },
      { 
        id: "expert", 
        title: "Expert", 
        description: "Reach 1500 ELO", 
        unlocked: (user?.current_elo || 0) >= 1500 
      },
    ];

    // ELO history - get from interviews or generate progression
    const eloHistory = [];
    let currentElo = user?.current_elo || 1200;
    
    // Get ELO changes from recent field-specific interviews
    const sortedInterviews = fieldInterviews
      .filter(i => i.status === "completed" && i.elo_change)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-5);

    if (sortedInterviews.length > 0) {
      let runningElo = currentElo;
      // Work backwards to get history
      for (let i = sortedInterviews.length - 1; i >= 0; i--) {
        runningElo -= sortedInterviews[i].elo_change || 0;
      }
      
      eloHistory.push({ date: "Start", value: Math.max(800, runningElo) });
      
      sortedInterviews.forEach((interview, i) => {
        runningElo += interview.elo_change || 0;
        eloHistory.push({ date: `Session ${i + 1}`, value: runningElo });
      });
    } else {
      // Generate sample history leading to current ELO
      const startElo = Math.max(800, currentElo - 150);
      eloHistory.push({ date: "Week 1", value: startElo });
      eloHistory.push({ date: "Week 2", value: startElo + 40 });
      eloHistory.push({ date: "Week 3", value: startElo + 90 });
      eloHistory.push({ date: "Week 4", value: startElo + 130 });
      eloHistory.push({ date: "Now", value: currentElo });
    }

    // Category performance - field-specific categories
    const fieldCategories = FIELD_CATEGORIES[userField] || FIELD_CATEGORIES.SWE;
    const categoryPerformance: Array<{ name: string; value: number }> = [];

    // Calculate category scores from field-specific attempts
    const categoryScores: Record<string, { totalScore: number; count: number }> = {};
    
    fieldAttempts.forEach(a => {
      const cat = (a.problems as any)?.category;
      if (cat && fieldCategories.includes(cat)) {
        if (!categoryScores[cat]) {
          categoryScores[cat] = { totalScore: 0, count: 0 };
        }
        categoryScores[cat].count++;
        categoryScores[cat].totalScore += a.score || (a.is_correct ? 100 : 0);
      }
    });

    // Add all field categories (even if no attempts yet)
    fieldCategories.forEach(cat => {
      if (categoryScores[cat]) {
        categoryPerformance.push({
          name: cat,
          value: Math.round(categoryScores[cat].totalScore / categoryScores[cat].count),
        });
      } else {
        // Show category with 0 if no attempts
        categoryPerformance.push({
          name: cat,
          value: 0,
        });
      }
    });

    // Determine focus areas and strengths from field-specific categories
    const focusAreas = categoryPerformance
      .filter(c => c.value < 50 && c.value > 0)
      .map(c => c.name)
      .slice(0, 3);

    const strengths = categoryPerformance
      .filter(c => c.value >= 70)
      .map(c => c.name);

    return NextResponse.json({
      user: user || { name: "Demo User", current_elo: 1200 },
      field: userField,
      stats: {
        problemsSolved: uniqueProblemsSolved,
        totalProblems: totalProblems || 15,
        accuracy,
        streak: Math.max(1, streak), // At least show 1 for engagement
        interviewsPassed: passedInterviews.length,
        totalInterviews: completedInterviews.length,
        totalInterviewAttempts: fieldInterviews.length,
      },
      achievements,
      recentActivity,
      eloHistory,
      categoryPerformance,
      focusAreas: focusAreas.length > 0 ? focusAreas : (user?.weak_categories || []),
      strengths,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}

