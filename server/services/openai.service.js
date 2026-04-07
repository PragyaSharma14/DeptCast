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

// PRO MAX_VIDEO_DURATION: sora-2-pro supports up to 20 seconds natively.
const MAX_VIDEO_DURATION = 20;

export const generateVideoOpenAIAsync = async (prompt, targetDuration = 8, resolution = "1920x1080") => {
    // CREDIT SAVING: If MOCK_SORA is enabled, bypass the API call
    if (process.env.MOCK_SORA === 'true') {
        console.log(`[OpenAI Sora] MOCK MODE ENABLED: Bypassing credit usage.`);
        await delay(2000); // Simulate some processing
        return "https://www.w3schools.com/html/mov_bbb.mp4"; // Reliable small sample 
    }

    console.log(`[OpenAI Sora] Starting Task: Target Duration ${targetDuration}s in ${resolution}`);
    
    // Safety check for credits/duration
    let safeDuration = Math.min(targetDuration, MAX_VIDEO_DURATION);
    // Sora native durations are typically 8, 16, 20.
    if (safeDuration > 8 && safeDuration < 16) safeDuration = 8;
    if (safeDuration > 16 && safeDuration < 20) safeDuration = 16;
    
    try {
        console.log(`[OpenAI Sora] Initiating generation via create (polling mode)...`);
        
        let video = await openai.videos.create({
            model: "sora-2-pro",
            prompt: prompt,
            seconds: safeDuration.toString(),
            size: resolution, 
        });

        console.log(`[OpenAI Sora] Generation queued. ID: ${video.id}`);
        
        // Manual Polling loop to wait for completion
        let attempts = 0;
        const maxAttempts = 60; // Up to 10 minutes (10s intervals)
        
        while ((video.status === 'queued' || video.status === 'in_progress') && attempts < maxAttempts) {
            console.log(`[OpenAI Sora] Polling status... Attempt ${attempts + 1}/60 [Status: ${video.status}]`);
            await delay(10000); // Poll every 10 seconds
            video = await openai.videos.retrieve(video.id);
            attempts++;
        }

        if (video.status !== 'completed') {
            throw new Error(`OpenAI Sora generation unsuccessful or timed out. Status: ${video.status}`);
        }

        console.log(`[OpenAI Sora] Generation complete. ID: ${video.id}`);
        console.log(`[OpenAI Sora] Downloading MP4 content to disk...`);

        // We MUST download the file because Sora URLs expire in 1 hour
        const content = await openai.videos.downloadContent(video.id);
        const arrayBuffer = await content.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const publicDir = path.join(__dirname, '..', 'public');
        const outputsDir = path.join(publicDir, 'outputs');
        
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
        if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
        
        const fileName = `sora_${video.id}_${Date.now()}.mp4`;
        const filePath = path.join(outputsDir, fileName);
        
        fs.writeFileSync(filePath, buffer);
        console.log(`[OpenAI Sora] Saved successfully: ${fileName}`);
        
        return `/outputs/${fileName}`;
    } catch (error) {
        console.error("[OpenAI Sora] Error:", error.message);
        throw error;
    }
};
