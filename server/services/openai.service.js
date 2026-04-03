import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// COST SAFEGUARD: Limit maximum duration for testing to prevent accidental high credit usage
const MAX_VIDEO_DURATION = 15; // Set to a conservative value for testing

export const generateVideoOpenAIAsync = async (prompt, targetDuration = 5, resolution = "1280x720") => {
    console.log(`[OpenAI Sora] Starting Task: Target Duration ${targetDuration}s (Capped at ${MAX_VIDEO_DURATION}s for safety)`);
    
    // Safety check for credits/duration
    const safeDuration = Math.min(targetDuration, MAX_VIDEO_DURATION);
    if (targetDuration > MAX_VIDEO_DURATION) {
        console.warn(`[OpenAI Sora] Requested duration ${targetDuration}s exceeds safety cap. Using ${MAX_VIDEO_DURATION}s.`);
    }

    try {
        // Note: As of early 2026, the Sora API follows an async pattern
        // We use the 'sora-2' model which is optimized for speed/iteration as requested
        console.log(`[OpenAI Sora] Initiating generation...`);
        
        let response = await openai.video.generations.create({
            model: "sora-2",
            prompt: prompt,
            duration: safeDuration,
            aspect_ratio: resolution === "720:1280" ? "9:16" : "16:9", // Simplified mapping
        });

        let videoId = response.id;
        console.log(`[OpenAI Sora] Generation initiated. ID: ${videoId}`);

        // Polling loop
        let attempts = 0;
        const maxAttempts = 60; // 10 minutes max (10s intervals)
        let finalVideoUrl = null;

        while (attempts < maxAttempts) {
            console.log(`[OpenAI Sora] Check #${attempts + 1} - Status: ${response.status}...`);
            
            if (response.status === 'completed') {
                finalVideoUrl = response.video.url;
                break;
            } else if (response.status === 'failed') {
                throw new Error(`OpenAI Sora generation failed: ${response.error?.message || 'Unknown error'}`);
            }

            await delay(10000);
            response = await openai.video.generations.retrieve(videoId);
            attempts++;
        }

        if (!finalVideoUrl) {
            throw new Error("OpenAI Sora generation timed out or failed to provide a URL.");
        }

        console.log(`[OpenAI Sora] Download started: ${finalVideoUrl}`);

        // Download and Save Locally
        const videoRes = await fetch(finalVideoUrl);
        if (!videoRes.ok) throw new Error(`Failed to download video from OpenAI. Status: ${videoRes.status}`);
        
        const arrayBuffer = await videoRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const publicDir = path.join(__dirname, '..', 'public');
        const scenesDir = path.join(publicDir, 'scenes');
        
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
        if (!fs.existsSync(scenesDir)) fs.mkdirSync(scenesDir);
        
        const fileName = `sora-${Date.now()}.mp4`;
        const filePath = path.join(scenesDir, fileName);
        
        fs.writeFileSync(filePath, buffer);
        console.log(`[OpenAI Sora] Saved locally: ${fileName}`);
        
        return `/scenes/${fileName}`;

    } catch (error) {
        console.error("[OpenAI Sora] Error:", error.message);
        throw error;
    }
};
