import { NextResponse } from "next/server";
import { 
  createLiveKitToken, 
  getLiveKitUrl, 
  isLiveKitConfigured,
  createRoomForInterview 
} from "@/lib/livekit";
import { DEMO_USER_ID } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { roomName, participantName, interviewId } = await request.json();

    if (!isLiveKitConfigured()) {
      return NextResponse.json(
        { 
          error: "LiveKit not configured",
          fallbackMode: true,
          message: "Voice interview will use browser-based voice. Configure LiveKit for AI voice agent."
        },
        { status: 200 }
      );
    }

    const finalRoomName = roomName || `interview-${interviewId || Date.now()}`;

    // Create the room - this will trigger the agent to join automatically
    // if you have agents deployed to LiveKit Cloud
    try {
      await createRoomForInterview(finalRoomName);
    } catch (roomError) {
      console.log("Room creation (may already exist):", roomError);
    }

    // Create token for the candidate to join
    const token = await createLiveKitToken(
      finalRoomName,
      participantName || "Candidate",
      DEMO_USER_ID
    );

    return NextResponse.json({
      token,
      url: getLiveKitUrl(),
      roomName: finalRoomName,
      fallbackMode: false,
    });
  } catch (error) {
    console.error("LiveKit token error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create token",
        fallbackMode: true,
        message: "Voice interview will use browser-based voice"
      },
      { status: 200 }
    );
  }
}
