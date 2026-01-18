"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Brain,
  Code,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Home,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GlowButton, GlassPanel } from "@/components/ui/design-system";
import { cn } from "@/lib/utils";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface InterviewReport {
  id: string;
  status: string;
  performance_score: number;
  problem_solving_score: number;
  code_correctness_score: number;
  communication_score: number;
  time_efficiency_score: number;
  edge_cases_score: number;
  strengths: string[];
  weaknesses: string[];
  key_mistakes: string[];
  recommendations: string[];
  elo_change: number;
  duration_sec: number;
  overshoot_report: {
    timeline: { time: string; event: string; type: string }[];
    detailedAnalysis: string;
    codeSubmitted: string;
    correctAnswers: number;
    questionsAttempted: number;
    passed: boolean;
  };
  problems: {
    title: string;
    category: string;
    difficulty_elo: number;
  };
}

export default function InterviewReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const interviewId = searchParams.get("id");
  
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newElo, setNewElo] = useState<number>(1200);

  useEffect(() => {
    if (!interviewId) {
      router.push("/interview");
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/interviews?id=${interviewId}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
          // Calculate new ELO (would ideally come from API)
          setNewElo(1200 + (data.elo_change || 0));
        }
      } catch (err) {
        console.error("Failed to fetch report:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [interviewId, router]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg">Generating your report...</p>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
            <p className="text-muted-foreground mb-4">Unable to load the interview report.</p>
            <GlowButton onClick={() => router.push("/interview")}>
              Start New Interview
            </GlowButton>
          </div>
        </div>
      </AppShell>
    );
  }

  const passed = report.overshoot_report?.passed || report.performance_score >= 60;
  const correctAnswers = report.overshoot_report?.correctAnswers || 0;
  const questionsAttempted = report.overshoot_report?.questionsAttempted || 0;

  const radarData = [
    { subject: "Problem Solving", value: report.problem_solving_score, fullMark: 100 },
    { subject: "Code Quality", value: report.code_correctness_score, fullMark: 100 },
    { subject: "Communication", value: report.communication_score, fullMark: 100 },
    { subject: "Time Mgmt", value: report.time_efficiency_score, fullMark: 100 },
    { subject: "Edge Cases", value: report.edge_cases_score, fullMark: 100 },
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Result */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className={cn(
                "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center",
                passed ? "bg-green-500/20" : "bg-red-500/20"
              )}
            >
              {passed ? (
                <Trophy className="w-12 h-12 text-green-400" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-red-400" />
              )}
            </motion.div>
            
            <h1 className={cn(
              "text-4xl font-bold mb-2",
              passed ? "text-green-400" : "text-red-400"
            )}>
              {passed ? "Interview Passed! 🎉" : "Keep Practicing!"}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-2">
              {report.problems?.title} • {report.problems?.category}
            </p>
            
            {questionsAttempted > 0 && (
              <div className="flex items-center justify-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{correctAnswers}/{questionsAttempted} Questions Correct</span>
              </div>
            )}
          </motion.div>

          {/* Key Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <GlassPanel className="p-4 text-center">
              <div className="text-3xl font-bold text-violet-400 mb-1">
                {report.performance_score}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </GlassPanel>
            
            <GlassPanel className="p-4 text-center">
              <div className={cn(
                "text-3xl font-bold mb-1 flex items-center justify-center gap-1",
                report.elo_change >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {report.elo_change >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {report.elo_change >= 0 ? "+" : ""}{report.elo_change}
              </div>
              <div className="text-sm text-muted-foreground">ELO Change</div>
            </GlassPanel>
            
            <GlassPanel className="p-4 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {formatDuration(report.duration_sec)}
              </div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </GlassPanel>
            
            <GlassPanel className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-1">
                {newElo}
              </div>
              <div className="text-sm text-muted-foreground">New ELO</div>
            </GlassPanel>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skill Radar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassPanel className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-violet-400" />
                  Skill Breakdown
                </h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </GlassPanel>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassPanel className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Interview Timeline
                </h2>
                <div className="space-y-4">
                  {report.overshoot_report?.timeline?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                        item.type === "positive" ? "bg-green-400" :
                        item.type === "warning" ? "bg-amber-400" :
                        item.type === "negative" ? "bg-red-400" : "bg-white/30"
                      )} />
                      <div>
                        <div className="font-medium">{item.event}</div>
                        <div className="text-sm text-muted-foreground">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>

            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GlassPanel className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-400" />
                  Strengths
                </h2>
                <ul className="space-y-2">
                  {report.strengths?.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            </motion.div>

            {/* Areas to Improve */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <GlassPanel className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  Areas to Improve
                </h2>
                <ul className="space-y-2">
                  {report.weaknesses?.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            </motion.div>

            {/* Recommendations - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="lg:col-span-2"
            >
              <GlassPanel className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-violet-400" />
                  Recommendations
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {report.recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                      <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-violet-400">{i + 1}</span>
                      </div>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>

            {/* Analysis */}
            {report.overshoot_report?.detailedAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="lg:col-span-2"
              >
                <GlassPanel className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    Detailed Analysis
                  </h2>
                  <p className="text-white/80 leading-relaxed">
                    {report.overshoot_report.detailedAnalysis}
                  </p>
                </GlassPanel>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <GlowButton
              onClick={() => router.push("/interview")}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Another Interview
            </GlowButton>
            
            <button
              onClick={() => router.push("/practice")}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              Practice Problems
            </button>
            
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}


