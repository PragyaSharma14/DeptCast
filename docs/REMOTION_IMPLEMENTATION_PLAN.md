# REMOTION PIPELINE: IMPLEMENTATION PLAN

Below is the step-by-step technical plan for integrating the new Remotion-based infographic video pipeline into the DeptCast application.

## Phase 1: Setup & Initialization
1. Initialize a new Remotion project workspace (e.g., `npx create-video@latest remotion-templates`) alongside the `client` and `server` folders.
2. Install core Remotion dependencies (`remotion`, `@remotion/cli`, `@remotion/player`) and any necessary charting libraries (e.g., `recharts` or `chart.js` for React).
3. Set up the basic Composition configuration (defining FPS, width, height, and duration calculations).

## Phase 2: Generative Video Agent (The "Gamma" Approach)
Instead of building rigid, predefined templates where only the text changes, we will build an **Agentic Generative UI** pipeline.
1. **Atomic Design System:** We will build a library of highly flexible, atomic Remotion components (e.g., `<DynamicLayout>`, `<AnimatedText>`, `<BentoGrid>`, `<Chart>`, `<MediaBlock>`).
2. **The Layout Agent:** We will train/prompt a dedicated AutoGen agent (acting as an Art Director) to generate a rich JSON Abstract Syntax Tree (AST). This AST will dictate the layout structure, color palettes, typography choices, and animations for *every single scene*.
3. **Dynamic Rendering:** A master `DynamicComposition` component in Remotion will recursively parse this AST and construct the video on the fly. This means the AI decides if a scene should have a 2-column split, a bento box layout, or a full-screen chart. Every video will be structurally unique.
4. **Optional - Code Generation Agent:** For ultimate flexibility, we can have a Coder Agent that literally writes raw React/Remotion `.tsx` files on the fly, saves them temporarily to the server, and renders them. This allows the AI to invent entirely new animations that weren't even in our component library.
4. Integrate the `<Audio>` component to support background tracks and TTS voiceovers.

## Phase 3: Backend Integration (Node.js)
1. Install `@remotion/renderer` in the `server/package.json`.
2. Create a new service file (`server/services/remotion.service.js`) that takes the JSON script from AutoGen.
3. Use the `renderMedia` API inside the Node.js backend to programmatically bundle the React code, inject the dynamic JSON props, and render the `.mp4` file using headless Chromium and FFmpeg.
4. Update `video.controller.js` to intelligently route rendering requests:
   - If style == "Hyper Realistic" -> Use Google Veo.
   - If style == "Infographics" -> Use `remotion.service.js`.

## Phase 4: AutoGen AI Scripting Adjustments
1. Modify `server/autogen_service/agents.py`.
2. Update the system prompt for the "Infographics" path so Gemini Flash-Lite outputs a strictly typed JSON structure (matching the props required by the Remotion templates).
3. Ensure the AI includes data points suitable for charts rather than just paragraph text.

## Phase 5: Production Scaling (AWS Lambda)
1. Transition from local CPU rendering (`@remotion/renderer`) to serverless rendering using `@remotion/lambda`.
2. Configure AWS IAM roles and S3 buckets.
3. Update the backend service to dispatch chunked render jobs to AWS Lambda, reducing video render times from ~60 seconds down to ~5 seconds through parallelization.
