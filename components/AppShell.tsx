"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Home, 
  BarChart3, 
  Code, 
  Mic, 
  Settings, 
  Zap,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/practice", label: "Practice", icon: Code },
  { href: "/interview", label: "Interview", icon: Mic },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background noise">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Dyno Mock</span>
            </Link>

            {/* Center Navigation */}
            <div className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm font-medium",
                        isActive
                          ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/settings">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
                >
                  <Settings className="w-5 h-5" />
                </motion.div>
              </Link>
              
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </motion.div>
              </Link>
              
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                >
                  Sign Up
                </motion.button>
              </Link>
            </div>

          </div>
        </div>

      </nav>

      <main className="pt-16">{children}</main>
    </div>
  );
}
