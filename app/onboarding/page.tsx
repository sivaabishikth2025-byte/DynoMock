"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  TrendingUp,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Building2,
  GraduationCap,
  Loader2,
  Sparkles,
  Check,
} from "lucide-react";
import { GlowButton, GlassPanel } from "@/components/ui/design-system";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { cn } from "@/lib/utils";

// Field definitions with icons and descriptions
const FIELDS = [
  {
    id: "SWE",
    name: "Software Engineering",
    icon: Code,
    description: "Data structures, algorithms, system design, and coding interviews",
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  {
    id: "QF",
    name: "Quantitative Finance",
    icon: TrendingUp,
    description: "Probability, statistics, stochastic calculus, and brain teasers",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    id: "IB",
    name: "Investment Banking",
    icon: Briefcase,
    description: "Valuation, M&A, LBO, DCF, and behavioral questions",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
];

// Companies by field
const COMPANIES: Record<string, { name: string; logo?: string; tier: string }[]> = {
  SWE: [
    { name: "Google", tier: "FAANG" },
    { name: "Meta", tier: "FAANG" },
    { name: "Amazon", tier: "FAANG" },
    { name: "Apple", tier: "FAANG" },
    { name: "Netflix", tier: "FAANG" },
    { name: "Microsoft", tier: "Big Tech" },
    { name: "OpenAI", tier: "AI" },
    { name: "Anthropic", tier: "AI" },
    { name: "Stripe", tier: "Fintech" },
    { name: "Coinbase", tier: "Crypto" },
    { name: "Uber", tier: "Tech" },
    { name: "Airbnb", tier: "Tech" },
    { name: "LinkedIn", tier: "Big Tech" },
    { name: "Twitter/X", tier: "Tech" },
    { name: "Salesforce", tier: "Enterprise" },
    { name: "Adobe", tier: "Enterprise" },
    { name: "Other", tier: "Other" },
  ],
  QF: [
    { name: "Jane Street", tier: "Top Tier" },
    { name: "Citadel", tier: "Top Tier" },
    { name: "Two Sigma", tier: "Top Tier" },
    { name: "DE Shaw", tier: "Top Tier" },
    { name: "Renaissance Technologies", tier: "Top Tier" },
    { name: "Jump Trading", tier: "Top Tier" },
    { name: "HRT (Hudson River Trading)", tier: "Top Tier" },
    { name: "Optiver", tier: "Market Making" },
    { name: "IMC Trading", tier: "Market Making" },
    { name: "Akuna Capital", tier: "Market Making" },
    { name: "SIG (Susquehanna)", tier: "Market Making" },
    { name: "DRW", tier: "Prop Trading" },
    { name: "Virtu Financial", tier: "Market Making" },
    { name: "Tower Research", tier: "Prop Trading" },
    { name: "Bridgewater Associates", tier: "Hedge Fund" },
    { name: "Point72", tier: "Hedge Fund" },
    { name: "Other", tier: "Other" },
  ],
  IB: [
    { name: "Goldman Sachs", tier: "Bulge Bracket" },
    { name: "Morgan Stanley", tier: "Bulge Bracket" },
    { name: "JP Morgan", tier: "Bulge Bracket" },
    { name: "Bank of America", tier: "Bulge Bracket" },
    { name: "Citi", tier: "Bulge Bracket" },
    { name: "Barclays", tier: "Bulge Bracket" },
    { name: "Credit Suisse", tier: "Bulge Bracket" },
    { name: "Deutsche Bank", tier: "Bulge Bracket" },
    { name: "UBS", tier: "Bulge Bracket" },
    { name: "Lazard", tier: "Elite Boutique" },
    { name: "Evercore", tier: "Elite Boutique" },
    { name: "Centerview", tier: "Elite Boutique" },
    { name: "Moelis", tier: "Elite Boutique" },
    { name: "PJT Partners", tier: "Elite Boutique" },
    { name: "Qatalyst", tier: "Elite Boutique" },
    { name: "Perella Weinberg", tier: "Elite Boutique" },
    { name: "Other", tier: "Other" },
  ],
};

// Role levels by field
const ROLES: Record<string, { id: string; name: string; description: string }[]> = {
  SWE: [
    { id: "intern", name: "Intern", description: "Summer internship position" },
    { id: "new_grad", name: "New Grad (L3/E3)", description: "Entry-level full-time" },
    { id: "mid", name: "Mid-Level (L4/E4)", description: "2-4 years experience" },
    { id: "senior", name: "Senior (L5/E5)", description: "5+ years experience" },
    { id: "staff", name: "Staff+ (L6+)", description: "Staff engineer and above" },
  ],
  QF: [
    { id: "intern", name: "Intern", description: "Summer internship" },
    { id: "new_grad", name: "New Grad Trader", description: "Entry-level trader/researcher" },
    { id: "quant_researcher", name: "Quant Researcher", description: "Quantitative research role" },
    { id: "quant_developer", name: "Quant Developer", description: "Quantitative development" },
    { id: "portfolio_manager", name: "Portfolio Manager", description: "PM role" },
  ],
  IB: [
    { id: "intern", name: "Summer Analyst", description: "Summer internship" },
    { id: "analyst", name: "Analyst", description: "1st-3rd year analyst" },
    { id: "associate", name: "Associate", description: "Post-MBA or promoted" },
    { id: "vp", name: "Vice President", description: "VP level" },
    { id: "director", name: "Director/ED", description: "Director or Executive Director" },
  ],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const totalSteps = 3;

  const canProceed = () => {
    if (step === 1) return selectedField !== "";
    if (step === 2) return selectedCompany !== "";
    if (step === 3) return selectedRole !== "";
    return false;
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Store in localStorage first as backup
      const onboardingData = {
        field: selectedField,
        targetCompany: selectedCompany,
        roleLevel: selectedRole,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem("dyno_onboarding", JSON.stringify(onboardingData));

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: selectedField,
          targetCompany: selectedCompany,
          roleLevel: selectedRole,
        }),
      });

      // Even if API fails, redirect since we have localStorage backup
      const data = await response.json();
      if (data.user) {
        localStorage.setItem("dyno_user_prefs", JSON.stringify(data.user));
      }
      
      // Redirect to dashboard after onboarding
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      // Still redirect since we have localStorage backup
      router.push("/dashboard");
    }
  };

  const selectedFieldData = FIELDS.find((f) => f.id === selectedField);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarfieldBackground />
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-[1]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">Dyno Mock</span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
                <span className="text-sm text-muted-foreground">
                  {step === 1 && "Choose your field"}
                  {step === 2 && "Select target company"}
                  {step === 3 && "Pick your role level"}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Select Field */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl font-bold mb-2">What are you preparing for?</h1>
                  <p className="text-muted-foreground mb-8">
                    Select your target field to get personalized practice problems.
                  </p>

                  <div className="grid gap-4">
                    {FIELDS.map((field) => {
                      const Icon = field.icon;
                      const isSelected = selectedField === field.id;
                      return (
                        <motion.button
                          key={field.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedField(field.id)}
                          className={cn(
                            "relative p-6 rounded-2xl border-2 text-left transition-all",
                            isSelected
                              ? `${field.bgColor} ${field.borderColor} border-opacity-100`
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={cn(
                                "w-14 h-14 rounded-xl flex items-center justify-center",
                                isSelected ? `bg-gradient-to-br ${field.color}` : "bg-white/10"
                              )}
                            >
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-1">{field.name}</h3>
                              <p className="text-sm text-muted-foreground">{field.description}</p>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center"
                              >
                                <Check className="w-5 h-5 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Select Company */}
              {step === 2 && selectedField && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl font-bold mb-2">Target Company</h1>
                  <p className="text-muted-foreground mb-8">
                    We&apos;ll tailor problems to match your target company&apos;s interview style.
                  </p>

                  {/* Group companies by tier */}
                  {(() => {
                    const companies = COMPANIES[selectedField] || [];
                    const tiers = [...new Set(companies.map((c) => c.tier))];
                    
                    return (
                      <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                        {tiers.map((tier) => (
                          <div key={tier}>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">{tier}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {companies
                                .filter((c) => c.tier === tier)
                                .map((company) => {
                                  const isSelected = selectedCompany === company.name;
                                  return (
                                    <motion.button
                                      key={company.name}
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() => setSelectedCompany(company.name)}
                                      className={cn(
                                        "p-4 rounded-xl border-2 text-left transition-all",
                                        isSelected
                                          ? `${selectedFieldData?.bgColor} ${selectedFieldData?.borderColor}`
                                          : "bg-white/5 border-white/10 hover:border-white/20"
                                      )}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium truncate">{company.name}</span>
                                        {isSelected && (
                                          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                        )}
                                      </div>
                                    </motion.button>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              {/* Step 3: Select Role Level */}
              {step === 3 && selectedField && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl font-bold mb-2">Role Level</h1>
                  <p className="text-muted-foreground mb-8">
                    This helps us calibrate problem difficulty to your experience level.
                  </p>

                  <div className="grid gap-3">
                    {(ROLES[selectedField] || []).map((role) => {
                      const isSelected = selectedRole === role.id;
                      return (
                        <motion.button
                          key={role.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedRole(role.id)}
                          className={cn(
                            "p-5 rounded-xl border-2 text-left transition-all",
                            isSelected
                              ? `${selectedFieldData?.bgColor} ${selectedFieldData?.borderColor}`
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center",
                                  isSelected ? "bg-white/20" : "bg-white/10"
                                )}
                              >
                                <GraduationCap className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{role.name}</h3>
                                <p className="text-sm text-muted-foreground">{role.description}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-cyan-400" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                  step === 1
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-muted-foreground hover:text-white hover:bg-white/10"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              {step < totalSteps ? (
                <GlowButton
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={cn(!canProceed() && "opacity-50 cursor-not-allowed")}
                >
                  <span className="flex items-center gap-2">
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </GlowButton>
              ) : (
                <GlowButton
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className={cn((!canProceed() || isSubmitting) && "opacity-50 cursor-not-allowed")}
                >
                  <span className="flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Start Practicing
                      </>
                    )}
                  </span>
                </GlowButton>
              )}
            </div>

            {/* Summary */}
            {(selectedField || selectedCompany || selectedRole) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Selection</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedField && (
                    <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm">
                      {FIELDS.find((f) => f.id === selectedField)?.name}
                    </span>
                  )}
                  {selectedCompany && (
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm">
                      {selectedCompany}
                    </span>
                  )}
                  {selectedRole && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">
                      {ROLES[selectedField]?.find((r) => r.id === selectedRole)?.name}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
