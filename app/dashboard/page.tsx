"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  Zap,
  Clock,
  ChevronRight,
  ChevronLeft,
  Flame,
  Loader2,
  Trophy,
  BookOpen,
  Mic,
  Calendar,
  Award,
  BarChart3,
  Shield,
  Lock,
  Bug,
  Code,
  Server,
  Terminal,
  Cpu,
  Database,
  Activity,
  CheckCircle,
  AlertTriangle,
  Play,
  Briefcase
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import type { Problem } from "@/lib/supabase";
import { getUserField, getFieldDisplayName, FIELD_DISPLAY_NAMES } from "@/lib/userPreferences";

// Achievement icons mapping
const achievementIcons: Record<string, any> = {
  "first-steps": Trophy,
  "problem-solver": Target,
  "on-fire": Flame,
  "interview-ready": Mic,
  "consistent": Calendar,
  "expert": Award,
};

interface DashboardStats {
  user: {
    name: string;
    current_elo: number;
    category_strengths: Record<string, number>;
    weak_categories: string[];
  };
  stats: {
    problemsSolved: number;
    totalProblems: number;
    accuracy: number;
    streak: number;
    interviewsPassed: number;
    totalInterviews: number;
    totalInterviewAttempts: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
  }>;
  recentActivity: Array<{
    id: string;
    problemId: string;
    title: string;
    category: string;
    score: number;
    createdAt: string;
  }>;
  eloHistory: Array<{ date: string; value: number }>;
  categoryPerformance: Array<{ name: string; value: number }>;
  focusAreas: string[];
  strengths: string[];
}

