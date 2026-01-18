"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

export function GlowButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled,
  type = "button",
}: GlowButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:shadow-[0_0_40px_rgba(167,139,250,0.5)]",
    secondary: "glass border-white/10 text-white hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(167,139,250,0.3)]",
    ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-xl font-medium transition-all duration-300",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassPanel({ children, className, hover = false }: GlassPanelProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        "glass rounded-2xl p-6",
        hover && "cursor-pointer transition-shadow hover:shadow-[0_0_40px_rgba(167,139,250,0.2)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function GradientCard({
  children,
  className,
  gradientFrom = "from-violet-500/20",
  gradientTo = "to-cyan-500/20",
}: GradientCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br p-[1px]",
        gradientFrom,
        gradientTo,
        className
      )}
    >
      <div className="relative rounded-2xl bg-card p-6 h-full">{children}</div>
    </div>
  );
}

interface DifficultyPillProps {
  difficulty: "Easy" | "Medium" | "Hard" | string;
  className?: string;
}

export function DifficultyPill({ difficulty, className }: DifficultyPillProps) {
  const colors = {
    Easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Hard: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={cn(
        "px-3 py-1 text-xs font-medium rounded-full border",
        colors[difficulty as keyof typeof colors] || colors.Medium,
        className
      )}
    >
      {difficulty}
    </span>
  );
}

interface CategoryTagProps {
  category: string;
  color?: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function CategoryTag({ category, color, className, onClick, active }: CategoryTagProps) {
  const baseStyle = color
    ? { backgroundColor: `${color}20`, color: color, borderColor: `${color}40` }
    : {};

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={baseStyle}
      className={cn(
        "px-3 py-1 text-xs font-medium rounded-full border transition-all",
        !color && "bg-violet-500/20 text-violet-400 border-violet-500/30",
        onClick && "cursor-pointer",
        active && "ring-2 ring-white/30",
        className
      )}
    >
      {category}
    </motion.span>
  );
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  duration = 1,
  className,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {value.toLocaleString()}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
}

interface CircularGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export function CircularGauge({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  label,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * circumference;

  const getColor = () => {
    const percentage = value / max;
    if (percentage >= 0.8) return "#34d399";
    if (percentage >= 0.6) return "#22d3ee";
    if (percentage >= 0.4) return "#fbbf24";
    return "#f87171";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 10px ${getColor()})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold"
          style={{ color: getColor() }}
        >
          {value}
        </motion.span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

interface TimelineProps {
  items: { time: string; event: string; type: string }[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  const typeColors = {
    positive: "bg-emerald-500",
    warning: "bg-amber-500",
    neutral: "bg-white/30",
  };

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-4"
        >
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                typeColors[item.type as keyof typeof typeColors] || typeColors.neutral
              )}
            />
            {index < items.length - 1 && (
              <div className="w-px h-8 bg-white/10" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
            <p className="text-sm mt-1">{item.event}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
