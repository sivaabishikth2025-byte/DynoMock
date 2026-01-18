"""
Dyno Mock - AI Technical Interview Agent

This agent conducts voice-based technical interviews using LiveKit.
It connects to the interview room and guides candidates through coding problems.
"""

import os
import json
import aiohttp
from dotenv import load_dotenv
from typing import Optional

from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io, function_tool
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv(".env.local")

# Backend API URL for fetching interview data
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")


class InterviewerAgent(Agent):
    """AI Technical Interviewer Agent"""
    
    def __init__(
        self,
        problem_title: str = "Coding Problem",
        problem_statement: str = "",
        problem_hints: list[str] = None,
        problem_category: str = "Algorithms",
    ) -> None:
        self.problem_title = problem_title
        self.problem_statement = problem_statement
        self.problem_hints = problem_hints or []
        self.problem_category = problem_category
        self.hints_given = 0
        self.conversation_started = False
        
        instructions = f"""You are a friendly, supportive, and professional technical interviewer conducting a mock interview. 

## Your Role
- Guide the candidate through the coding problem
- Be encouraging and help them think through the problem
- Actually ANSWER questions when asked - don't just ask more questions back
- Provide helpful hints when they're stuck
- Give constructive feedback on their approach

## The Problem Being Discussed
**{problem_title}** ({problem_category})

{problem_statement}

## Guidelines
1. When the candidate asks a question (like "how does X work?" or "can you explain Y?"):
   - Actually explain the concept clearly
   - Give useful information without giving away the full solution
   - Be educational and helpful

2. When the candidate explains their approach:
   - Acknowledge what's good about their thinking
   - Point out edge cases or potential issues
   - Ask clarifying questions if needed

3. When the candidate seems stuck:
   - Offer a hint to help them move forward
   - Break down the problem into smaller steps
   - Suggest what to think about next

4. Keep responses conversational and concise (2-4 sentences typically)
5. Be encouraging - this is practice, not a real interview
6. Don't write code for them, but help them understand concepts

## Available Hints (use sparingly)
{chr(10).join([f"{i+1}. {hint}" for i, hint in enumerate(problem_hints or [])])}

Remember: You are here to HELP the candidate learn and improve. Be supportive!"""

        super().__init__(instructions=instructions)
    
    @function_tool()
    async def give_hint(self) -> str:
        """Give the candidate a hint when they're stuck"""
        if self.hints_given < len(self.problem_hints):
            hint = self.problem_hints[self.hints_given]
            self.hints_given += 1
            return f"Here's a hint: {hint}"
        return "I've given all available hints. Let me help you think through the problem differently."
    
    @function_tool()
    async def evaluate_approach(self, approach: str) -> str:
        """Evaluate the candidate's approach to the problem"""
        return f"""Evaluating approach: {approach}
        
Consider:
- Time complexity implications
- Space complexity trade-offs  
- Edge cases that might break this approach
- Is there a more optimal solution?"""
    
    @function_tool()
    async def explain_concept(self, concept: str) -> str:
        """Explain a programming concept to help the candidate"""
        return f"Let me explain {concept} in the context of this problem..."


async def fetch_interview_data(interview_id: str) -> Optional[dict]:
    """Fetch interview and problem data from the backend"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BACKEND_URL}/api/interviews?id={interview_id}") as resp:
                if resp.status == 200:
                    return await resp.json()
    except Exception as e:
        print(f"Failed to fetch interview data: {e}")
    return None


async def update_interview_transcript(interview_id: str, speaker: str, text: str):
    """Send transcript update to the backend"""
    try:
        async with aiohttp.ClientSession() as session:
            await session.put(
                f"{BACKEND_URL}/api/interviews",
                json={
                    "id": interview_id,
                    "transcript_entry": {
                        "time": "",
                        "speaker": speaker,
                        "text": text
                    }
                }
            )
    except Exception as e:
        print(f"Failed to update transcript: {e}")


# Create the agent server
server = AgentServer()


@server.rtc_session()
async def interview_session(ctx: agents.JobContext):
    """Main interview session entrypoint"""
    
    # Extract interview ID from room name (format: interview-{id})
    room_name = ctx.room.name
    interview_id = None
    if room_name.startswith("interview-"):
        interview_id = room_name.replace("interview-", "")
    
    # Default problem if we can't fetch from backend
    problem_title = "Two Sum"
    problem_statement = """Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1]."""
    problem_hints = [
        "Consider using a hash map to store values you've seen",
        "For each number, what would you need to find to reach the target?",
        "You can solve this in a single pass through the array"
    ]
    problem_category = "Algorithms"
    
    # Try to fetch actual interview data
    if interview_id:
        interview_data = await fetch_interview_data(interview_id)
        if interview_data and interview_data.get("problems"):
            problem = interview_data["problems"]
            problem_title = problem.get("title", problem_title)
            problem_statement = problem.get("statement", problem_statement)
            problem_hints = problem.get("hints", problem_hints)
            problem_category = problem.get("category", problem_category)
    
    # Create the interviewer agent with problem context
    interviewer = InterviewerAgent(
        problem_title=problem_title,
        problem_statement=problem_statement,
        problem_hints=problem_hints,
        problem_category=problem_category,
    )
    
    # Create the voice session with STT-LLM-TTS pipeline
    session = AgentSession(
        # Speech-to-Text: AssemblyAI Universal Streaming via LiveKit Inference
        stt="assemblyai/universal-streaming:en",
        # LLM: OpenAI GPT-4.1 mini via LiveKit Inference
        llm="openai/gpt-4.1-mini",
        # Text-to-Speech: Cartesia Sonic-3 via LiveKit Inference
        tts="cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        # Voice Activity Detection
        vad=silero.VAD.load(),
        # Turn detection for natural conversation
        turn_detection=MultilingualModel(),
    )
    
    # Set up event handlers for transcript logging
    @session.on("user_input_transcribed")
    async def on_user_speech(event):
        if interview_id and event.text:
            await update_interview_transcript(interview_id, "User", event.text)
    
    @session.on("agent_speech_started") 
    async def on_agent_speech(event):
        # Agent speech is logged when we have the full text
        pass
    
    # Start the session
    await session.start(
        room=ctx.room,
        agent=interviewer,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                # Use appropriate noise cancellation based on participant type
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony() 
                    if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP 
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )
    
    # Generate the initial greeting
    greeting = f"""Hello! I'm your AI interviewer today. 
    
We'll be working on a {problem_category} problem called "{problem_title}". 

I'll present the problem, and you can think out loud as you work through it. 
Feel free to ask me any questions - I'm here to help you learn and improve. 

Whenever you're ready, let me know and I'll walk you through the problem."""

    await session.generate_reply(instructions=greeting)


if __name__ == "__main__":
    agents.cli.run_app(server)


