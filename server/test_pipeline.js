import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateReferenceImageAsync } from './services/imagen.service.js';
import { generateVideoVeoAsync } from './services/veo.service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
    console.log("--- STARTING IMAGE+VIDEO PIPELINE TEST ---");
    
    const testPrompt = "A futuristic office with diverse employees collaborating, cinematic lighting, 8k resolution";
    const department = "HR";
    
    try {
        console.log("\n1. Testing Image Generation (Imagen 3)...");
        // This now uses gemini-3.1-flash-image
        const imageUrl = await generateReferenceImageAsync(testPrompt, "16:9");
        console.log("Success! Image URL:", imageUrl);
        
        console.log("\n2. Testing Video Generation (Google Veo) with Reference Image...");
        // This now uses veo-3.1-generate-preview
        const videoUrl = await generateVideoVeoAsync(
            "Slow cinematic pan across the futuristic office, employees smiling and working together",
            6, 
            "1920x1080",
            imageUrl
        );
        console.log("Success! Video URL:", videoUrl);
        
        console.log("\n--- TEST COMPLETED SUCCESSFULLY ---");
    } catch (error) {
        console.error("\n--- TEST FAILED ---");
        console.error(error);
    }
}

runTest();
