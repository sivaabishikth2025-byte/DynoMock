"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  LiveKitRoom,
  useLocalParticipant,
  useRoomContext,
  RoomAudioRenderer,
  useTracks,
  useParticipants,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, RoomEvent, ConnectionState } from "livekit-client";
import { Mic, MicOff, Loader2, AlertCircle, Volume2, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveKitVoiceProps {
  interviewId: string;
  onTranscript: (speaker: string, text: string) => void;
  onStatusChange: (status: "idle" | "listening" | "thinking" | "speaking") => void;
}

function VoiceControls({ 
  onTranscript, 
  onStatusChange,
  interviewId 
}: { 
  onTranscript: (speaker: string, text: string) => void;
  onStatusChange: (status: "idle" | "listening" | "thinking" | "speaking") => void;
  interviewId: string;
}) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const participants = useParticipants();
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [agentConnected, setAgentConnected] = useState(false);

  const tracks = useTracks([Track.Source.Microphone]);

  // Check if AI agent is connected
  useEffect(() => {
    const agentParticipant = participants.find(p => 
      p.identity.includes("agent") || 
      p.name?.toLowerCase().includes("interviewer") ||
      p.isAgent
    );
    setAgentConnected(!!agentParticipant);
  }, [participants]);

  useEffect(() => {
    if (!room) return;

    const handleConnectionChange = (state: ConnectionState) => {
      setConnectionState(state);
      if (state === ConnectionState.Connected) {
        onStatusChange("idle");
      }
    };

    const handleActiveSpeakers = (speakers: any[]) => {
      if (speakers.length > 0) {
        const maxLevel = Math.max(...speakers.map(s => s.audioLevel || 0));
        setAudioLevel(maxLevel);
        
        // Check if agent is speaking
        const agentSpeaking = speakers.some(s => 
          s.identity?.includes("agent") || s.isAgent
        );
        if (agentSpeaking) {
          onStatusChange("speaking");
        }
      } else {
        setAudioLevel(0);
      }
    };

    const handleTrackSubscribed = (track: any, publication: any, participant: any) => {
      if (track.kind === "audio" && participant.identity !== localParticipant?.identity) {
        onStatusChange("speaking");
      }
    };

    const handleDataReceived = (payload: Uint8Array, participant: any) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));
        
        if (data.type === "transcript") {
          onTranscript(data.speaker, data.text);
        }
        if (data.type === "status") {
          onStatusChange(data.status);
        }
        if (data.type === "agent_message") {
          onTranscript("AI", data.text);
          onStatusChange("speaking");
        }
      } catch (e) {
        console.error("Failed to parse data message:", e);
      }
    };

    // Handle transcription events from the agent
    const handleTranscription = (segments: any[], participant: any) => {
      const text = segments.map(s => s.text).join(" ");
      if (text) {
        const speaker = participant?.identity?.includes("agent") ? "AI" : "User";
        onTranscript(speaker, text);
      }
    };

    room.on(RoomEvent.ConnectionStateChanged, handleConnectionChange);
    room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers);
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.DataReceived, handleDataReceived);
    room.on(RoomEvent.TranscriptionReceived, handleTranscription);

    // Set initial connection state
    setConnectionState(room.state);

    return () => {
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionChange);
      room.off(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.DataReceived, handleDataReceived);
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room, localParticipant, onTranscript, onStatusChange]);

  const toggleMicrophone = useCallback(async () => {
    if (!localParticipant) return;
    
    try {
      setIsProcessing(true);
      const newState = !isMicEnabled;
      await localParticipant.setMicrophoneEnabled(newState);
      setIsMicEnabled(newState);
      onStatusChange(newState ? "listening" : "idle");
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [localParticipant, isMicEnabled, onStatusChange]);

  const isConnected = connectionState === ConnectionState.Connected;
  const isConnecting = connectionState === ConnectionState.Connecting;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Connection status */}
      <div className="flex items-center gap-2 text-xs">
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">Connected</span>
            {agentConnected ? (
              <span className="text-violet-400">• AI Agent Ready</span>
            ) : (
              <span className="text-amber-400">• Waiting for AI Agent...</span>
            )}
          </>
        ) : isConnecting ? (
          <>
            <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
            <span className="text-amber-400">Connecting...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-red-400" />
            <span className="text-red-400">Disconnected</span>
          </>
        )}
      </div>

      {/* Microphone button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMicrophone}
        disabled={isProcessing || !isConnected}
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-all relative",
          !isConnected && "opacity-50 cursor-not-allowed",
          isMicEnabled 
            ? "bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]" 
            : "bg-gradient-to-br from-violet-500 to-cyan-500 shadow-[0_0_40px_rgba(167,139,250,0.3)]"
        )}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isMicEnabled ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
        
        {isMicEnabled && audioLevel > 0 && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-400"
            animate={{
              scale: 1 + audioLevel * 0.5,
              opacity: 1 - audioLevel * 0.5,
            }}
            transition={{ duration: 0.1 }}
          />
        )}
      </motion.button>
      
      <p className="text-sm text-muted-foreground">
        {!isConnected 
          ? "Connecting to AI agent..." 
          : isMicEnabled 
          ? "Click to mute" 
          : "Click to speak"}
      </p>
    </div>
  );
}

export function LiveKitVoice({ interviewId, onTranscript, onStatusChange }: LiveKitVoiceProps) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [roomName, setRoomName] = useState<string>("");

  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            roomName: `interview-${interviewId}`,
            participantName: "Candidate",
            interviewId
          }),
        });
        
        const data = await res.json();
        
        if (data.fallbackMode) {
          setError(data.message || "Voice mode unavailable");
          setIsConnecting(false);
          return;
        }
        
        setToken(data.token);
        setServerUrl(data.url);
        setRoomName(data.roomName);
        setIsConnecting(false);
      } catch (err) {
        console.error("Failed to get LiveKit token:", err);
        setError("Failed to connect to voice service");
        setIsConnecting(false);
      }
    };

    getToken();
  }, [interviewId]);

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Connecting to AI interviewer...</p>
      </div>
    );
  }

  if (error || !token || !serverUrl) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <p className="text-sm text-amber-400">{error || "Voice unavailable"}</p>
        <p className="text-xs text-muted-foreground">Using browser voice instead</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={false}
      video={false}
      onConnected={() => {
        console.log("Connected to LiveKit room:", roomName);
        onStatusChange("idle");
      }}
      onDisconnected={() => {
        console.log("Disconnected from LiveKit room");
        onStatusChange("idle");
      }}
      onError={(err) => {
        console.error("LiveKit error:", err);
        setError("No AI agent available - close this and use browser voice");
      }}
    >
      <RoomAudioRenderer />
      <VoiceControls 
        onTranscript={onTranscript}
        onStatusChange={onStatusChange}
        interviewId={interviewId}
      />
    </LiveKitRoom>
  );
}
