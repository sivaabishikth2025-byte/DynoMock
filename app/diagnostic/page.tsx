"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Brain,
} from "lucide-react";
import { GlowButton, GlassPanel, DifficultyPill, CategoryTag } from "@/components/ui/design-system";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import type { Problem } from "@/lib/supabase";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const languages = [
  { value: "javascript", label: "JavaScript", starter: "// Write your solution here\n\nfunction solution() {\n  \n}" },
  { value: "python", label: "Python", starter: "# Write your solution here\n\ndef solution():\n    pass" },
  { value: "java", label: "Java", starter: "// Write your solution here\n\nclass Solution {\n    public void solve() {\n        \n    }\n}" },
  { value: "cpp", label: "C++", starter: "// Write your solution here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}" },
  { value: "typescript", label: "TypeScript", starter: "// Write your solution here\n\nfunction solution(): void {\n  \n}" },
  { value: "go", label: "Go", starter: "// Write your solution here\n\npackage main\n\nfunc main() {\n\t\n}" },
];

type DiagnosticResult = {
  problem_id: string;
  time_spent_sec: number;
  code_submitted: string;
  language: string;
};

type DiagnosticReport = {
  elo: number;
  category_strengths: Record<string, number>;
  weak_categories: string[];
  problems_solved: number;
  total_problems: number;
  accuracy: number;
  evaluations?: Array<{
    problem_id: string;
    is_correct: boolean;
    evaluation: Record<string, unknown>;
  }>;
};

type CodeMap = Record<string, string>;

