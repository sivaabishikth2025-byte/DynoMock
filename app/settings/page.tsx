"use client";

import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Palette, Volume2 } from "lucide-react";
import { GlassPanel, GlowButton } from "@/components/ui/design-system";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { useDemoStore } from "@/store/useDemoStore";

export default function SettingsPage() {
  const { reducedMotion, disable3D, captionsEnabled, setReducedMotion, setDisable3D, setCaptionsEnabled } = useDemoStore();

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-4rem)] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-background to-cyan-900/10" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and account settings</p>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassPanel>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Appearance</h2>
                    <p className="text-sm text-muted-foreground">Customize your visual experience</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="font-medium">3D Effects</p>
                      <p className="text-sm text-muted-foreground">Enable immersive 3D elements</p>
                    </div>
                    <Switch checked={!disable3D} onCheckedChange={(checked) => setDisable3D(!checked)} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="font-medium">Reduced Motion</p>
                      <p className="text-sm text-muted-foreground">Minimize animations</p>
                    </div>
                    <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                  </div>
                </div>
              </GlassPanel>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassPanel>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Accessibility</h2>
                    <p className="text-sm text-muted-foreground">Make the app work better for you</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="font-medium">Captions</p>
                      <p className="text-sm text-muted-foreground">Show captions during interviews</p>
                    </div>
                    <Switch checked={captionsEnabled} onCheckedChange={setCaptionsEnabled} />
                  </div>
                </div>
              </GlassPanel>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassPanel>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Account</h2>
                    <p className="text-sm text-muted-foreground">Manage your profile</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">demo@dynomock.com</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                    <p className="font-medium">Demo Mode</p>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassPanel className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Running in Demo Mode - No authentication required
                </p>
                <GlowButton variant="secondary">
                  Reset Demo Data
                </GlowButton>
              </GlassPanel>
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