// Cyber Panel Component
const CyberPanel = ({ 
  children, 
  className = "", 
  glowColor = "primary",
  title,
  icon: Icon,
  badge
}: { 
  children: React.ReactNode; 
  className?: string;
  glowColor?: "primary" | "secondary" | "danger" | "warning";
  title?: string;
  icon?: any;
  badge?: string;
}) => {
  const colors = {
    primary: { border: "border-[#00ff88]/30", glow: "shadow-[0_0_30px_rgba(0,255,136,0.15)]", text: "text-[#00ff88]" },
    secondary: { border: "border-[#00d4ff]/30", glow: "shadow-[0_0_30px_rgba(0,212,255,0.15)]", text: "text-[#00d4ff]" },
    danger: { border: "border-red-500/30", glow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]", text: "text-red-500" },
    warning: { border: "border-amber-500/30", glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]", text: "text-amber-500" },
  };

  return (
    <div className={cn(
      "relative bg-[#0f1419]/90 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300",
      colors[glowColor].border,
      colors[glowColor].glow,
      "border-2 hover:border-opacity-60",
      className
    )}>
      {/* Top border glow line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[2px]",
        glowColor === "primary" && "bg-gradient-to-r from-transparent via-[#00ff88] to-transparent",
        glowColor === "secondary" && "bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent",
        glowColor === "danger" && "bg-gradient-to-r from-transparent via-red-500 to-transparent",
        glowColor === "warning" && "bg-gradient-to-r from-transparent via-amber-500 to-transparent",
        "opacity-60"
      )} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />

      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            {Icon && <Icon className={cn("w-5 h-5", colors[glowColor].text)} />}
            <span className="font-mono text-sm font-semibold tracking-wider uppercase">{title}</span>
          </div>
          {badge && (
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-mono font-bold",
              "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30"
            )}>
              {badge}
            </span>
          )}
        </div>
      )}
      
      <div className="relative p-5">
        {children}
      </div>
    </div>
  );
};

// Cyber Stat Card Component
const CyberStatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  status = "active",
  progress,
  chart
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  status?: "active" | "warning" | "danger";
  progress?: number;
  chart?: React.ReactNode;
}) => {
  const statusColors = {
    active: { bg: "bg-[#00ff88]/10", border: "border-[#00ff88]/30", text: "text-[#00ff88]", glow: "shadow-[0_0_20px_rgba(0,255,136,0.2)]" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-500", glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]" },
    danger: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-500", glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "relative bg-[#0f1419]/90 backdrop-blur-xl rounded-xl p-5 overflow-hidden transition-all duration-300",
        statusColors[status].border,
        statusColors[status].glow,
        "border-2 hover:border-opacity-80 group"
      )}
    >
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        status === "active" && "bg-gradient-to-br from-[#00ff88]/5 to-transparent",
        status === "warning" && "bg-gradient-to-br from-amber-500/5 to-transparent",
        status === "danger" && "bg-gradient-to-br from-red-500/5 to-transparent"
      )} />

      {/* Scan line effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff88]/50 to-transparent animate-pulse" />

      <div className="relative flex items-start justify-between mb-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
          statusColors[status].bg,
          statusColors[status].border,
          "border group-hover:scale-110"
        )}>
          <Icon className={cn("w-6 h-6", statusColors[status].text)} />
        </div>
        <span className={cn(
          "text-xs font-mono uppercase tracking-wider px-2 py-1 rounded",
          statusColors[status].bg,
          statusColors[status].text
        )}>
          {status.toUpperCase()}
        </span>
      </div>

      <div className="relative">
        <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-3xl font-bold font-mono",
            statusColors[status].text
          )}>
            {value}
          </span>
          {subValue && (
            <span className="text-sm text-slate-500">{subValue}</span>
          )}
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className={cn(
                "h-full rounded-full",
                status === "active" && "bg-gradient-to-r from-[#00ff88] to-[#00d4ff]",
                status === "warning" && "bg-gradient-to-r from-amber-500 to-orange-500",
                status === "danger" && "bg-gradient-to-r from-red-500 to-red-400"
              )}
              style={{ boxShadow: status === "active" ? "0 0 10px #00ff88" : undefined }}
            />
          </div>
        </div>
      )}

      {chart && (
        <div className="mt-3 h-12 min-w-0 w-full">
          {chart}
        </div>
      )}
    </motion.div>
  );
};

// Terminal Line Component
const TerminalLine = ({ 
  prompt = "$", 
  command, 
  output, 
  success,
  delay = 0
}: { 
  prompt?: string; 
  command?: string; 
  output?: string;
  success?: boolean;
  delay?: number;
}) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="font-mono text-sm mb-1"
  >
    {command && (
      <div className="flex items-center gap-2">
        <span className="text-[#00ff88]">{prompt}</span>
        <span className="text-slate-300">{command}</span>
      </div>
    )}
    {output && (
      <div className={cn(
        "ml-4",
        success === true && "text-[#00ff88]",
        success === false && "text-red-400",
        success === undefined && "text-slate-400"
      )}>
        {output}
      </div>
    )}
  </motion.div>
);

// Operations Slider Component
const OperationsSlider = ({ problems }: { problems: Problem[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = Math.min(problems.length, 5);

  const operations = [
    { icon: Shield, title: "Array Operations", color: "from-[#00ff88]/20 to-[#00d4ff]/10", metric: "500+", metricLabel: "Solved" },
    { icon: Lock, title: "String Algorithms", color: "from-[#00d4ff]/20 to-[#00ff88]/10", metric: "98%", metricLabel: "Accuracy" },
    { icon: Bug, title: "Tree Traversal", color: "from-red-500/20 to-[#00ff88]/10", metric: "1000+", metricLabel: "Tests" },
    { icon: Code, title: "Dynamic Programming", color: "from-amber-500/20 to-[#00d4ff]/10", metric: "24/7", metricLabel: "Practice" },
    { icon: Database, title: "Graph Algorithms", color: "from-purple-500/20 to-[#00ff88]/10", metric: "99%", metricLabel: "Secure" },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border-2 border-[#00ff88]/20 bg-[#0a0e1a]">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {operations.map((op, i) => (
            <div key={i} className="min-w-full p-8">
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", op.color)} />
              <div className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-[#00ff88]/50 flex items-center justify-center bg-[#00ff88]/10">
                  <op.icon className="w-10 h-10 text-[#00ff88]" />
                </div>
                <h3 className="text-2xl font-bold font-mono text-[#00ff88] mb-2">{op.title}</h3>
                <p className="text-slate-400 mb-4">Master algorithmic challenges</p>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#00d4ff] font-mono">{op.metric}</span>
                    <p className="text-xs text-slate-500 uppercase">{op.metricLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button 
          onClick={prevSlide}
          className="w-10 h-10 rounded-full border-2 border-[#00ff88]/30 bg-[#00ff88]/10 flex items-center justify-center hover:bg-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[#00ff88]" />
        </button>
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                i === currentSlide 
                  ? "bg-[#00ff88] shadow-[0_0_10px_#00ff88]" 
                  : "bg-slate-600 hover:bg-slate-500"
              )}
            />
          ))}
        </div>
        <button 
          onClick={nextSlide}
          className="w-10 h-10 rounded-full border-2 border-[#00ff88]/30 bg-[#00ff88]/10 flex items-center justify-center hover:bg-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all"
        >
          <ChevronRight className="w-5 h-5 text-[#00ff88]" />
        </button>
      </div>
      
      {/* Counter */}
      <div className="flex items-center justify-between mt-4 px-2">
        <span className="font-mono text-[#00ff88]">
          <span className="text-lg">{String(currentSlide + 1).padStart(2, '0')}</span>
          <span className="text-slate-500 mx-2">/</span>
          <span className="text-slate-500">{String(totalSlides).padStart(2, '0')}</span>
        </span>
        <div className="flex-1 mx-4 h-1 bg-[#00ff88]/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff]"
            animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            style={{ boxShadow: "0 0 10px #00ff88" }}
          />
        </div>
      </div>
    </div>
  );
};

