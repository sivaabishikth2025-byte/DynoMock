"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff,
  Clock, 
  Lightbulb,
  MessageSquare,
  Code,
  Pencil,
  Volume2,
  VolumeX,
  Loader2,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  SkipForward,
  Trophy,
  Briefcase
} from "lucide-react";
import { GlowButton, GlassPanel } from "@/components/ui/design-system";
import { AppShell } from "@/components/AppShell";
import { GandalfBlock } from "@/components/GandalfBlock";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { useDemoStore } from "@/store/useDemoStore";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Problem } from "@/lib/supabase";
import { getUserField, getFieldDisplayName, FIELD_DISPLAY_NAMES } from "@/lib/userPreferences";

const ThreeInterviewRoom = dynamic(
  () => import("@/components/three/ThreeInterviewRoom").then((mod) => mod.ThreeInterviewRoom),
  { ssr: false }
);

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const BrowserVoice = dynamic(
  () => import("@/components/BrowserVoice").then((mod) => mod.BrowserVoice),
  { ssr: false }
);

const LiveKitVoice = dynamic(
  () => import("@/components/LiveKitVoice").then((mod) => mod.LiveKitVoice),
  { ssr: false }
);

type TranscriptMessage = {
  time: string;
  speaker: string;
  text: string;
  questionType?: "reasoning" | "coding" | "feedback";
};

type QuestionPhase = "introduction" | "reasoning" | "coding" | "feedback";

