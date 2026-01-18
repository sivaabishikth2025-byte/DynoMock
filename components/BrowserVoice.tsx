"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Mic, MicOff, Loader2, AlertCircle, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrowserVoiceProps {
  interviewId: string;
  onTranscript: (speaker: string, text: string) => void;
  onStatusChange: (status: "idle" | "listening" | "thinking" | "speaking") => void;
  onSendMessage: (message: string) => Promise<void>;
  lastAIResponse?: string;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function BrowserVoice({ 
  onTranscript, 
  onStatusChange,
  onSendMessage,
  lastAIResponse
}: BrowserVoiceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);
  const lastAIResponseRef = useRef<string | undefined>(undefined);

  // Keep refs in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Speak AI responses when they come in
  useEffect(() => {
    if (lastAIResponse && lastAIResponse !== lastAIResponseRef.current) {
      lastAIResponseRef.current = lastAIResponse;
      speak(lastAIResponse);
    }
  }, [lastAIResponse]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setInterimText(interimTranscript);

      if (finalTranscript) {
        setInterimText("");
        onSendMessage(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" and "aborted" are normal - don't log them
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        onStatusChange("idle");
      }
    };

    recognition.onend = () => {
      // Use ref to get current state value
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart recognition:", e);
          setIsListening(false);
          onStatusChange("idle");
        }
      }
    };

    recognitionRef.current = recognition;
    synthRef.current = window.speechSynthesis;

    return () => {
      recognition.stop();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [onStatusChange, onSendMessage]);

  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 255);
        animationRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.error("Failed to get audio stream:", err);
    }
  }, []);

  const stopAudioVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !text) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to get a natural-sounding voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes("Google") || 
      v.name.includes("Samantha") || 
      v.name.includes("Daniel") ||
      v.lang.startsWith("en")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      onStatusChange("speaking");
      // Pause recognition while speaking to avoid feedback
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Resume recognition if it was active
      if (isListeningRef.current) {
        onStatusChange("listening");
        try {
          recognitionRef.current?.start();
        } catch (e) {
          // Ignore - may already be started
        }
      } else {
        onStatusChange("idle");
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isListeningRef.current) {
        onStatusChange("listening");
      } else {
        onStatusChange("idle");
      }
    };

    synthRef.current.speak(utterance);
  }, [onStatusChange]);

  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimText("");
      onStatusChange("idle");
      stopAudioVisualization();
    } else {
      try {
        // Cancel any ongoing speech first
        if (synthRef.current) {
          synthRef.current.cancel();
          setIsSpeaking(false);
        }
        
        await recognitionRef.current.start();
        setIsListening(true);
        onStatusChange("listening");
        startAudioVisualization();
      } catch (err) {
        console.error("Failed to start recognition:", err);
      }
    }
  }, [isListening, onStatusChange, startAudioVisualization, stopAudioVisualization]);

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-amber-400" />
        </div>
        <p className="text-sm text-amber-400">Voice not supported</p>
        <p className="text-xs text-muted-foreground">Use Chrome or Edge for voice</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          disabled={isSpeaking}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all relative z-10",
            isListening 
              ? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]" 
              : isSpeaking
              ? "bg-violet-500 shadow-[0_0_30px_rgba(167,139,250,0.5)]"
              : "bg-gradient-to-br from-violet-500 to-cyan-500 shadow-[0_0_30px_rgba(167,139,250,0.3)]",
            isSpeaking && "cursor-not-allowed"
          )}
        >
          {isSpeaking ? (
            <Volume2 className="w-7 h-7 text-white animate-pulse" />
          ) : isListening ? (
            <MicOff className="w-7 h-7 text-white" />
          ) : (
            <Mic className="w-7 h-7 text-white" />
          )}
        </motion.button>
        
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-400/50"
              animate={{
                scale: [1, 1.3 + audioLevel * 0.5],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-400/30"
              animate={{
                scale: [1, 1.5 + audioLevel * 0.5],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </>
        )}

        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-violet-400/50"
            animate={{
              scale: [1, 1.3],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {isSpeaking ? "AI speaking..." : isListening ? "Listening... (click to stop)" : "Click to speak"}
      </p>
      
      {interimText && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-cyan-400 max-w-[200px] text-center truncate"
        >
          {interimText}
        </motion.p>
      )}
    </div>
  );
}
