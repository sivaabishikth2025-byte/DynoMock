"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Flame, Target, Code, Zap, Star } from "lucide-react";

interface ProfileData {
  user: {
    name: string;
    current_elo: number;
  };
  stats: {
    problemsSolved: number;
    totalProblems: number;
    accuracy: number;
    streak: number;
    interviewsPassed: number;
    totalInterviews: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    unlocked: boolean;
  }>;
  strengths: string[];
  focusAreas: string[];
}

interface ProfileCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileCard({ isOpen, onClose }: ProfileCardProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankTitle = (elo: number) => {
    if (elo >= 2000) return "GRANDMASTER";
    if (elo >= 1800) return "MASTER";
    if (elo >= 1600) return "EXPERT";
    if (elo >= 1400) return "ADVANCED";
    if (elo >= 1200) return "INTERMEDIATE";
    return "BEGINNER";
  };

  const getRankClass = (elo: number) => {
    if (elo >= 2000) return "rank-grandmaster";
    if (elo >= 1800) return "rank-master";
    if (elo >= 1600) return "rank-expert";
    if (elo >= 1400) return "rank-advanced";
    if (elo >= 1200) return "rank-intermediate";
    return "rank-beginner";
  };

  const getProgressToNextRank = (elo: number) => {
    const ranks = [0, 1200, 1400, 1600, 1800, 2000, 2500];
    for (let i = 0; i < ranks.length - 1; i++) {
      if (elo < ranks[i + 1]) {
        const progress = ((elo - ranks[i]) / (ranks[i + 1] - ranks[i])) * 100;
        return Math.min(100, Math.max(0, progress));
      }
    }
    return 100;
  };

  const unlockedAchievements = data?.achievements?.filter(a => a.unlocked) || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Card Container */}
          <div 
            className="fixed inset-0 z-50 overflow-y-auto"
            onClick={onClose}
          >
            <div className="min-h-full flex items-center justify-center py-8 px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >

              <style jsx>{`
                .profile-card {
                  --card-bg: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0f0f2f 100%);
                  --accent-primary: #00f0ff;
                  --accent-secondary: #ff00aa;
                  --accent-tertiary: #8b5cf6;
                  --text-primary: #ffffff;
                  --text-secondary: rgba(255, 255, 255, 0.7);
                  --border-glow: rgba(0, 240, 255, 0.3);
                  
                  width: 400px;
                  background: var(--card-bg);
                  border-radius: 24px;
                  padding: 2px;
                  position: relative;
                  overflow: hidden;
                  box-shadow: 
                    0 0 60px rgba(0, 240, 255, 0.15),
                    0 0 100px rgba(139, 92, 246, 0.1),
                    inset 0 0 60px rgba(0, 0, 0, 0.5);
                }

                .profile-card::before {
                  content: '';
                  position: absolute;
                  inset: 0;
                  background: linear-gradient(
                    135deg,
                    var(--accent-primary) 0%,
                    var(--accent-tertiary) 50%,
                    var(--accent-secondary) 100%
                  );
                  border-radius: 24px;
                  padding: 2px;
                  -webkit-mask: 
                    linear-gradient(#fff 0 0) content-box, 
                    linear-gradient(#fff 0 0);
                  -webkit-mask-composite: xor;
                  mask-composite: exclude;
                  animation: borderRotate 4s linear infinite;
                }

                @keyframes borderRotate {
                  0% { filter: hue-rotate(0deg); }
                  100% { filter: hue-rotate(360deg); }
                }

                .card-inner {
                  background: linear-gradient(135deg, #0a0a1a 0%, #151530 100%);
                  border-radius: 22px;
                  padding: 24px;
                  position: relative;
                  z-index: 1;
                }

                /* Holographic effect */
                .card-inner::before {
                  content: '';
                  position: absolute;
                  inset: 0;
                  background: linear-gradient(
                    45deg,
                    transparent 30%,
                    rgba(0, 240, 255, 0.03) 50%,
                    transparent 70%
                  );
                  animation: holographic 3s ease-in-out infinite;
                  border-radius: 22px;
                  pointer-events: none;
                }

                @keyframes holographic {
                  0%, 100% { transform: translateX(-100%); }
                  50% { transform: translateX(100%); }
                }

                /* Header section */
                .header-section {
                  display: flex;
                  align-items: center;
                  gap: 16px;
                  margin-bottom: 20px;
                }

                .avatar-container {
                  position: relative;
                  width: 80px;
                  height: 80px;
                }

                .avatar-ring {
                  position: absolute;
                  inset: -4px;
                  border: 3px solid transparent;
                  border-radius: 50%;
                  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) border-box;
                  -webkit-mask: 
                    linear-gradient(#fff 0 0) padding-box, 
                    linear-gradient(#fff 0 0);
                  -webkit-mask-composite: xor;
                  mask-composite: exclude;
                  animation: pulse-ring 2s ease-in-out infinite;
                }

                @keyframes pulse-ring {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.05); opacity: 0.8; }
                }

                .avatar {
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #1a1a3a, #2a2a4a);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 32px;
                  font-weight: bold;
                  color: var(--accent-primary);
                  text-shadow: 0 0 20px var(--accent-primary);
                }

                .user-info h2 {
                  font-size: 1.4rem;
                  font-weight: 700;
                  color: var(--text-primary);
                  margin: 0 0 4px 0;
                  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                }

                .rank-badge {
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  padding: 4px 12px;
                  border-radius: 20px;
                  font-size: 0.75rem;
                  font-weight: 600;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                }

                .rank-beginner {
                  background: linear-gradient(135deg, rgba(156, 163, 175, 0.2), rgba(107, 114, 128, 0.2));
                  color: #9ca3af;
                  border: 1px solid rgba(156, 163, 175, 0.3);
                }

                .rank-intermediate {
                  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2));
                  color: #22c55e;
                  border: 1px solid rgba(34, 197, 94, 0.3);
                }

                .rank-advanced {
                  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
                  color: #3b82f6;
                  border: 1px solid rgba(59, 130, 246, 0.3);
                }

                .rank-expert {
                  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2));
                  color: #a855f7;
                  border: 1px solid rgba(168, 85, 247, 0.3);
                }

                .rank-master {
                  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2));
                  color: #f97316;
                  border: 1px solid rgba(249, 115, 22, 0.3);
                }

                .rank-grandmaster {
                  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
                  color: #ef4444;
                  border: 1px solid rgba(239, 68, 68, 0.3);
                  animation: grandmaster-pulse 2s ease-in-out infinite;
                }

                @keyframes grandmaster-pulse {
                  0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
                  50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6); }
                }

                /* Stats grid */
                .stats-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 12px;
                  margin-bottom: 20px;
                }

                .stat-box {
                  background: rgba(255, 255, 255, 0.03);
                  border: 1px solid rgba(255, 255, 255, 0.08);
                  border-radius: 12px;
                  padding: 14px;
                  position: relative;
                  overflow: hidden;
                  transition: all 0.3s ease;
                }

                .stat-box:hover {
                  background: rgba(255, 255, 255, 0.06);
                  border-color: rgba(0, 240, 255, 0.3);
                  transform: translateY(-2px);
                }

                .stat-box::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 1px;
                  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
                  opacity: 0;
                  transition: opacity 0.3s ease;
                }

                .stat-box:hover::before {
                  opacity: 1;
                }

                .stat-icon {
                  width: 28px;
                  height: 28px;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-bottom: 8px;
                }

                .stat-icon.elo { background: rgba(0, 240, 255, 0.15); color: var(--accent-primary); }
                .stat-icon.problems { background: rgba(139, 92, 246, 0.15); color: var(--accent-tertiary); }
                .stat-icon.streak { background: rgba(255, 0, 170, 0.15); color: var(--accent-secondary); }
                .stat-icon.interviews { background: rgba(34, 197, 94, 0.15); color: #22c55e; }

                .stat-label {
                  font-size: 0.7rem;
                  color: var(--text-secondary);
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 4px;
                }

                .stat-value {
                  font-size: 1.3rem;
                  font-weight: 700;
                  color: var(--text-primary);
                }

                /* Progress bar */
                .progress-section {
                  margin-bottom: 20px;
                }

                .progress-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 8px;
                }

                .progress-label {
                  font-size: 0.75rem;
                  color: var(--text-secondary);
                }

                .progress-value {
                  font-size: 0.75rem;
                  color: var(--accent-primary);
                  font-weight: 600;
                }

                .progress-bar {
                  height: 8px;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 4px;
                  overflow: hidden;
                  position: relative;
                }

                .progress-fill {
                  height: 100%;
                  background: linear-gradient(90deg, var(--accent-primary), var(--accent-tertiary));
                  border-radius: 4px;
                  position: relative;
                  transition: width 1s ease-out;
                }

                .progress-fill::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                  animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }

                /* Achievements */
                .achievements-section h3 {
                  font-size: 0.8rem;
                  color: var(--text-secondary);
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  margin-bottom: 12px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }

                .achievements-grid {
                  display: flex;
                  gap: 8px;
                  flex-wrap: wrap;
                }

                .achievement-badge {
                  width: 42px;
                  height: 42px;
                  border-radius: 10px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: rgba(255, 255, 255, 0.05);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  font-size: 18px;
                  transition: all 0.3s ease;
                  position: relative;
                }

                .achievement-badge.unlocked {
                  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1));
                  border-color: rgba(255, 215, 0, 0.4);
                  box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
                }

                .achievement-badge:hover {
                  transform: scale(1.1);
                }

                /* Strengths */
                .strengths-section {
                  margin-top: 16px;
                }

                .strengths-section h3 {
                  font-size: 0.8rem;
                  color: var(--text-secondary);
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  margin-bottom: 10px;
                }

                .strength-tags {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 8px;
                }

                .strength-tag {
                  padding: 6px 12px;
                  border-radius: 20px;
                  font-size: 0.7rem;
                  font-weight: 500;
                  background: rgba(0, 240, 255, 0.1);
                  color: var(--accent-primary);
                  border: 1px solid rgba(0, 240, 255, 0.2);
                }

                .focus-tag {
                  background: rgba(255, 0, 170, 0.1);
                  color: var(--accent-secondary);
                  border: 1px solid rgba(255, 0, 170, 0.2);
                }

                /* Loading state */
                .loading-skeleton {
                  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
                  background-size: 200% 100%;
                  animation: loading 1.5s infinite;
                  border-radius: 8px;
                }

                @keyframes loading {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
              `}</style>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-2 -right-2 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/90 hover:border-cyan-400/50 transition-all shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="profile-card">
                <div className="card-inner">
                  {loading ? (
                    /* Loading skeleton */
                    <div className="space-y-4">
                      <div className="header-section">
                        <div className="loading-skeleton w-20 h-20 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="loading-skeleton h-6 w-32" />
                          <div className="loading-skeleton h-5 w-24" />
                        </div>
                      </div>
                      <div className="stats-grid">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="loading-skeleton h-20" />
                        ))}
                      </div>
                    </div>
                  ) : data ? (
                    <>
                      {/* Header */}
                      <div className="header-section">
                        <div className="avatar-container">
                          <div className="avatar-ring" />
                          <div className="avatar">
                            {data.user.name?.charAt(0).toUpperCase() || "D"}
                          </div>
                        </div>
                        <div className="user-info">
                          <h2>{data.user.name || "Demo User"}</h2>
                          <span className={`rank-badge ${getRankClass(data.user.current_elo)}`}>
                            <Star className="w-3 h-3" />
                            {getRankTitle(data.user.current_elo)}
                          </span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="stats-grid">
                        <div className="stat-box">
                          <div className="stat-icon elo">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div className="stat-label">ELO Rating</div>
                          <div className="stat-value">{data.user.current_elo || 1200}</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-icon problems">
                            <Code className="w-4 h-4" />
                          </div>
                          <div className="stat-label">Problems Solved</div>
                          <div className="stat-value">{data.stats.problemsSolved}/{data.stats.totalProblems}</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-icon streak">
                            <Flame className="w-4 h-4" />
                          </div>
                          <div className="stat-label">Day Streak</div>
                          <div className="stat-value">{data.stats.streak} 🔥</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-icon interviews">
                            <Target className="w-4 h-4" />
                          </div>
                          <div className="stat-label">Interviews</div>
                          <div className="stat-value">{data.stats.interviewsPassed}/{data.stats.totalInterviews}</div>
                        </div>
                      </div>

                      {/* Progress to next rank */}
                      <div className="progress-section">
                        <div className="progress-header">
                          <span className="progress-label">Progress to Next Rank</span>
                          <span className="progress-value">{Math.round(getProgressToNextRank(data.user.current_elo))}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${getProgressToNextRank(data.user.current_elo)}%` }}
                          />
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="achievements-section">
                        <h3>
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          Achievements ({unlockedAchievements.length}/{data.achievements.length})
                        </h3>
                        <div className="achievements-grid">
                          {data.achievements.map((achievement) => (
                            <div
                              key={achievement.id}
                              className={`achievement-badge ${achievement.unlocked ? 'unlocked' : ''}`}
                              title={achievement.title}
                            >
                              {achievement.unlocked ? '🏆' : '🔒'}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strengths & Focus Areas */}
                      {(data.strengths.length > 0 || data.focusAreas.length > 0) && (
                        <div className="strengths-section">
                          <h3>Skills</h3>
                          <div className="strength-tags">
                            {data.strengths.map((s: string) => (
                              <span key={s} className="strength-tag">{s}</span>
                            ))}
                            {data.focusAreas.map((f: string) => (
                              <span key={f} className="strength-tag focus-tag">📍 {f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-white/50">
                      Failed to load profile
                    </div>
                  )}
                </div>
              </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

