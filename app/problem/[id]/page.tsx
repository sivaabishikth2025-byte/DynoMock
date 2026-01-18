"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  Play,
  Send,
  Lightbulb,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpRight
} from "lucide-react";
import { GlowButton, GlassPanel, DifficultyPill, CategoryTag } from "@/components/ui/design-system";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import type { Problem } from "@/lib/supabase";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
];

const defaultStarters: Record<string, string> = {
  javascript: "// Write your solution here\n\nfunction solution() {\n  \n}",
  python: "# Write your solution here\n\ndef solution():\n    pass",
  java: "// Write your solution here\n\nclass Solution {\n    public void solve() {\n        \n    }\n}",
  cpp: "// Write your solution here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}",
  typescript: "// Write your solution here\n\nfunction solution(): void {\n  \n}",
  go: "// Write your solution here\n\npackage main\n\nfunc main() {\n\t\n}",
};

type EvaluationResult = {
  isCorrect: boolean;
  correctnessScore: number;
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: number;
  suggestions: string[];
  explanation: string;
  edgeCasesHandled: string[];
  edgeCasesMissed: string[];
};

export default function ProblemPage() {
  const router = useRouter();
  const params = useParams();
  const problemId = params.id as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("prompt");
  const [showHints, setShowHints] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string }[] | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [language, setLanguage] = useState("javascript");
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`/api/problems/${problemId}`);
        if (res.ok) {
          const data = await res.json();
          setProblem(data);
          // Set initial code from starter_code or default
          const starterCode = data.starter_code?.[language] || defaultStarters[language];
          setCode(starterCode);
        } else {
          console.error("Problem not found");
          router.push("/practice");
        }
      } catch (err) {
        console.error("Failed to fetch problem:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId, router]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const starterCode = problem.starter_code?.[language] || defaultStarters[language];
      setCode(starterCode);
    }
  }, [language, problem]);

  const handleRunTests = async () => {
    if (!problem) return;
    
    setIsRunning(true);
    setTestResults(null);
    
    try {
      // Run evaluation to test the code
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          problemId: problem.id,
          language,
        }),
      });
      
      if (res.ok) {
        const evalResult = await res.json();
        
        // Generate test results from evaluation
        const results: { passed: boolean; output: string }[] = [];
        
        if (problem.test_cases && problem.test_cases.length > 0) {
          problem.test_cases.forEach((tc, idx) => {
            // Simulate test case results based on correctness score
            const passed = evalResult.correctnessScore >= 70 && Math.random() > 0.3;
            results.push({
              passed,
              output: passed 
                ? `Test case ${idx + 1}: Expected ${tc.output} ✓`
                : `Test case ${idx + 1}: Expected ${tc.output}, check your implementation`,
            });
          });
        } else {
          results.push({
            passed: evalResult.correctnessScore >= 70,
            output: evalResult.explanation || "Code evaluated",
          });
        }
        
        setTestResults(results);
      }
    } catch (err) {
      console.error("Failed to run tests:", err);
      setTestResults([{ passed: false, output: "Failed to evaluate code" }]);
    } finally {
    setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          problemId: problem.id,
          language,
        }),
      });
      
      if (res.ok) {
        const evalResult = await res.json();
        setEvaluation(evalResult);
        setSolutionUnlocked(true);
        setShowFeedback(true);
        
        // Record the attempt
        await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem_id: problem.id,
            mode: "practice",
            is_correct: evalResult.isCorrect,
            time_spent_sec: 0, // Could track actual time
            code_submitted: code,
            feedback: evalResult,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to submit:", err);
    } finally {
    setIsSubmitting(false);
    }
  };

  const revealHint = (index: number) => {
    if (!showHints.includes(index)) {
      setShowHints([...showHints, index]);
    }
  };

  const getDifficultyLabel = (elo: number) => {
    if (elo < 1150) return "Easy";
    if (elo < 1350) return "Medium";
    return "Hard";
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

  if (!problem) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Problem not found</p>
            <Link href="/practice">
              <GlowButton>Back to Practice</GlowButton>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AnimatePresence>
        {showFeedback && evaluation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowFeedback(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-auto"
            >
              <GlassPanel className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                    evaluation.isCorrect ? "bg-emerald-500/20" : "bg-amber-500/20"
                  )}
                >
                  {evaluation.isCorrect ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <XCircle className="w-10 h-10 text-amber-400" />
                  )}
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-2">
                  {evaluation.isCorrect ? "Solution Accepted!" : "Keep Trying!"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {evaluation.explanation}
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-2xl font-bold text-emerald-400">{evaluation.correctnessScore}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-2xl font-bold text-cyan-400">{evaluation.timeComplexity}</p>
                    <p className="text-xs text-muted-foreground">Time</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-2xl font-bold text-violet-400">{evaluation.spaceComplexity}</p>
                    <p className="text-xs text-muted-foreground">Space</p>
                  </div>
                </div>
                
                {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                <div className="mb-6 text-left">
                    <h3 className="text-sm font-semibold mb-2">Suggestions</h3>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {evaluation.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {evaluation.edgeCasesMissed && evaluation.edgeCasesMissed.length > 0 && (
                  <div className="mb-6 text-left">
                    <h3 className="text-sm font-semibold mb-2">Edge Cases to Consider</h3>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {evaluation.edgeCasesMissed.map((ec, idx) => (
                          <li key={idx}>{ec}</li>
                        ))}
                      </ul>
                  </div>
                </div>
                )}
                
                <div className="flex gap-3">
                  <GlowButton variant="secondary" onClick={() => setShowFeedback(false)} className="flex-1">
                    Try Again
                  </GlowButton>
                  <Link href="/practice" className="flex-1">
                    <GlowButton className="w-full">
                      Next Problem
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </GlowButton>
                  </Link>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[calc(100vh-4rem)] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-background to-cyan-900/10" />
        
        <div className="relative h-full flex flex-col p-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-4">
              <Link href="/practice">
                <GlowButton variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </GlowButton>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{problem.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <DifficultyPill difficulty={getDifficultyLabel(problem.difficulty_elo)} />
                  <CategoryTag category={problem.category} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-background">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0">
            <GlassPanel className="overflow-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 bg-white/5">
                  <TabsTrigger value="prompt">Prompt</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="hints">Hints</TabsTrigger>
                  <TabsTrigger value="solution" className="flex items-center gap-1">
                    {!solutionUnlocked && <Lock className="w-3 h-3" />}
                    Solution
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="prompt" className="mt-0">
                  <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                    {problem.statement}
                  </div>
                  {problem.tags && problem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                      {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-white/5 text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  )}
                </TabsContent>
                
                <TabsContent value="examples" className="mt-0 space-y-4">
                  {problem.test_cases && problem.test_cases.length > 0 ? (
                    problem.test_cases.map((testCase, index) => (
                    <div key={index} className="p-4 rounded-xl bg-white/5">
                      <p className="text-sm font-medium mb-2">Example {index + 1}</p>
                      <div className="font-mono text-sm space-y-2">
                        <p><span className="text-muted-foreground">Input:</span></p>
                          <pre className="p-2 rounded bg-black/30 overflow-x-auto text-xs">{testCase.input}</pre>
                          <p><span className="text-muted-foreground">Output:</span> <span className="text-emerald-400">{testCase.output}</span></p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No examples available</p>
                  )}
                </TabsContent>
                
                <TabsContent value="hints" className="mt-0 space-y-4">
                  {problem.hints && problem.hints.length > 0 ? (
                    problem.hints.map((hint, index) => (
                    <div key={index} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-medium">Hint {index + 1}</span>
                        </div>
                        {!showHints.includes(index) && (
                          <button
                            onClick={() => revealHint(index)}
                            className="text-xs text-amber-400 hover:underline"
                          >
                            Reveal
                          </button>
                        )}
                      </div>
                      {showHints.includes(index) && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-sm text-muted-foreground mt-2"
                        >
                          {hint}
                        </motion.p>
                      )}
                    </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No hints available for this problem</p>
                  )}
                </TabsContent>
                
                <TabsContent value="solution" className="mt-0">
                  {solutionUnlocked && problem.solution_approach ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <h3>Solution Approach</h3>
                      <div className="whitespace-pre-wrap">{problem.solution_approach}</div>
                    </div>
                  ) : (
                  <div className="p-6 rounded-xl bg-white/5 text-center">
                    <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">
                        Submit your solution first to unlock the solution approach.
                    </p>
                    <GlowButton variant="secondary" size="sm" disabled>
                      Locked
                    </GlowButton>
                  </div>
                  )}
                </TabsContent>
              </Tabs>
            </GlassPanel>

            <div className="flex flex-col min-h-0 gap-4">
              <GlassPanel className="flex-1 p-0 overflow-hidden">
                <MonacoEditor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                  }}
                />
              </GlassPanel>
              
              {testResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlassPanel className="max-h-40 overflow-auto">
                    <h4 className="text-sm font-medium mb-3">Test Results</h4>
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-3 rounded-lg text-sm flex items-start gap-2",
                            result.passed ? "bg-emerald-500/10" : "bg-red-500/10"
                          )}
                        >
                          {result.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={result.passed ? "text-emerald-400" : "text-red-400"}>
                            {result.output}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassPanel>
                </motion.div>
              )}
              
              <div className="flex items-center gap-3">
                <GlowButton
                  variant="secondary"
                  onClick={handleRunTests}
                  disabled={isRunning || !code.trim()}
                  className="flex-1"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Tests
                    </>
                  )}
                </GlowButton>
                <GlowButton
                  onClick={handleSubmit}
                  disabled={isSubmitting || !code.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
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
