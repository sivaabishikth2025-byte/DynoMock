import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import OpenAI from "openai";

const QWEN_API_KEY = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY || "placeholder";
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || "https://openrouter.ai/api/v1";
const QWEN3_TEXT_MODEL = process.env.QWEN3_TEXT_MODEL || "qwen/qwen3-235b-a22b:free";

function createQwenClient(): OpenAI {
  return new OpenAI({
    apiKey: QWEN_API_KEY,
    baseURL: QWEN_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": "https://dynomock.app",
      "X-Title": "Dyno Mock Interview Platform",
    },
  });
}

export async function POST(request: Request) {
  try {
    const { interviewId, userMessage, questionPhase } = await request.json();

    if (!interviewId || !userMessage) {
      return NextResponse.json(
        { error: "interviewId and userMessage are required" },
        { status: 400 }
      );
    }

    const { data: interview, error: interviewError } = await supabaseAdmin
      .from("interviews")
      .select("*, problems(*)")
      .eq("id", interviewId)
      .single();

    if (interviewError || !interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const problem = interview.problems;
    const transcript = interview.transcript || [];

    // Add user message to transcript
    transcript.push({
      time: new Date().toISOString(),
      speaker: "User",
      text: userMessage,
    });

    // Analyze conversation state
    const messageCount = transcript.filter(t => t.speaker === "User").length;
    const hasDiscussedApproach = transcript.some(t => 
      t.text.toLowerCase().includes("approach") || 
      t.text.toLowerCase().includes("solution") ||
      t.text.toLowerCase().includes("algorithm")
    );
    
    // Determine current phase of interview
    let currentPhase = questionPhase || "discussion";
    if (messageCount <= 2) {
      currentPhase = "introduction";
    } else if (messageCount <= 5 && !hasDiscussedApproach) {
      currentPhase = "reasoning";
    } else {
      currentPhase = "coding";
    }

    // Generate contextual response
    const aiResponse = await generateSmartResponse(
      problem,
      transcript,
      userMessage,
      currentPhase
    );

    // Add AI response to transcript
    transcript.push({
      time: new Date().toISOString(),
      speaker: "AI",
      text: aiResponse.message,
      questionType: aiResponse.questionType,
    });

    // Update interview
    await supabaseAdmin
      .from("interviews")
      .update({ transcript })
      .eq("id", interviewId);

    return NextResponse.json({
      response: aiResponse.message,
      questionType: aiResponse.questionType,
      shouldPromptCode: aiResponse.shouldPromptCode,
      transcript,
    });
  } catch (error) {
    console.error("Interview chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

async function generateSmartResponse(
  problem: any,
  transcript: any[],
  userMessage: string,
  phase: string
): Promise<{ message: string; questionType: "reasoning" | "coding" | "feedback"; shouldPromptCode: boolean }> {
  const qwen = createQwenClient();
  
  const transcriptText = transcript
    .slice(-12)
    .map(t => `${t.speaker}: ${t.text}`)
    .join("\n");

  // Detect user intent
  const isAskingQuestion = /\?|how|what|why|can you|could you|explain|help|stuck|don't understand|confused/i.test(userMessage);
  const isDescribingApproach = /i think|my approach|i would|here's|let me|so basically|the idea is|we can|we could|first|then/i.test(userMessage);
  const isReadyToCode = /ready|let me code|i'll write|start coding|implement|code it|write the code/i.test(userMessage);
  const isAskingForHint = /hint|help|stuck|clue|guidance/i.test(userMessage);

  const systemPrompt = `You are an expert technical interviewer conducting a mock coding interview. The interview has different phases:

CURRENT PHASE: ${phase}

Your behavior depends on the phase:

## INTRODUCTION PHASE (first few exchanges):
- Welcome the candidate warmly
- Present the problem clearly
- Ask them to think about the problem and discuss their initial thoughts
- Ask a REASONING question like "What's your first instinct when you see this problem?" or "What data structures might be useful here?"

## REASONING PHASE:
- Ask thought-provoking questions about their approach
- Questions like: "What's the time complexity of that approach?", "How would you handle edge cases like empty input?", "Can you think of a more efficient solution?"
- When they have a solid approach, transition to coding by saying something like "Great approach! Now let's see you implement it. Please write your code in the editor and submit when ready."

## CODING PHASE:
- If they haven't submitted code, encourage them to write and submit their solution
- If they're stuck, offer hints from the problem hints
- When they say they're ready to code, respond with: "Go ahead and implement your solution in the code editor. Click 'Submit Solution' when you're done, and I'll review your code."

## FEEDBACK PHASE (after code evaluation):
- If code was correct: Congratulate them, explain any optimizations possible
- If code had issues: Explain what went wrong, guide them to fix it

IMPORTANT RULES:
1. Keep responses to 2-4 sentences max
2. Actually ANSWER questions when asked - don't just deflect with another question
3. Be encouraging and supportive
4. When transitioning to coding, clearly tell them to use the code editor
5. Use the problem hints when they're stuck

PROBLEM: ${problem.title}
${problem.statement}

HINTS (use when candidate is stuck):
${(problem.hints || []).map((h: string, i: number) => `${i + 1}. ${h}`).join("\n")}`;

  try {
    const response = await qwen.chat.completions.create({
      model: QWEN3_TEXT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `CONVERSATION SO FAR:
${transcriptText}

CANDIDATE'S MESSAGE: "${userMessage}"

${isAskingQuestion ? "[CONTEXT: Candidate is asking a question - provide a helpful answer]" : ""}
${isDescribingApproach ? "[CONTEXT: Candidate is explaining their approach - give constructive feedback]" : ""}
${isReadyToCode ? "[CONTEXT: Candidate wants to code - direct them to the code editor]" : ""}
${isAskingForHint ? "[CONTEXT: Candidate needs a hint - provide one from the hints list]" : ""}

Respond appropriately for the ${phase} phase:`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    let content = response.choices[0].message.content || "";
    // Clean up thinking tags
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Determine question type and if we should prompt for code
    let questionType: "reasoning" | "coding" | "feedback" = "reasoning";
    let shouldPromptCode = false;

    if (phase === "coding" || isReadyToCode || content.toLowerCase().includes("code editor") || content.toLowerCase().includes("implement")) {
      questionType = "coding";
      shouldPromptCode = true;
    }

    if (!content) {
      content = phase === "coding" 
        ? "Please go ahead and implement your solution in the code editor. Click 'Submit Solution' when you're ready for me to review it."
        : "That's interesting! Can you tell me more about your thought process?";
    }

    return {
      message: content,
      questionType,
      shouldPromptCode,
    };
  } catch (error) {
    console.error("AI response error:", error);
    return {
      message: "I see. Let's continue working through this problem together.",
      questionType: "reasoning",
      shouldPromptCode: false,
    };
  }
}
