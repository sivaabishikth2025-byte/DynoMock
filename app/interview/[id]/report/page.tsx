"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  Share2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Play,
  Loader2
} from "lucide-react";
import { GlowButton, GlassPanel, CircularGauge, Timeline } from "@/components/ui/design-system";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";

type InterviewReport = {
  id: string;
  problem: string;
  category: string;
  difficulty_elo: number;
  date: string;
  duration: string;
  duration_sec: number;
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
  transcript: { time: string; speaker: string; text: string }[];
  timeline: { time: string; event: string; type: string }[];
  elo_change: number;
  status: string;
};

export default function InterviewReportPage() {
  const params = useParams();
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/interviews/${params.id}/report`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        }
      } catch (err) {
        console.error("Failed to fetch report:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchReport();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Report not found</p>
            <Link href="/dashboard">
              <GlowButton>Go to Dashboard</GlowButton>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-4rem)] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-background to-emerald-900/10" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <GlowButton variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </GlowButton>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <GlowButton variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </GlowButton>
              <GlowButton variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </GlowButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-2">Interview Report</h1>
            <p className="text-muted-foreground">{report.problem}</p>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {report.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {report.duration}
              </span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <GlassPanel className="text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-6">Overall Score</h3>
                <CircularGauge 
                  value={report.performance_score} 
                  size={160} 
                  strokeWidth={12}
                  className="mx-auto"
                />
                <div className={cn(
                  "inline-flex items-center gap-1 mt-6 px-3 py-1 rounded-full text-sm",
                  report.elo_change >= 0 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/20 text-red-400"
                )}>
                  {report.elo_change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {report.elo_change >= 0 ? "+" : ""}{report.elo_change} ELO
                </div>
              </GlassPanel>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <GlassPanel>
                <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Problem Solving", score: report.problem_solving_score },
                    { label: "Code Correctness", score: report.code_correctness_score },
                    { label: "Communication", score: report.communication_score },
                    { label: "Time Efficiency", score: report.time_efficiency_score },
                    { label: "Edge Cases", score: report.edge_cases_score },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className={cn(
                        "font-semibold",
                        item.score >= 70 ? "text-emerald-400" :
                        item.score >= 50 ? "text-amber-400" : "text-red-400"
                      )}>
                        {item.score}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>
          </div>

          {report.timeline && report.timeline.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-8"
            >
              <GlassPanel>
                <h3 className="text-lg font-semibold mb-4">Interview Timeline</h3>
                <Timeline items={report.timeline} />
              </GlassPanel>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {report.key_mistakes && report.key_mistakes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <GlassPanel>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold">Key Mistakes</h3>
                  </div>
                  <div className="space-y-3">
                    {report.key_mistakes.map((mistake, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                      >
                        <p className="text-sm">{mistake}</p>
                      </motion.div>
                    ))}
                  </div>
                </GlassPanel>
              </motion.div>
            )}

            {report.strengths && report.strengths.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <GlassPanel>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold">What You Did Well</h3>
                  </div>
                  <div className="space-y-3">
                    {report.strengths.map((strength, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                      >
                        <p className="text-sm">{strength}</p>
                      </motion.div>
                    ))}
                  </div>
                </GlassPanel>
              </motion.div>
            )}
          </div>

          {report.transcript && report.transcript.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <GlassPanel>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-violet-400" />
                  <h3 className="text-lg font-semibold">Transcript Highlights</h3>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-auto">
                  {report.transcript.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={cn(
                        "p-4 rounded-xl flex gap-4",
                        item.speaker === "AI" 
                          ? "bg-violet-500/10 border border-violet-500/20" 
                          : "bg-cyan-500/10 border border-cyan-500/20"
                      )}
                    >
                      <div className="flex-shrink-0">
                        <span className="text-xs font-mono text-muted-foreground">{item.time}</span>
                      </div>
                      <div>
                        <p className={cn(
                          "text-xs font-medium mb-1",
                          item.speaker === "AI" ? "text-violet-400" : "text-cyan-400"
                        )}>
                          {item.speaker === "AI" ? "AI Interviewer" : "You"}
                        </p>
                        <p className="text-sm">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {report.recommendations && report.recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <GlassPanel>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold">Recommendations</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {report.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                    >
                      <p className="text-sm">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <GlassPanel className="py-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10" />
              <div className="relative">
                <h2 className="text-2xl font-bold mb-2">Ready to improve?</h2>
                <p className="text-muted-foreground mb-6">
                  Practice more problems to strengthen your weak areas.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/practice">
                    <GlowButton variant="secondary">
                      Browse Problems
                    </GlowButton>
                  </Link>
                  <Link href="/interview">
                    <GlowButton>
                      Start New Interview
                    </GlowButton>
                  </Link>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