export default function InterviewPage() {
  const router = useRouter();
  const { 
    interview, 
    disable3D,
    captionsEnabled,
    setCaptionsEnabled,
    setIsSpeaking, 
    setAudioLevel, 
    setTimeRemaining,
    setIsRecording,
    setStatus,
    resetInterview
  } = useDemoStore();
  
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"code" | "whiteboard">("code");
  const [code, setCode] = useState("// Write your solution here\n\n");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");
  const [hintOpen, setHintOpen] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [useLiveKit, setUseLiveKit] = useState(false);
  const [livekitError, setLivekitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    passed: boolean;
    score: number;
    message: string;
  } | null>(null);
  const [lastAIResponse, setLastAIResponse] = useState<string>("");
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>("introduction");
  const [currentQuestionType, setCurrentQuestionType] = useState<"reasoning" | "coding">("reasoning");
  const [shouldShowCodePrompt, setShouldShowCodePrompt] = useState(false);
  const [codeEvaluation, setCodeEvaluation] = useState<{
    passed: boolean;
    score: number;
    feedback: string;
    suggestions: string[];
    timeComplexity: string;
    spaceComplexity: string;
  } | null>(null);
  
  // Track correct answers for pass condition (3 correct = pass)
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  const REQUIRED_CORRECT = 3;
  
  // Gandalf block for failed interviews
  const [showGandalf, setShowGandalf] = useState(false);
  const [gandalfMessage, setGandalfMessage] = useState("");
  
  // User's field for filtering problems
  const [userField, setUserField] = useState<string>("SWE");
  
  const startTimeRef = useRef<number>(Date.now());
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeRemainingRef = useRef<number>(1800);

  // Initialize interview
  useEffect(() => {
    // Get user's field from localStorage
    const field = getUserField();
    setUserField(field);

    const startInterview = async () => {
      resetInterview();
      setIsLoading(true);
      
      try {
        // First create the interview to get the ID, passing user's field
        const res = await fetch("/api/interviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field }),
        });
        
        let newInterviewId: string | null = null;
        
        if (res.ok) {
          const data = await res.json();
          newInterviewId = data.id;
          setInterviewId(data.id);
          setProblem(data.problems);
          
          if (data.problems?.starter_code?.javascript) {
            setCode(data.problems.starter_code.javascript);
          }
          
          if (data.transcript && data.transcript.length > 0) {
            setTranscript(data.transcript);
            // Set the last AI response for TTS
            const lastAI = data.transcript.filter((t: TranscriptMessage) => t.speaker === "AI").pop();
            if (lastAI) {
              setLastAIResponse(lastAI.text);
            }
          }
        }

        // Now check LiveKit availability with the interview ID
        const livekitRes = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            roomName: `interview-${newInterviewId || Date.now()}`,
            interviewId: newInterviewId
          }),
        });
        const livekitData = await livekitRes.json();
        
        if (livekitData.fallbackMode) {
          setUseLiveKit(false);
          setLivekitError(livekitData.message || "Voice mode unavailable - using browser voice");
        } else {
          setUseLiveKit(true);
          // When using LiveKit with AI agent, we don't need the initial transcript
          // The agent will greet the user via voice
        }
      } catch (err) {
        console.error("Failed to start interview:", err);
        setUseLiveKit(false);
      } finally {
        setIsLoading(false);
        startTimeRef.current = Date.now();
        timeRemainingRef.current = 1800;
      }
    };
    
    startInterview();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetInterview]);

  // Timer - fixed to not recreate on every tick
  useEffect(() => {
    timerRef.current = setInterval(() => {
      timeRemainingRef.current = Math.max(0, timeRemainingRef.current - 1);
      setTimeRemaining(timeRemainingRef.current);
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [setTimeRemaining]);

  // Update code template when language changes
  useEffect(() => {
    const templates: Record<string, string> = {
      javascript: "// Write your solution here\n\nfunction solution() {\n  \n}\n",
      typescript: "// Write your solution here\n\nfunction solution(): void {\n  \n}\n",
      python: "# Write your solution here\n\ndef solution():\n    pass\n",
      java: "// Write your solution here\n\nclass Solution {\n    public void solve() {\n        \n    }\n}\n",
      cpp: "// Write your solution here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n",
      c: "// Write your solution here\n\n#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n",
      go: "// Write your solution here\n\npackage main\n\nfunc main() {\n    \n}\n",
      rust: "// Write your solution here\n\nfn main() {\n    \n}\n",
    };
    setCode(templates[selectedLanguage] || "// Write your solution here\n\n");
  }, [selectedLanguage]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !interviewId || isSendingMessage) return;
    
    setIsSendingMessage(true);
    setStatus("thinking");
    
    // Add user message to transcript
    const userMessage: TranscriptMessage = {
      time: new Date().toISOString(),
      speaker: "User",
      text: message.trim(),
    };
    setTranscript(prev => [...prev, userMessage]);
    
    try {
      const res = await fetch("/api/interviews/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          userMessage: message.trim(),
          questionPhase,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setStatus("speaking");
        
        const aiMessage: TranscriptMessage = {
          time: new Date().toISOString(),
          speaker: "AI",
          text: data.response,
          questionType: data.questionType,
        };
        setTranscript(prev => [...prev, aiMessage]);
        
        // Update question state based on AI response
        if (data.questionType) {
          setCurrentQuestionType(data.questionType);
        }
        if (data.shouldPromptCode) {
          setShouldShowCodePrompt(true);
          setQuestionPhase("coding");
        }
        
        // Trigger TTS for the AI response
        setLastAIResponse(data.response);
        
        setTimeout(() => setStatus("idle"), 2000);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setStatus("idle");
    } finally {
      setIsSendingMessage(false);
      setTextInput("");
    }
  }, [interviewId, isSendingMessage, setStatus, questionPhase]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(textInput);
    }
  };

  const toggleRecording = useCallback(() => {
    if (interview.isRecording) {
      setIsRecording(false);
      setIsSpeaking(false);
      setStatus("idle");
    } else {
      setIsRecording(true);
      setIsSpeaking(true);
      setStatus("listening");
    }
  }, [interview.isRecording, setIsRecording, setIsSpeaking, setStatus]);

  const handleUseHint = () => {
    setHintsUsed(hintsUsed + 1);
    setHintOpen(true);
  };

  const [isLoadingNextQuestion, setIsLoadingNextQuestion] = useState(false);
  
  const handleNextQuestion = async () => {
    if (!interviewId || isLoadingNextQuestion) return;
    
    setIsLoadingNextQuestion(true);
    
    try {
      // Call API to get a new problem
      const res = await fetch("/api/interviews/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          currentProblemId: problem?.id,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Update the problem
        setProblem(data.problem);
        
        // Reset code to template
        const templates: Record<string, string> = {
          javascript: "// Write your solution here\n\nfunction solution() {\n  \n}\n",
          typescript: "// Write your solution here\n\nfunction solution(): void {\n  \n}\n",
          python: "# Write your solution here\n\ndef solution():\n    pass\n",
          java: "// Write your solution here\n\nclass Solution {\n    public void solve() {\n        \n    }\n}\n",
          cpp: "// Write your solution here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n",
          c: "// Write your solution here\n\n#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n",
          go: "// Write your solution here\n\npackage main\n\nfunc main() {\n    \n}\n",
          rust: "// Write your solution here\n\nfn main() {\n    \n}\n",
        };
        setCode(templates[selectedLanguage] || "// Write your solution here\n\n");
        
        // Reset evaluation states
        setSubmissionResult(null);
        setCodeEvaluation(null);
        setShouldShowCodePrompt(false);
        setQuestionPhase("introduction");
        setHintsUsed(0);
        
        // Add to transcript
        const aiMessage = `Let's move on to a new problem: "${data.problem.title}". ${data.problem.statement.slice(0, 300)}${data.problem.statement.length > 300 ? '...' : ''} Take your time to understand it, and walk me through your approach when ready.`;
        
        setTranscript(prev => [...prev, {
          time: new Date().toISOString(),
          speaker: "System",
          text: "Switched to next question",
        }, {
          time: new Date().toISOString(),
          speaker: "AI",
          text: aiMessage,
        }]);
        
        setLastAIResponse(aiMessage);
      }
    } catch (err) {
      console.error("Failed to get next question:", err);
    } finally {
      setIsLoadingNextQuestion(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!problem || !interviewId || isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmissionResult(null);
    setCodeEvaluation(null);
    setQuestionPhase("feedback");
    
    try {
      // Use the new interview-specific evaluation endpoint
      const res = await fetch("/api/interviews/evaluate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          code,
          language: selectedLanguage,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const passed = data.passed;
        
        // Track questions attempted
        const newQuestionsAttempted = questionsAttempted + 1;
        setQuestionsAttempted(newQuestionsAttempted);
        
        // Track correct answers
        let newCorrectAnswers = correctAnswers;
        if (passed) {
          newCorrectAnswers = correctAnswers + 1;
          setCorrectAnswers(newCorrectAnswers);
        }
        
        // Store detailed evaluation
        setCodeEvaluation({
          passed: data.passed,
          score: data.evaluation.correctnessScore,
          feedback: data.feedback,
          suggestions: data.evaluation.suggestions || [],
          timeComplexity: data.evaluation.timeComplexity || "Unknown",
          spaceComplexity: data.evaluation.spaceComplexity || "Unknown",
        });
        
        setSubmissionResult({
          passed,
          score: data.evaluation.correctnessScore,
          message: data.feedback,
        });
        
        // Check if user has passed the interview (3 correct answers)
        const interviewPassed = newCorrectAnswers >= REQUIRED_CORRECT;
        
        // Add to transcript
        setTranscript(prev => [...prev, {
          time: new Date().toISOString(),
          speaker: "System",
          text: `Code submitted for evaluation (${newCorrectAnswers}/${REQUIRED_CORRECT} correct)`,
        }, {
          time: new Date().toISOString(),
          speaker: "AI",
          text: interviewPassed 
            ? `${data.feedback}\n\n🎉 Congratulations! You've answered ${REQUIRED_CORRECT} questions correctly! You've passed the interview! Let me prepare your report...`
            : data.feedback,
          questionType: "feedback",
        }]);
        
        // Trigger TTS for the feedback
        setLastAIResponse(interviewPassed 
          ? `${data.feedback} Congratulations! You've answered ${REQUIRED_CORRECT} questions correctly! You've passed the interview! Let me prepare your report.`
          : data.feedback);
        
        // Reset code prompt after submission
        setShouldShowCodePrompt(false);
        
        // If passed the interview, end it and go to report
        if (interviewPassed) {
          setTimeout(() => {
            handleEndInterview(true, newCorrectAnswers, newQuestionsAttempted);
          }, 3000); // Give time for TTS to finish
        }
      }
    } catch (err) {
      console.error("Failed to evaluate code:", err);
      setSubmissionResult({
        passed: false,
        score: 0,
        message: "Failed to evaluate. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceTranscript = useCallback((speaker: string, text: string) => {
    setTranscript(prev => [...prev, {
      time: new Date().toISOString(),
      speaker,
      text,
    }]);
  }, []);

  const handleVoiceStatusChange = useCallback((status: "idle" | "listening" | "thinking" | "speaking") => {
    setStatus(status);
  }, [setStatus]);

  // End interview and navigate to report
  const handleEndInterview = async (passed: boolean, correct: number, attempted: number) => {
    if (!interviewId) return;
    
    setIsEnding(true);
    const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    try {
      const res = await fetch(`/api/interviews?id=${interviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: interviewId,
          end_interview: true,
          code_submitted: code,
          duration_sec: durationSec,
          hints_used: hintsUsed,
          interview_passed: passed,
          correct_answers: correct,
          questions_attempted: attempted,
        }),
      });
      
      if (res.ok) {
        setIsEnding(false);
        
        // Show Gandalf if failed or no questions answered
        if (!passed) {
          if (attempted === 0) {
            setGandalfMessage("You ended the interview without answering any questions!");
          } else {
            setGandalfMessage(`You answered ${correct}/${REQUIRED_CORRECT} questions correctly. You need ${REQUIRED_CORRECT} to pass!`);
          }
          setShowGandalf(true);
        } else {
          // Passed! Navigate directly to report
          window.location.href = `/interview/report?id=${interviewId}`;
        }
      }
    } catch (err) {
      console.error("Failed to end interview:", err);
      setIsEnding(false);
    }
  };

  const statusConfig = {
    idle: { label: "Ready", color: "bg-white/20", textColor: "text-white/70" },
    listening: { label: "Listening...", color: "bg-cyan-500/20", textColor: "text-cyan-400" },
    thinking: { label: "AI Thinking...", color: "bg-amber-500/20", textColor: "text-amber-400" },
    speaking: { label: "AI Speaking", color: "bg-violet-500/20", textColor: "text-violet-400" },
  };

  const currentStatus = statusConfig[interview.status];

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-violet-400 mx-auto mb-4" />
            <p className="text-lg font-medium">Preparing your interview...</p>
            <p className="text-sm text-muted-foreground">Finding the perfect problem for you</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Show Gandalf block if interview failed
  if (showGandalf && interviewId) {
    return <GandalfBlock interviewId={interviewId} message={gandalfMessage} />;
  }

  return (
    <AppShell>
      <AnimatePresence>
        {isEnding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <Loader2 className="w-12 h-12 animate-spin text-violet-400 mx-auto mb-4" />
              <p className="text-xl font-medium">Analyzing your interview...</p>
              <p className="text-sm text-muted-foreground mt-2">Generating AI-powered feedback</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Starfield Background */}
        <StarfieldBackground />
        
        {!disable3D && (
          <div className="absolute inset-0 opacity-30 z-[1]">
            <ThreeInterviewRoom 
              onHintClick={handleUseHint} 
              className="w-full h-full"
            />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-[2]" />

        <div className="relative h-full flex flex-col p-4 lg:p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "px-4 py-2 rounded-full flex items-center gap-2",
                currentStatus.color
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  interview.status === "listening" ? "bg-cyan-400" :
                  interview.status === "thinking" ? "bg-amber-400" :
                  interview.status === "speaking" ? "bg-violet-400" : "bg-white/50"
                )} />
                <span className={cn("text-sm font-medium", currentStatus.textColor)}>
                  {currentStatus.label}
                </span>
              </div>
              
              {!useLiveKit && (
                <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Text Mode
                </div>
              )}
              
              {interview.hintReady && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUseHint}
                  className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-2 text-sm"
                >
                  <Lightbulb className="w-4 h-4" />
                  Hint ({hintsUsed} used)
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                disabled={isLoadingNextQuestion}
                className="px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-2 text-sm hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
              >
                {isLoadingNextQuestion ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SkipForward className="w-4 h-4" />
                )}
                Next Question
              </motion.button>
              
              {/* Progress Tracker - Show correct answers */}
              <div className={cn(
                "px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium",
                correctAnswers >= REQUIRED_CORRECT 
                  ? "bg-green-500/20 text-green-400" 
                  : correctAnswers >= 2 
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-white/10 text-white/70"
              )}>
                <Trophy className="w-4 h-4" />
                <span>{correctAnswers}/{REQUIRED_CORRECT} Correct</span>
                {correctAnswers >= REQUIRED_CORRECT && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={cn(
                "px-4 py-2 rounded-lg flex items-center gap-2",
                interview.timeRemaining < 300 ? "bg-red-500/20 text-red-400" : "bg-white/10"
              )}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(interview.timeRemaining)}</span>
              </div>
              
              <button
                onClick={() => setCaptionsEnabled(!captionsEnabled)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  captionsEnabled ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                )}
              >
                {captionsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              <GlowButton 
                variant="secondary" 
                onClick={() => handleEndInterview(correctAnswers >= REQUIRED_CORRECT, correctAnswers, questionsAttempted)} 
                size="sm"
              >
                End Interview
              </GlowButton>
            </div>
          </div>

          <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-[500px]">
            <GlassPanel className="flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-violet-400" />
                <h3 className="font-semibold">Conversation</h3>
                {problem && (
                  <span className="ml-auto text-sm text-muted-foreground">{problem.title}</span>
                )}
              </div>
              
              <div className="flex-1 overflow-auto space-y-4 pr-2 mb-4">
                {transcript.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-xl",
                      message.speaker === "AI" 
                        ? "bg-violet-500/10 border border-violet-500/20" 
                        : message.speaker === "System"
                        ? "bg-amber-500/10 border border-amber-500/20"
                        : "bg-cyan-500/10 border border-cyan-500/20"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn(
                        "text-xs font-medium",
                        message.speaker === "AI" ? "text-violet-400" : 
                        message.speaker === "System" ? "text-amber-400" : "text-cyan-400"
                      )}>
                        {message.speaker === "AI" ? "AI Interviewer" : 
                         message.speaker === "System" ? "System" : "You"}
                      </p>
                      {message.questionType && (
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full uppercase font-medium",
                          message.questionType === "reasoning" ? "bg-blue-500/20 text-blue-400" :
                          message.questionType === "coding" ? "bg-emerald-500/20 text-emerald-400" :
                          "bg-purple-500/20 text-purple-400"
                        )}>
                          {message.questionType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </motion.div>
                ))}
                <div ref={transcriptEndRef} />
              </div>

              {/* Voice Controls */}
              {interviewId && (
                <div className="py-4 border-t border-white/10">
                  <BrowserVoice
                    interviewId={interviewId}
                    onTranscript={handleVoiceTranscript}
                    onStatusChange={handleVoiceStatusChange}
                    onSendMessage={sendMessage}
                    lastAIResponse={lastAIResponse}
                  />
                </div>
              )}

              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  disabled={isSendingMessage}
                />
                <GlowButton 
                  onClick={() => sendMessage(textInput)}
                  disabled={!textInput.trim() || isSendingMessage}
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </GlowButton>
              </div>
            </GlassPanel>

            <div className="flex flex-col min-h-0 gap-4">
              {/* Coding Prompt Banner */}
              <AnimatePresence>
                {shouldShowCodePrompt && !codeEvaluation && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center">
                      <Code className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-400">Time to Code!</p>
                      <p className="text-xs text-emerald-400/70">Write your solution and click Submit when ready for evaluation</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setActiveTab("code")}
                  className={cn(
                    "px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors",
                    activeTab === "code" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                  )}
                >
                  <Code className="w-4 h-4" />
                  Code Editor
                </button>
                <button
                  onClick={() => setActiveTab("whiteboard")}
                  className={cn(
                    "px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors",
                    activeTab === "whiteboard" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                  )}
                >
                  <Pencil className="w-4 h-4" />
                  Whiteboard
                </button>
                
                {/* Language Selector */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="javascript" className="bg-zinc-900">JavaScript</option>
                  <option value="typescript" className="bg-zinc-900">TypeScript</option>
                  <option value="python" className="bg-zinc-900">Python</option>
                  <option value="java" className="bg-zinc-900">Java</option>
                  <option value="cpp" className="bg-zinc-900">C++</option>
                  <option value="c" className="bg-zinc-900">C</option>
                  <option value="go" className="bg-zinc-900">Go</option>
                  <option value="rust" className="bg-zinc-900">Rust</option>
                </select>
                
                {/* Question Phase Indicator */}
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  questionPhase === "introduction" ? "bg-blue-500/20 text-blue-400" :
                  questionPhase === "reasoning" ? "bg-amber-500/20 text-amber-400" :
                  questionPhase === "coding" ? "bg-emerald-500/20 text-emerald-400" :
                  "bg-purple-500/20 text-purple-400"
                )}>
                  {questionPhase.charAt(0).toUpperCase() + questionPhase.slice(1)} Phase
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                  {submissionResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm",
                        submissionResult.passed 
                          ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      )}
                    >
                      {submissionResult.passed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>{submissionResult.score}%</span>
                    </motion.div>
                  )}
                  
                  <GlowButton 
                    onClick={handleSubmitSolution}
                    disabled={isSubmitting || !code.trim()}
                    size="sm"
                    className={shouldShowCodePrompt ? "animate-pulse" : ""}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Submit Solution
                      </>
                    )}
                  </GlowButton>
                </div>
              </div>
              
              {/* Code Evaluation Details Panel */}
              <AnimatePresence>
                {codeEvaluation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <GlassPanel className={cn(
                      "border",
                      codeEvaluation.passed ? "border-green-500/30" : "border-red-500/30"
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={cn(
                          "font-medium flex items-center gap-2",
                          codeEvaluation.passed ? "text-green-400" : "text-red-400"
                        )}>
                          {codeEvaluation.passed ? (
                            <><CheckCircle className="w-5 h-5" /> Solution Accepted</>
                          ) : (
                            <><XCircle className="w-5 h-5" /> Needs Improvement</>
                          )}
                        </h4>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground">Time: <span className="text-white">{codeEvaluation.timeComplexity}</span></span>
                          <span className="text-muted-foreground">Space: <span className="text-white">{codeEvaluation.spaceComplexity}</span></span>
                        </div>
                      </div>
                      
                      {codeEvaluation.suggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs text-muted-foreground mb-2">Suggestions for improvement:</p>
                          <ul className="space-y-1">
                            {codeEvaluation.suggestions.slice(0, 3).map((s, i) => (
                              <li key={i} className="text-sm text-amber-400/80 flex items-start gap-2">
                                <Lightbulb className="w-3 h-3 mt-1 flex-shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <button
                        onClick={() => setCodeEvaluation(null)}
                        className="mt-3 text-xs text-muted-foreground hover:text-white transition-colors"
                      >
                        Dismiss
                      </button>
                    </GlassPanel>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <GlassPanel className="flex-1 p-0 overflow-hidden">
                {activeTab === "code" ? (
                  <MonacoEditor
                    height="100%"
                    language={selectedLanguage}
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
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Pencil className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Whiteboard canvas</p>
                      <p className="text-sm">(Draw your system design here)</p>
                    </div>
                  </div>
                )}
              </GlassPanel>
            </div>
          </div>

          {interviewId && (
            <div className="flex justify-center mt-4">
              {useLiveKit ? (
                <LiveKitVoice
                  interviewId={interviewId}
                  onTranscript={handleVoiceTranscript}
                  onStatusChange={handleVoiceStatusChange}
                />
              ) : (
                <BrowserVoice
                  interviewId={interviewId}
                  onTranscript={handleVoiceTranscript}
                  onStatusChange={handleVoiceStatusChange}
                  onSendMessage={sendMessage}
                  lastAIResponse={lastAIResponse}
                />
              )}
            </div>
          )}
        </div>

        <Sheet open={hintOpen} onOpenChange={setHintOpen}>
          <SheetContent className="glass border-white/10">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                Hints
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {problem?.hints?.map((hint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                  <p className="text-sm">{hint}</p>
                </motion.div>
              )) || (
                <p className="text-muted-foreground">No hints available for this problem.</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}
