import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env from the server directory
dotenv.config();

import { generateImageAsync } from './services/imagen.service.js';
import { generateVideoVeoAsync } from './services/veo.service.js';
import { generateAudioAsync } from './services/audio.service.js';
import { stitchScenesAsync } from './services/stitching.service.js';

const runE2EPipeline = async () => {
    console.log("=====================================");
    console.log("🎬 STARTING END-TO-END VEO PIPELINE 🎬");
    console.log("=====================================\n");

    const scenes = [
        {
            duration_seconds: 8,
            image_prompt: "A cinematic wide shot of a modern, bright HR office with an Indian female professional looking directly at the camera. 8k resolution, photorealistic, cinematic lighting.",
            prompt: "A slow, smooth cinematic push-in towards the female professional. She smiles warmly and maintains eye contact with the viewer.",
            narration: "Welcome to the new remote work policy for 2026."
        },
        {
            duration_seconds: 8,
            image_prompt: "The same female HR professional pointing towards an empty space beside her. Modern HR office.",
            prompt: "The camera slowly pans to the left as the female professional gestures smoothly towards the empty space.",
            narration: "You can now work from home up to three days a week."
        }
    ];

    const stitchedClips = [];

    for (let i = 0; i < scenes.length; i++) {
        const sceneData = scenes[i];
        console.log(`\n--- Processing Scene ${i + 1} (${sceneData.duration_seconds}s) ---`);
        
        try {
            console.log(`[Imagen] Generating reference image...`);
            const imageUrl = await generateImageAsync(sceneData.image_prompt, "16:9", "female professional");
            console.log(`[Imagen] Done: ${imageUrl}`);

            console.log(`[Veo] Generating video...`);
            const videoUrl = await generateVideoVeoAsync(sceneData.prompt, sceneData.duration_seconds, "1920x1080", imageUrl);
            console.log(`[Veo] Done: ${videoUrl}`);

            let audioUrl = null;
            if (sceneData.narration) {
                console.log(`[Audio] Generating TTS...`);
                audioUrl = await generateAudioAsync(sceneData.narration);
                console.log(`[Audio] Done: ${audioUrl}`);
            }

            stitchedClips.push({
                videoPath: videoUrl,
                audioPath: audioUrl
            });
            
        } catch (error) {
            console.error(`Failed on Scene ${i + 1}:`, error);
            process.exit(1);
        }
    }

    console.log(`\n[Stitching] Commencing final stitch of ${stitchedClips.length} clips...`);
    
    // We need to pass the paths to the stitching service. 
    // The stitching service expects paths relative to the `server` directory or absolute paths.
    // Let's modify the stitchedClips to be absolute paths so stitching.service.js handles them cleanly.
    // But stitching.service.js assumes they start with /outputs/ and resolves them against server/public.
    // So we can leave them as is!
    
    try {
        const finalVideoUrl = await stitchScenesAsync(stitchedClips);
        console.log(`\n✅ E2E Pipeline Completed! Final video is at: server/public${finalVideoUrl}`);
    } catch (e) {
        console.error("Stitching failed:", e);
    }
};

runE2EPipeline();
