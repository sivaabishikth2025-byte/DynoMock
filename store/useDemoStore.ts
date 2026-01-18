"use client";

import { create } from "zustand";

interface InterviewState {
  isSpeaking: boolean;
  audioLevel: number;
  hintReady: boolean;
  timeRemaining: number;
  isRecording: boolean;
  status: "idle" | "listening" | "thinking" | "speaking";
  transcript: { sender: string; text: string }[];
}

interface AppState {
  reducedMotion: boolean;
  disable3D: boolean;
  captionsEnabled: boolean;
  selectedCategory: string | null;
  interview: InterviewState;
  setReducedMotion: (value: boolean) => void;
  setDisable3D: (value: boolean) => void;
  setCaptionsEnabled: (value: boolean) => void;
  setSelectedCategory: (category: string | null) => void;
  setIsSpeaking: (value: boolean) => void;
  setAudioLevel: (value: number) => void;
  setHintReady: (value: boolean) => void;
  setTimeRemaining: (value: number) => void;
  setIsRecording: (value: boolean) => void;
  setStatus: (status: InterviewState["status"]) => void;
  addTranscriptMessage: (sender: string, text: string) => void;
  resetInterview: () => void;
}

const initialInterviewState: InterviewState = {
  isSpeaking: false,
  audioLevel: 0,
  hintReady: true,
  timeRemaining: 1800,
  isRecording: false,
  status: "idle",
  transcript: [
    { sender: "AI", text: "Hello! I'm your AI interviewer. Let's start with a coding problem. Are you ready?" },
  ],
};

export const useDemoStore = create<AppState>((set) => ({
  reducedMotion: false,
  disable3D: false,
  captionsEnabled: true,
  selectedCategory: null,
  interview: initialInterviewState,
  setReducedMotion: (value) => set({ reducedMotion: value }),
  setDisable3D: (value) => set({ disable3D: value }),
  setCaptionsEnabled: (value) => set({ captionsEnabled: value }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setIsSpeaking: (value) =>
    set((state) => ({ interview: { ...state.interview, isSpeaking: value } })),
  setAudioLevel: (value) =>
    set((state) => ({ interview: { ...state.interview, audioLevel: value } })),
  setHintReady: (value) =>
    set((state) => ({ interview: { ...state.interview, hintReady: value } })),
  setTimeRemaining: (value) =>
    set((state) => ({ interview: { ...state.interview, timeRemaining: value } })),
  setIsRecording: (value) =>
    set((state) => ({ interview: { ...state.interview, isRecording: value } })),
  setStatus: (status) =>
    set((state) => ({ interview: { ...state.interview, status } })),
  addTranscriptMessage: (sender, text) =>
    set((state) => ({
      interview: {
        ...state.interview,
        transcript: [...state.interview.transcript, { sender, text }],
      },
    })),
  resetInterview: () => set({ interview: initialInterviewState }),
}));
