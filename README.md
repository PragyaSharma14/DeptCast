# AI Video Generation SaaS

A complete, scalable, and modular AI video generation platform that takes user intent, structures it using templates and LLMs, generates cinematic scenes concurrently via Runway/Veo APIs, and stitches them into a final video using FFmpeg.

## Architecture

**Frontend** (Client):
- Next-Gen UI with Vite + React 19 + Tailwind CSS v4.
- State Management for multi-step workflow: Dashboard -> Intent -> AI Planning -> Generation -> Final Playback.
- 3D background using React Three Fiber.

**Backend** (Server):
- Node.js + Express + MongoDB.
- **Intent Analyzer**: Uses `@google/genai` (Gemini 2.5 Flash) to parse user requirements.
- **Template Engine**: JSON-based domain templates for structured pacing and tones (Marketing, Finance, IT, etc.).
- **Scene Generator**: Creates structured video scripts dynamically.
- **Veo Orchestrator**: Hits the RunwayML SDK asynchronously for multiple parallel video generations.
- **FFmpeg Stitcher**: Merges generated scenes into a master video output.

## Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- FFmpeg installed on your machine (`brew install ffmpeg` or download for Windows).
- API Keys:
  - `GEMINI_API_KEY`: For Intent Analysis and Planning.
  - `RUNWAY_API_KEY`: For Veo video generation.

## Setup Instructions

### 1. Backend Setup
1. `cd server`
2. `npm install`
3. Create a `.env` file in the `server` directory and add:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   RUNWAY_API_KEY=your_runway_api_key
   ```
4. Start the backend: `npm start` (Runs on http://localhost:5000)

### 2. Frontend Setup
1. `cd client`
2. `npm install`
3. Create a `.env` file in the `client` directory and add:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend: `npm run dev` (Runs on http://localhost:5173)

---

## Technical Features Implemented
- **MongoDB Mongoose Models**: User, Project, Scene, Template.
- **RESTful API**: Orchestrates complex long-running generative tasks.
- **Concurrency**: Generates multiple scenes in parallel to drastically reduce wait time.
- **Custom UI**: Beautiful Glassmorphic UI with lucid icons and scene breakdown preview.
