# Video-AI Platform

A complete, scalable, and modular AI video generation platform. The system takes user intent via a beautiful web interface, orchestrates a multi-agent AI swarm (Director & Critic) to write structured cinematic scenes, and generates the final video clips asynchronously via Google Gemini Veo APIs.

## 🏗️ Architecture Overview

The system is highly decoupled and consists of three main local services working together:

### 1. Client App (Frontend)
- **Tech Stack:** React, Vite, Tailwind CSS v4, Zustand.
- **Role:** Provides the Next-Gen UI for users to select their department, avatar, voice, and dimensions. Displays real-time status of backend video generation. Contains a 3D background using React Three Fiber.

### 2. Main Node.js Backend Server (Orchestrator)
- **Tech Stack:** Node.js, Express, MySQL, Prisma ORM.
- **Role:** Acts as the central nervous system.
  - Receives the frontend requests.
  - Manages database state (Projects, Scenes, Users) using **Prisma** on **MySQL**.
  - Triggers the Python AutoGen microservice.
  - Orchestrates asynchronous LRO polling to the Google Gemini Veo API to track long-running video rendering tasks.

### 3. AutoGen Python Microservice (AI Swarm)
- **Tech Stack:** Python, FastAPI (`uvicorn`), PyAutoGen, Groq Llama 3.
- **Role:** Handles the complex reasoning required to write cinematic prompts.
  - **Director Agent:** Takes the user parameters and writes a structured array of detailed cinematic scenes tailored specifically to Google Veo constraints.
  - **Critic Agent:** An adversarial agent that reviews the Director's output for formatting errors, missing constraints, and strict JSON compliance, forcing revisions if necessary.
  - **UserProxy Agent:** Manages the group chat loop between the agents and returns the final JSON to the Node.js server.

### 4. External APIs
- **Google Gemini Veo 3.1:** Renders the cinematic text prompts into high-quality MP4 videos.
- **Groq API:** Powers the AutoGen agent swarm with ultra-fast Llama 3 models.

---

## 🚀 Setup & Execution (Three Terminals Required)

To run the application locally, you must run all three services simultaneously. Open three separate terminal windows.

### Environment Variables
Ensure you have the following keys in your `server/.env` file:
```env
DATABASE_URL="mysql://user:password@localhost:3306/video_ai"
GEMINI_API_KEY="your_gemini_api_key_here"
GROQ_API_KEY="your_groq_key_here"
PORT=5000
```
Note: The Python service shares this `.env` file by going up one directory.

---

### Terminal 1: Node.js Backend Server
This runs the primary API and database ORM layer.

```powershell
# 1. Navigate to the server folder
cd server

# 2. Install dependencies
npm install

# 3. Synchronize your Prisma Schema with MySQL
npx prisma db push

# 4. Start the Node.js API
npm start
```
*(Runs on http://localhost:5000)*

---

### Terminal 2: AutoGen Python Microservice
This runs the AI Swarm on FastAPI. **Important for Windows Users:** You must activate the virtual environment so PowerShell knows where `uvicorn` is natively installed.

```powershell
# 1. Navigate to the Python service directory
cd server/autogen_service

# 2. Create a virtual environment (if you haven't already)
python -m venv venv

# 3. ACTIVATE THE VIRTUAL ENVIRONMENT (Crucial Step!)
.\venv\Scripts\activate

# 4. Install requirements 
pip install -r requirements.txt
# (Make sure pyautogen, fastapi, uvicorn, python-dotenv, groq are installed)

# 5. Run the FastAPI server
uvicorn main:app --port 8000 --host 0.0.0.0 --reload
```
*(Runs on http://localhost:8000)*

---

### Terminal 3: React Frontend Client
This runs the UI layer.

```powershell
# 1. Navigate to the frontend folder
cd client

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
*(Runs on http://localhost:5173)*

---

## 💡 How the Flow Works
1. From Terminal 3 (React), you submit a Video Request.
2. Terminal 1 (Node.js) saves a Draft Project to MySQL, then sends the prompt to Terminal 2 (Python).
3. Terminal 2 spins up the Groq-powered Agent Swarm to argue and refine the script, returning valid JSON to Node.js.
4. Terminal 1 saves the Scenes to MySQL, dispatches generation jobs to Google Gemini Veo API, and polls the LRO endpoints 10 seconds at a time until completed.
5. Terminal 3 displays the final videos as they complete!
