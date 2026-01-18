"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { 
  Zap, 
  Mic, 
  BarChart3, 
  Brain, 
  Target, 
  Trophy,
  ChevronRight,
  Play,
  Sparkles,
  User
} from "lucide-react";
import { GlowButton, GlassPanel, GradientCard } from "@/components/ui/design-system";
import { AppShell } from "@/components/AppShell";
import { ProfileCard } from "@/components/ProfileCard";

const TunnelBackground = dynamic(
  () => import("@/components/three/TunnelBackground").then((mod) => mod.TunnelBackground),
  { ssr: false }
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const features = [
  {
    icon: Mic,
    title: "Voice-First AI Interview",
    description: "Talk naturally. Our AI listens, responds, and adapts in real-time just like a real interviewer.",
    color: "#22d3ee"
  },
  {
    icon: BarChart3,
    title: "ELO Rating System",
    description: "Track your progress with a competitive rating that reflects your true interview readiness.",
    color: "#a78bfa"
  },
  {
    icon: Brain,
    title: "Personalized Learning",
    description: "AI identifies your weak spots and creates a custom practice plan to maximize improvement.",
    color: "#34d399"
  },
  {
    icon: Target,
    title: "Real Company Prep",
    description: "Practice with questions from Google, Meta, Amazon, and 100+ top tech companies.",
    color: "#f472b6"
  }
];

const showcaseItems = [
  {
    title: "Live Coding Sessions",
    description: "Write, run, and debug code in real-time with AI feedback",
    gradient: "from-cyan-500/20 to-blue-500/20"
  },
  {
    title: "System Design Boards",
    description: "Whiteboard your architecture with AI guidance",
    gradient: "from-violet-500/20 to-purple-500/20"
  },
  {
    title: "Behavioral Prep",
    description: "Master the STAR method with AI-powered mock interviews",
    gradient: "from-emerald-500/20 to-teal-500/20"
  }
];

export default function LandingPage() {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <AppShell>
      <ProfileCard isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <div className="relative overflow-hidden min-h-screen">
        {/* 3D Tunnel Background */}
        <div className="fixed inset-0 z-0">
          <TunnelBackground />
        </div>
        
        {/* Gradient overlays */}
        <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-[1]" />
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none z-[1]" />
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none z-[1]" />
        
        <section className="relative min-h-[90vh] flex items-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div variants={item} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-white/70">Now with Qwen3 powered interviews</span>
                </span>
              </motion.div>
              
              <motion.h1 
                variants={item}
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              >
                Your AI
                <span className="gradient-text block">Interview Simulator</span>
              </motion.h1>
              
              <motion.p 
                variants={item}
                className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
              >
                Practice technical interviews with an AI that talks back. 
                Get real-time feedback, track your ELO, and land your dream job.
              </motion.p>
              
              <motion.div 
                variants={item}
                className="flex flex-col gap-4 items-center"
              >
                {/* Primary CTA - Get Started / Onboarding */}
                <Link href="/onboarding">
                  <GlowButton size="lg" className="w-full sm:w-auto px-8">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Get Started - Choose Your Path
                    </span>
                  </GlowButton>
                </Link>
                
                {/* Secondary Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link href="/diagnostic">
                    <GlowButton variant="secondary" size="lg" className="w-full sm:w-auto">
                      <span className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Start Diagnostic
                      </span>
                    </GlowButton>
                  </Link>
                  <Link href="/interview">
                    <GlowButton variant="secondary" size="lg" className="w-full sm:w-auto">
                      <span className="flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Start Mock Interview
                      </span>
                    </GlowButton>
                  </Link>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <User className="w-5 h-5 text-cyan-400" />
                    <span className="text-white/80 font-medium group-hover:text-white transition-colors">
                      View Profile
                    </span>
                  </button>
                </div>
              </motion.div>
              
              <motion.div 
                variants={item}
                className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>10,000+ interviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Real-time feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span>AI-powered</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="relative py-24 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything you need to
                <span className="gradient-text"> ace your interview</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform provides comprehensive preparation for technical interviews at top tech companies.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassPanel hover className="h-full">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Practice like you&apos;re
                <span className="gradient-text"> in the interview</span>
              </h2>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {showcaseItems.map((showcase, index) => (
                <motion.div
                  key={showcase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GradientCard 
                    gradientFrom={showcase.gradient.split(" ")[0]}
                    gradientTo={showcase.gradient.split(" ")[1]}
                    className="h-full"
                  >
                    <div className="aspect-video bg-background/50 rounded-lg mb-4 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white/70" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{showcase.title}</h3>
                    <p className="text-sm text-muted-foreground">{showcase.description}</p>
                  </GradientCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <GlassPanel className="text-center py-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to ace your next interview?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Start with a quick diagnostic to identify your strengths and weaknesses, 
                  then let our AI create a personalized practice plan.
                </p>
                <Link href="/onboarding">
                  <GlowButton size="lg">
                    <span className="flex items-center gap-2">
                      Get Started Free
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </GlowButton>
                </Link>
              </div>
            </GlassPanel>
          </div>
        </section>

        <footer className="relative py-12 border-t border-white/5 z-10 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">Dyno Mock</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-white transition-colors">About</Link>
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                <Link href="#" className="hover:text-white transition-colors">Contact</Link>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Dyno Mock. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
