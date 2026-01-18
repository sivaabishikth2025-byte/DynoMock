# Dyno Mock - AI Interview Agent

This is the LiveKit voice agent that conducts AI-powered technical interviews.

## Prerequisites

1. **Python 3.10+** - Required for LiveKit Agents
2. **LiveKit Cloud account** - Get one at https://cloud.livekit.io (free tier available)
3. **UV package manager** - Install with `curl -LsSf https://astral.sh/uv/install.sh | sh`

## Setup

### 1. Install dependencies

```bash
cd agent
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
```

### 2. Configure environment variables

Copy the example env file and fill in your LiveKit credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your LiveKit Cloud credentials:
- `LIVEKIT_API_KEY` - From your LiveKit Cloud project
- `LIVEKIT_API_SECRET` - From your LiveKit Cloud project  
- `LIVEKIT_URL` - Your LiveKit Cloud WebSocket URL (e.g., `wss://your-project.livekit.cloud`)

### 3. Download model files

```bash
python interview_agent.py download-files
```

### 4. Run the agent locally

For development (connects to your LiveKit Cloud):
```bash
python interview_agent.py dev
```

For production:
```bash
python interview_agent.py start
```

## Deploy to LiveKit Cloud

From the agent directory, run:
```bash
lk agent create
```

This will:
1. Create a Dockerfile for your agent
2. Build and deploy to LiveKit Cloud
3. Your agent will automatically join interview rooms

## How it Works

1. When a user starts an interview on the frontend, a LiveKit room is created
2. The AI agent automatically joins the room
3. The agent uses:
   - **AssemblyAI** for Speech-to-Text (via LiveKit Inference)
   - **OpenAI GPT-4.1 mini** for intelligence (via LiveKit Inference)
   - **Cartesia Sonic-3** for natural voice (via LiveKit Inference)
4. The agent conducts the interview based on the problem context
5. All conversation is transcribed and saved to the interview record

## Customization

Edit `interview_agent.py` to customize:
- Interview style and prompts
- AI model selection
- Voice selection
- Tool functions available to the agent

## Testing

Use the LiveKit Agents Playground to test your agent:
https://agents-playground.livekit.io/

Or run in console mode (local only):
```bash
python interview_agent.py console
```

## Frontend Configuration

Make sure your Next.js app has these environment variables:

```env
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

## Troubleshooting

### Agent not joining room
- Check that your agent is running (`python interview_agent.py dev`)
- Verify LiveKit credentials are correct
- Check LiveKit Cloud dashboard for agent status

### No voice output
- Ensure your browser allows microphone access
- Check that audio output device is working
- Try the LiveKit Playground to test connectivity

### High latency
- LiveKit Inference provides lowest latency
- Consider using different regions if latency is high
- Check network connectivity


