"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
  Clock,
  Flame,
  SlidersHorizontal,
  X,
  Loader2,
  Briefcase,
  ChevronRight
} from "lucide-react";
import { GlowButton, GlassPanel, DifficultyPill, CategoryTag } from "@/components/ui/design-system";
import { AppShell } from "@/components/AppShell";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import type { Problem } from "@/lib/supabase";
import { getUserField, getFieldDisplayName, getFieldCategories, FIELD_DISPLAY_NAMES } from "@/lib/userPreferences";

export default function PracticePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [difficultyRange, setDifficultyRange] = useState([0, 100]);
  const [weaknessFocus, setWeaknessFocus] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [weakCategories, setWeakCategories] = useState<string[]>([]);
  const [userField, setUserField] = useState<string>("SWE");

  // Fetch problems from API for user's field
  useEffect(() => {
    // Get user's field from localStorage
    const field = getUserField();
    setUserField(field);

    const fetchData = async () => {
      try {
        const [problemsRes, userRes] = await Promise.all([
          fetch(`/api/problems?field=${field}&limit=50`),
          fetch("/api/user"),
        ]);
        
        if (problemsRes.ok) {
          const data = await problemsRes.json();
          setProblems(data);
        }
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setWeakCategories(userData.weak_categories || []);
        }
      } catch (err) {
        console.error("Failed to fetch problems:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const categories = ["All", ...Array.from(new Set(problems.map((p) => p.category)))];

  const getDifficultyLabel = (elo: number) => {
    if (elo < 1150) return "Easy";
    if (elo < 1350) return "Medium";
    return "Hard";
  };

  const getDifficultyValue = (elo: number) => {
    if (elo < 1150) return 33;
    if (elo < 1350) return 66;
    return 100;
  };

  const getMatchScore = (problem: Problem) => {
    // Calculate match score based on weak categories
    let score = 70 + Math.floor(Math.random() * 20);
    if (weakCategories.includes(problem.category)) {
      score += 15;
    }
    return Math.min(99, score);
  };

  const getTimeEstimate = (elo: number) => {
    if (elo < 1150) return "15-20 min";
    if (elo < 1350) return "25-35 min";
    return "40-60 min";
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase()) ||
      (problem.tags || []).some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || problem.category === selectedCategory;
    const diffValue = getDifficultyValue(problem.difficulty_elo);
    const matchesDifficulty = diffValue >= difficultyRange[0] && diffValue <= difficultyRange[1];
    const matchesWeakness = !weaknessFocus || weakCategories.includes(problem.category);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesWeakness;
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-4rem)] relative">
        {/* Starfield Background */}
        <StarfieldBackground />
        
        <div className="relative max-w-7xl mx-auto px-4 py-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Practice Problems</h1>
                <p className="text-muted-foreground">
                  Sharpen your skills with curated {FIELD_DISPLAY_NAMES[userField] || userField} problems.
                </p>
              </div>
              
              {/* Field Badge */}
              <Link href="/onboarding">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-lg cursor-pointer hover:border-violet-500/60 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-violet-400 font-medium">
                    {FIELD_DISPLAY_NAMES[userField] || userField}
                  </span>
                  <ChevronRight className="w-3 h-3 text-violet-400/60" />
                </motion.div>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col lg:flex-row gap-4 mb-8"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search problems or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm transition-all",
                    selectedCategory === category
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {category}
                </button>
              ))}
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all",
                  showFilters
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </motion.div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <GlassPanel>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Difficulty Range</label>
                    <Slider
                      defaultValue={[0, 100]}
                      max={100}
                      step={33}
                      value={difficultyRange}
                      onValueChange={setDifficultyRange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Easy</span>
                      <span>Medium</span>
                      <span>Hard</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Weakness Focus</p>
                      <p className="text-xs text-muted-foreground">
                        Show problems targeting your weak areas
                      </p>
                    </div>
                    <Switch
                      checked={weaknessFocus}
                      onCheckedChange={setWeaknessFocus}
                    />
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {problems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No problems found. Check back later!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProblems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * Math.min(index, 10) }}
                >
                  <Link href={`/problem/${problem.id}`}>
                    <GlassPanel hover className="h-full">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg group-hover:text-violet-400 transition-colors">
                          {problem.title}
                        </h3>
                        <DifficultyPill difficulty={getDifficultyLabel(problem.difficulty_elo)} />
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeEstimate(problem.difficulty_elo)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          {getMatchScore(problem)}% match
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <CategoryTag category={problem.category} />
                        {(problem.tags || []).slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-white/5 text-white/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </GlassPanel>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {filteredProblems.length === 0 && problems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground mb-4">No problems match your filters.</p>
              <GlowButton variant="secondary" onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setDifficultyRange([0, 100]);
                setWeaknessFocus(false);
              }}>
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </GlowButton>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