// Matrix Background Component
const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    function draw() {
      if (!ctx || !canvas) return;
      
      ctx.fillStyle = 'rgba(10, 14, 26, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff88';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        ctx.fillText(text, x, y);
        
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 35);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none opacity-30 z-0"
    />
  );
};

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [userField, setUserField] = useState<string>("SWE");

  useEffect(() => {
    // Get user's field from localStorage
    const field = getUserField();
    setUserField(field);

    const fetchData = async () => {
      try {
        // Simulate loading progress
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => Math.min(prev + Math.random() * 20, 90));
        }, 100);

        const [statsRes, problemsRes] = await Promise.all([
          fetch(`/api/dashboard/stats?field=${field}`),
          fetch(`/api/problems?field=${field}&recommended=true&limit=6`),
        ]);
        
        clearInterval(progressInterval);
        setLoadingProgress(100);
        
        if (statsRes.ok) {
          const data = await statsRes.json();
          setDashboardData(data);
        } else {
          setError("Failed to load dashboard data");
        }
        
        if (problemsRes.ok) {
          const problemsData = await problemsRes.json();
          setProblems(problemsData);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to connect to server");
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] bg-[#050810] flex items-center justify-center relative overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
          
          <div className="relative z-10 w-full max-w-xl px-6">
            {/* Terminal loader */}
            <div className="bg-[#0f1419]/95 border-2 border-[#00ff88]/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.2)]">
              {/* Terminal header */}
              <div className="bg-[#00ff88]/10 px-4 py-3 flex items-center gap-3 border-b border-[#00ff88]/20">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-[#00ff88]" />
                </div>
                <span className="font-mono text-sm text-[#00ff88] tracking-wider">SYSTEM INITIALIZATION</span>
              </div>
              
              {/* Terminal body */}
              <div className="p-6 font-mono text-sm space-y-2">
                <TerminalLine prompt="root@dyno:~$" command="./init_dashboard.sh" delay={0} />
                <TerminalLine output="[INFO] Loading user profile..." delay={0.2} />
                <TerminalLine output="[INFO] Fetching ELO data..." delay={0.4} />
                <TerminalLine output="[INFO] Analyzing performance metrics..." delay={0.6} />
                <TerminalLine output="[INFO] Compiling achievements..." delay={0.8} />
                {loadingProgress >= 100 && (
                  <TerminalLine output="[SUCCESS] Dashboard ready. Access granted." success={true} delay={1} />
                )}
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-[#00ff88]">$</span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="px-6 pb-6">
                <div className="h-2 bg-[#00ff88]/10 rounded-full overflow-hidden border border-[#00ff88]/20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff]"
                    animate={{ width: `${loadingProgress}%` }}
                    style={{ boxShadow: "0 0 20px #00ff88" }}
                  />
                </div>
                <div className="text-center mt-3 font-mono text-[#00ff88]">
                  {Math.floor(loadingProgress)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !dashboardData) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] bg-[#050810] flex items-center justify-center">
          <CyberPanel glowColor="danger" className="max-w-md mx-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 border-2 border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-500 font-mono mb-2">CONNECTION FAILED</h3>
              <p className="text-slate-400 mb-6">{error || "Unable to establish secure connection"}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-[#050810] font-bold font-mono rounded-lg hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] transition-all"
              >
                RETRY CONNECTION
              </button>
            </div>
          </CyberPanel>
        </div>
      </AppShell>
    );
  }

  const { user, stats, achievements, recentActivity, eloHistory, categoryPerformance, focusAreas, strengths } = dashboardData;

  const getEloTier = (elo: number) => {
    if (elo < 1000) return { name: "BRONZE", color: "text-amber-600" };
    if (elo < 1200) return { name: "SILVER", color: "text-slate-400" };
    if (elo < 1400) return { name: "GOLD", color: "text-yellow-500" };
    if (elo < 1600) return { name: "PLATINUM", color: "text-cyan-400" };
    return { name: "DIAMOND", color: "text-violet-400" };
  };

  const tier = getEloTier(user.current_elo);

  const eloChange = eloHistory.length >= 2 
    ? eloHistory[eloHistory.length - 1].value - eloHistory[0].value 
    : 0;

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-4rem)] bg-[#050810] relative">
        {/* Matrix Background */}
        <MatrixBackground />
        
        {/* Grid Overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{
          backgroundImage: `linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        {/* Scan Line */}
        <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-50 animate-pulse z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          
          {/* Hero Section with Terminal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_10px_#00ff88]" />
                <span className="font-mono text-[#00ff88] text-sm tracking-widest uppercase">
                  Security Protocol Active • Welcome back, {user.name || "Operator"}
                </span>
              </div>
              
              {/* Field Badge */}
              <Link href="/onboarding">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0f1a15]/80 border border-[#00ff88]/30 rounded-lg cursor-pointer hover:border-[#00ff88]/60 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-[#00ff88]" />
                  <span className="font-mono text-sm text-[#00ff88]">
                    {FIELD_DISPLAY_NAMES[userField] || userField}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#00ff88]/60" />
                </motion.div>
              </Link>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold font-mono mb-2">
              <span className="text-white">COMMAND</span>{" "}
              <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                CENTER
              </span>
            </h1>
            <p className="text-slate-400 font-mono">
              {FIELD_DISPLAY_NAMES[userField] || userField} • Performance metrics • Interview analytics
            </p>
          </motion.div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <CyberStatCard
              icon={Activity}
              label="ELO Rating"
              value={user.current_elo}
              subValue={eloChange >= 0 ? `+${eloChange}` : `${eloChange}`}
              status="active"
              chart={
                <ResponsiveContainer width="100%" height={48} minWidth={100}>
                    <LineChart data={eloHistory}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                      stroke="#00ff88" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
              }
            />
            
            <CyberStatCard
              icon={Server}
              label="Problems Solved"
              value={stats.problemsSolved}
              subValue={`/ ${stats.totalProblems}`}
              status="active"
              progress={(stats.problemsSolved / stats.totalProblems) * 100}
            />
            
            <CyberStatCard
              icon={Flame}
              label="Current Streak"
              value={stats.streak}
              subValue="days"
              status={stats.streak >= 3 ? "active" : "warning"}
            />
            
            <CyberStatCard
              icon={Mic}
              label="Interviews Passed"
              value={stats.interviewsPassed}
              subValue={`/ ${stats.totalInterviews || stats.totalInterviewAttempts}`}
              status="active"
              progress={stats.totalInterviews > 0 ? (stats.interviewsPassed / stats.totalInterviews) * 100 : 0}
            />
                </div>

          {/* Security Monitor Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* ELO Monitor */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <CyberPanel title="Security Dashboard" icon={Shield} badge={tier.name} glowColor="primary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left - Main ELO Display */}
                  <div className="text-center md:text-left">
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">Current Rating</p>
                    <div className="flex items-baseline gap-3 justify-center md:justify-start mb-4">
                      <span className="text-6xl font-bold font-mono text-[#00ff88]" style={{ textShadow: "0 0 30px rgba(0,255,136,0.5)" }}>
                        {user.current_elo}
                      </span>
                      <span className={cn("text-lg font-mono", eloChange >= 0 ? "text-[#00ff88]" : "text-red-500")}>
                        {eloChange >= 0 ? "↗" : "↘"} {Math.abs(eloChange)}
                      </span>
                    </div>
                    
                <div className="space-y-3">
                      {[
                        { label: "Accuracy Rate", value: `${stats.accuracy}%`, status: "OPTIMAL" },
                        { label: "Interview Success", value: `${stats.totalInterviews > 0 ? Math.round((stats.interviewsPassed / stats.totalInterviews) * 100) : 0}%`, status: "ACTIVE" },
                        { label: "Skill Level", value: tier.name, status: "VERIFIED" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                          <span className="text-sm text-slate-400 font-mono">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#00ff88] font-mono font-bold">{item.value}</span>
                            <span className="text-xs text-[#00ff88]/60 font-mono">[{item.status}]</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right - ELO Chart */}
                  <div className="h-48 min-w-0 w-full">
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">Rating History</p>
                    <ResponsiveContainer width="100%" height={160} minWidth={100}>
                      <LineChart data={eloHistory}>
                        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 20, 25, 0.95)",
                            border: "1px solid rgba(0, 255, 136, 0.3)",
                            borderRadius: "8px",
                            fontFamily: "monospace"
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#00ff88" 
                          strokeWidth={2}
                          dot={{ fill: '#00ff88', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                      </div>
                </div>
              </CyberPanel>
            </motion.div>

            {/* Quick Actions Terminal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CyberPanel title="Quick Actions" icon={Terminal} glowColor="secondary">
                <div className="space-y-3">
                  {[
                    { icon: Mic, label: "Start Interview", href: "/interview", color: "from-[#00ff88] to-[#00d4ff]" },
                    { icon: BookOpen, label: "Practice Problems", href: "/practice", color: "from-[#00d4ff] to-[#00ff88]" },
                    { icon: Target, label: "Run Diagnostic", href: "/diagnostic", color: "from-amber-500 to-orange-500" },
                  ].map((action, i) => (
                    <Link key={i} href={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-black/30 border border-white/5 hover:border-[#00ff88]/30 transition-all group cursor-pointer"
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                          action.color,
                          "group-hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                        )}>
                          <action.icon className="w-5 h-5 text-[#050810]" />
                        </div>
                        <span className="font-mono text-sm text-slate-300 group-hover:text-[#00ff88] transition-colors">
                          {action.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#00ff88] ml-auto transition-colors" />
                      </motion.div>
                    </Link>
                  ))}
                </div>
                
                {/* System Status */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-500 font-mono mb-2">SYSTEM STATUS</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                    <span className="text-xs font-mono text-[#00ff88]">All systems operational</span>
                      </div>
                </div>
              </CyberPanel>
            </motion.div>
          </div>

          {/* Achievements Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <CyberPanel 
              title="Achievements Unlocked" 
              icon={Award} 
              badge={`${achievements.filter(a => a.unlocked).length}/${achievements.length}`}
              glowColor="warning"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {achievements.map((achievement, i) => {
                  const IconComponent = achievementIcons[achievement.id] || Trophy;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        achievement.unlocked 
                          ? "bg-[#00ff88]/5 border-[#00ff88]/30 hover:border-[#00ff88]/60 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]" 
                          : "bg-white/5 border-white/10 opacity-40"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-2",
                        achievement.unlocked ? "bg-[#00ff88]/20 border border-[#00ff88]/30" : "bg-white/10"
                      )}>
                        <IconComponent className={cn(
                          "w-6 h-6",
                          achievement.unlocked ? "text-[#00ff88]" : "text-white/40"
                        )} />
                      </div>
                      <h4 className="font-mono text-xs font-bold mb-1 truncate">{achievement.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{achievement.description}</p>
                    </motion.div>
                  );
                })}
                  </div>
            </CyberPanel>
            </motion.div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Category Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CyberPanel title="Category Analysis" icon={BarChart3} glowColor="secondary">
                <div className="h-[250px] min-w-0 w-full">
                  {categoryPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250} minWidth={100}>
                      <BarChart data={categoryPerformance} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 20, 25, 0.95)",
                            border: "1px solid rgba(0, 212, 255, 0.3)",
                            borderRadius: "8px",
                            fontFamily: "monospace"
                          }}
                          formatter={(value) => [`${value}%`, "Performance"]}
                        />
                        <Bar dataKey="value" fill="#00d4ff" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 font-mono text-sm">No data available</p>
                        <p className="text-slate-600 text-xs">Complete problems to see analysis</p>
                      </div>
                    </div>
                  )}
                </div>
              </CyberPanel>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <CyberPanel title="Activity Log" icon={Calendar} glowColor="primary">
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((item, i) => (
                      <Link key={item.id || i} href={`/problem/${item.problemId}`}>
                      <motion.div
                          initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/5 hover:border-[#00ff88]/30 transition-all cursor-pointer group"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            item.score >= 70 ? "bg-[#00ff88]/20 border border-[#00ff88]/30" : "bg-red-500/20 border border-red-500/30"
                          )}>
                            {item.score >= 70 ? (
                              <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-slate-300 truncate group-hover:text-[#00ff88] transition-colors">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">{item.category}</p>
                          </div>
                          <span className={cn(
                            "text-xs font-mono font-bold",
                            item.score >= 70 ? "text-[#00ff88]" : "text-red-500"
                          )}>
                            {item.score}%
                          </span>
                        </motion.div>
                        </Link>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 font-mono text-sm">No recent activity</p>
                      <p className="text-slate-600 text-xs">Start solving problems to track progress</p>
                    </div>
                  )}
                </div>
              </CyberPanel>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0a0e1a] to-[#0f1419] border-2 border-[#00ff88]/20">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-[#00d4ff]/5" />
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)`,
                backgroundSize: '30px 30px'
              }} />
              
              <div className="relative text-center py-16 px-6">
                <motion.div 
                  animate={{ 
                    boxShadow: ["0 0 30px rgba(0,255,136,0.3)", "0 0 50px rgba(0,255,136,0.5)", "0 0 30px rgba(0,255,136,0.3)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center"
                >
                  <Zap className="w-10 h-10 text-[#050810]" />
                </motion.div>
                
                <h2 className="text-3xl font-bold font-mono mb-3">
                  <span className="text-white">READY FOR</span>{" "}
                  <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                    COMBAT?
                  </span>
                </h2>
                <p className="text-slate-400 font-mono mb-8 max-w-md mx-auto">
                  Initialize mock interview protocol with advanced AI assessment system.
                </p>
                
                <Link href="/interview">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,255,136,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-[#050810] font-bold font-mono text-lg rounded-xl inline-flex items-center gap-3 transition-all"
                  >
                    <Play className="w-5 h-5" />
                    INITIALIZE INTERVIEW
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 font-mono text-xs">
              © 2025 Dyno Mock • All systems secured • Interview Protocol v2.0
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