export default function DiagnosticPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [language, setLanguage] = useState("javascript");
  const [codeByProblem, setCodeByProblem] = useState<CodeMap>({});
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [completedProblems, setCompletedProblems] = useState<number[]>([]);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string>("");
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch("/api/diagnostic");
        if (res.ok) {
          const data = await res.json();
          setProblems(data);
          const initialCode: CodeMap = {};
          data.forEach((p: Problem) => {
            initialCode[p.id] = p.starter_code?.javascript || languages[0].starter;
          });
          setCodeByProblem(initialCode);
        }
      } catch (err) {
        console.error("Failed to fetch problems:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProblems();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [currentProblem]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const problem = problems[currentProblem];
  const currentCode = problem ? (codeByProblem[problem.id] || languages[0].starter) : "";

  const handleCodeChange = (value: string | undefined) => {
    if (problem) {
      setCodeByProblem(prev => ({
        ...prev,
        [problem.id]: value || ""
      }));
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    
    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    const newResult: DiagnosticResult = {
      problem_id: problem.id,
      time_spent_sec: timeSpent,
      code_submitted: currentCode,
      language,
    };
    
    const newResults = [...results, newResult];
    setResults(newResults);
    setCompletedProblems([...completedProblems, currentProblem]);
    
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
      setTimeRemaining(600);
      setIsSubmitting(false);
    } else {
      setSubmitStatus("Analyzing your solutions with AI...");
      
      try {
        const res = await fetch("/api/diagnostic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ results: newResults }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        } else {
          console.error("Diagnostic submission failed");
        }
      } catch (err) {
        console.error("Failed to submit diagnostic:", err);
      }
      
      setIsSubmitting(false);
      setSubmitStatus("");
      setShowResults(true);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (problem && !codeByProblem[problem.id]) {
      const newLang = languages.find(l => l.value === newLanguage);
      setCodeByProblem(prev => ({
        ...prev,
        [problem.id]: newLang?.starter || languages[0].starter
      }));
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      </AppShell>
    );
  }

  if (showResults) {
    const displayReport = report || {
      elo: 1200,
      weak_categories: [],
      problems_solved: 0,
      total_problems: results.length,
      accuracy: 0,
    };

    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-background to-violet-900/20" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-2xl mx-auto px-4"
          >
            <GlassPanel className="text-center p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>
              
              <h1 className="text-3xl font-bold mb-2">Diagnostic Complete!</h1>
              <p className="text-muted-foreground mb-8">
                Your solutions have been analyzed by AI. Here&apos;s your personalized assessment.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-3xl font-bold gradient-text">{displayReport.elo}</p>
                  <p className="text-sm text-muted-foreground">Calibrated ELO</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-3xl font-bold text-emerald-400">
                    {displayReport.problems_solved}/{displayReport.total_problems}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct Solutions</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-3xl font-bold text-cyan-400">{displayReport.accuracy}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>

              {report?.evaluations && report.evaluations.length > 0 && (
                <div className="mb-8 text-left">
                  <h3 className="text-lg font-semibold mb-4 text-center">Problem Results</h3>
                  <div className="space-y-3">
                    {report.evaluations.map((evaluation, index) => {
                      const prob = problems.find(p => p.id === evaluation.problem_id);
                      return (
                        <div 
                          key={index} 
                          className={cn(
                            "p-4 rounded-xl flex items-center gap-4",
                            evaluation.is_correct 
                              ? "bg-emerald-500/10 border border-emerald-500/20" 
                              : "bg-red-500/10 border border-red-500/20"
                          )}
                        >
                          {evaluation.is_correct ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{prob?.title || `Problem ${index + 1}`}</p>
                            <p className="text-sm text-muted-foreground">
                              {(evaluation.evaluation as { explanation?: string })?.explanation || 
                               (evaluation.is_correct ? "Correct solution" : "Needs improvement")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {displayReport.weak_categories && displayReport.weak_categories.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Areas to Focus On</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {displayReport.weak_categories.map((cat) => (
                      <CategoryTag key={cat} category={cat} color="#ef4444" />
                    ))}
                  </div>
                </div>
              )}
              
              <GlowButton onClick={() => router.push("/dashboard")} size="lg">
                View Your Dashboard
              </GlowButton>
            </GlassPanel>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  if (!problem) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-muted-foreground">No problems available. Please try again later.</p>
        </div>
      </AppShell>
    );
  }

  const getDifficultyLabel = (elo: number) => {
    if (elo < 1150) return "Easy";
    if (elo < 1350) return "Medium";
    return "Hard";
  };

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-4rem)] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-background to-cyan-900/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Diagnostic Assessment</h1>
              <div className="flex gap-2">
                {problems.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      completedProblems.includes(index)
                        ? "bg-emerald-500"
                        : index === currentProblem
                        ? "bg-violet-500"
                        : "bg-white/20"
                    )}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                timeRemaining < 60 ? "bg-red-500/20 text-red-400" : "bg-white/10"
              )}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
              </div>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-background">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
            <GlassPanel className="overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProblem}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-muted-foreground">
                      Problem {currentProblem + 1} of {problems.length}
                    </span>
                    <DifficultyPill difficulty={getDifficultyLabel(problem.difficulty_elo)} />
                    <CategoryTag category={problem.category} />
                  </div>
                  
                  <h2 className="text-xl font-bold mb-4">{problem.title}</h2>
                  <p className="text-muted-foreground mb-6 whitespace-pre-wrap">{problem.statement}</p>
                  
                  {problem.test_cases && problem.test_cases.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Examples:</h3>
                      {problem.test_cases.map((testCase, index) => (
                        <div key={index} className="p-4 rounded-lg bg-white/5 font-mono text-sm">
                          <p className="text-muted-foreground">Input: <span className="text-white">{testCase.input}</span></p>
                          <p className="text-muted-foreground">Output: <span className="text-emerald-400">{testCase.output}</span></p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </GlassPanel>

            <div className="flex flex-col gap-4">
              <GlassPanel className="flex-1 p-0 overflow-hidden">
                <MonacoEditor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={currentCode}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                  }}
                />
              </GlassPanel>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <GlowButton
                    variant="ghost"
                    onClick={() => setCurrentProblem(Math.max(0, currentProblem - 1))}
                    disabled={currentProblem === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </GlowButton>
                  <GlowButton
                    variant="ghost"
                    onClick={() => setCurrentProblem(Math.min(problems.length - 1, currentProblem + 1))}
                    disabled={currentProblem === problems.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </GlowButton>
                </div>
                
                <GlowButton onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {submitStatus || "Evaluating..."}
                    </>
                  ) : currentProblem === problems.length - 1 ? (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Finish & Analyze
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit & Next
                    </>
                  )}
                </GlowButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
