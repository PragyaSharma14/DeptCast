import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a reference image using Imagen 3 via Google Gemini REST API.
 * @param {string} prompt - The descriptive prompt for the image.
 * @param {string} aspectRatio - "16:9", "1:1", or "9:16".
 * @returns {Promise<string>} - Returns the local URL path to the downloaded image.
 */
export const generateReferenceImageAsync = async (prompt, aspectRatio = "16:9") => {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }

    console.log(`[Imagen 3] Generating reference image. Aspect Ratio: ${aspectRatio}`);
    
    // Map standard aspect ratios to what Imagen 3 expects if necessary
    // Gemini API for Imagen typically accepts aspect_ratio as "16:9", "1:1", "3:4", "4:3", "9:16"
    
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`,
            {
                instances: [
                    { prompt: prompt }
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

        if (response.data && response.data.predictions && response.data.predictions.length > 0) {
            const prediction = response.data.predictions[0];
            const base64Data = prediction.bytesBase64Encoded;
            
            if (!base64Data) {
                throw new Error("No image data returned from Imagen 3.");
            }

            // Save the base64 string to a file locally
            const buffer = Buffer.from(base64Data, 'base64');
            const publicDir = path.join(__dirname, '..', 'public');
            const outputDir = path.join(publicDir, 'outputs');
            
            if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
            
            const filename = `imagen-ref-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
            const localPath = path.join(outputDir, filename);
            
            fs.writeFileSync(localPath, buffer);
            console.log(`[Imagen 3] Image saved to: ${localPath}`);
            
            return `/outputs/${filename}`;
        } else {
            console.error("[Imagen 3] Unexpected response:", JSON.stringify(response.data));
            throw new Error("Failed to generate image: Invalid response structure.");
        }
    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message;
        console.error("[Imagen 3] Error:", errMsg);
        console.warn("[Imagen 3] Falling back to placeholder image to prevent pipeline blockage.");
        
        // Return a beautiful dynamic placeholder image to keep the UI flowing
        const fallbackId = Math.floor(Math.random() * 10) + 1;
        return `https://picsum.photos/seed/${fallbackId}/1920/1080`;
    }
};
