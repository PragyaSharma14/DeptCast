import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

/**
 * Generate an image using Google AI Studio's Imagen 4.0 model.
 * @param {string} prompt The detailed image prompt.
 * @param {string} aspectRatio e.g., "16:9"
 * @param {string} referenceAvatar Optional path or identifier for an avatar to use as a style/subject reference.
 * @returns {Promise<string>} The local path to the generated image.
 */
export const generateImageAsync = async (prompt, aspectRatio = "16:9", referenceAvatar = null) => {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }

    console.log(`[Google AI Studio - Imagen] Generating reference image. Aspect Ratio: ${aspectRatio}`);
    
    // Inject avatar description into prompt if provided (Imagen 4.0 does not natively support subject-reference API yet, so we guide via prompt)
    let finalPrompt = prompt;
    if (referenceAvatar) {
        const avatarDesc = referenceAvatar.toLowerCase().includes('boy') ? "a professional male presenter" : "a professional female presenter";
        finalPrompt = `${prompt}. The main subject must be ${avatarDesc}. Ensure high fidelity and character consistency.`;
        console.log(`[Google AI Studio - Imagen] Applying Avatar hint: ${avatarDesc}`);
    }

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
            {
                instances: [
                    { prompt: finalPrompt }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: aspectRatio
                }
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const base64Image = response.data.predictions?.[0]?.bytesBase64Encoded;
        
        if (base64Image) {
            const buffer = Buffer.from(base64Image, 'base64');
            const publicDir = path.join(__dirname, '..', 'public');
            const outputDir = path.join(publicDir, 'outputs', 'images');
            
            if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
            if (!fs.existsSync(path.join(publicDir, 'outputs'))) fs.mkdirSync(path.join(publicDir, 'outputs'));
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

            const filename = `imagen-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
            const localPath = path.join(outputDir, filename);
            fs.writeFileSync(localPath, buffer);
            
            console.log(`[Google AI Studio - Imagen] Generation complete: /outputs/images/${filename}`);
            return `/outputs/images/${filename}`;
        } else {
            throw new Error("No image data returned from Imagen API.");
        }
    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message;
        console.error("[Google AI Studio - Imagen] Error:", errMsg);
        throw new Error(`Imagen Generation Error: ${errMsg}`);
    }
};
