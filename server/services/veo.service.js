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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateVideoVeoAsync = async (prompt, targetDuration = 5, resolution = "1920x1080", referenceImageUrl = null) => {
    // Vertex AI / Gemini AI natively accepts aspectRatio like "16:9", "9:16", or "1:1".
    let aspectRatio = "16:9";
    if (resolution === "1080x1920") aspectRatio = "9:16";
    if (resolution === "1080x1080") aspectRatio = "1:1";

    // CREDIT SAVING: If MOCK_VEO is enabled, bypass the API call
    if (process.env.MOCK_VEO === 'true') {
        console.log(`[Google Veo] MOCK MODE ENABLED: Bypassing credit usage.`);
        await delay(2000);
        return "https://www.w3schools.com/html/mov_bbb.mp4";
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }

    console.log(`[Google AI Studio - Veo] Starting Task: Target Duration ${targetDuration}s, Aspect Ratio: ${aspectRatio}`);
    console.log(`[Google AI Studio - Veo] Prompt: ${prompt}`);
    if (referenceImageUrl) {
        console.log(`[Google AI Studio - Veo] Using reference image: ${referenceImageUrl}`);
    }

    try {
        console.log(`[Google AI Studio - Veo] Initiating generation via Gemini API...`);

        // Note: The exact model name and endpoint for Veo in Google AI Studio
        // is typically 'veo-3.1-generate-preview' as of May 2026
        const modelName = "veo-3.1-generate-preview";

        const instanceData = { prompt: prompt };
        
        // If a reference image is provided, fetch it locally and encode to base64
        if (referenceImageUrl) {
            try {
                // Determine absolute path of the reference image
                const publicDir = path.join(__dirname, '..', 'public');
                const imagePath = path.join(publicDir, referenceImageUrl.replace(/^\//, ''));
                
                if (fs.existsSync(imagePath)) {
                    const imageBuffer = fs.readFileSync(imagePath);
                    const base64Data = imageBuffer.toString('base64');
                    // Get mime type from extension
                    const ext = path.extname(imagePath).toLowerCase();
                    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
                    
                    instanceData.image = {
                        bytesBase64Encoded: base64Data,
                        mimeType: mimeType
                    };
                } else {
                    console.warn(`[Google AI Studio - Veo] Reference image not found at ${imagePath}. Proceeding without it.`);
                }
            } catch (err) {
                console.warn(`[Google AI Studio - Veo] Error processing reference image: ${err.message}`);
            }
        }

        // POST to Gemini API
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predictLongRunning?key=${API_KEY}`,
            {
                instances: [instanceData],
                parameters: {
                    aspectRatio: aspectRatio,
                    // durationSeconds: targetDuration
                }
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

console.log("[Google AI Studio - Veo] Request Sent. Response:", response.data);

// Handle Long Running Operation (LRO) polling
if (response.data && response.data.name) {
    const operationName = response.data.name;
    console.log(`[Google AI Studio - Veo] Operation created: ${operationName}. Polling for completion...`);

    let isDone = false;
    let finalVideoUrl = null;

    while (!isDone) {
        await delay(10000); // Poll every 10 seconds

        const pollRes = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${API_KEY}`
        );

        const op = pollRes.data;

        if (op.done) {
            isDone = true;
            if (op.error) {
                throw new Error(`Veo Generation failed: ${op.error.message || JSON.stringify(op.error)}`);
            }

            // Extract Video URI from response
            finalVideoUrl = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
                op.response?.videoUri ||
                op.response?.videos?.[0]?.uri ||
                op.response?.video_uri;

            // Handle Base64 output if Google AI Studio returns raw bytes instead of a URL
            if (!finalVideoUrl && (op.response?.bytesBase64 || op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.bytesBase64)) {
                const b64 = op.response?.bytesBase64 || op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.bytesBase64;
                const buffer = Buffer.from(b64, 'base64');
                const publicDir = path.join(__dirname, '..', 'public');
                const outputDir = path.join(publicDir, 'outputs');
                if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
                if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

                const filename = `veo-aistudio-${Date.now()}.mp4`;
                fs.writeFileSync(path.join(outputDir, filename), buffer);
                finalVideoUrl = `/outputs/${filename}`;
            }
        }
    }

    if (!finalVideoUrl) {
        console.log("[Google AI Studio - Veo] Full response payload:", JSON.stringify(op, null, 2));
        throw new Error("Veo completed but no video URI or bytes were found in the response.");
    }

    // DOWNLOAD STEP: Google AI Studio URLs are restricted. 
    // We must download them locally so ffmpeg can access them.
    if (finalVideoUrl.startsWith('http')) {
        console.log(`[Google AI Studio - Veo] Downloading video from restricted URL...`);
        try {
            const downloadRes = await axios.get(`${finalVideoUrl}${finalVideoUrl.includes('?') ? '&' : '?'}key=${API_KEY}`, {
                responseType: 'arraybuffer'
            });

            const publicDir = path.join(__dirname, '..', 'public');
            const outputDir = path.join(publicDir, 'outputs');
            if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

            const filename = `veo-download-${Date.now()}-${Math.floor(Math.random() * 1000)}.mp4`;
            const localPath = path.join(outputDir, filename);
            fs.writeFileSync(localPath, Buffer.from(downloadRes.data));

            console.log(`[Google AI Studio - Veo] Downloaded to: ${localPath}`);
            return `/outputs/${filename}`;
        } catch (downloadError) {
            console.error("[Google AI Studio - Veo] Download failed:", downloadError.message);
            // If download fails, we still return the URL as a fallback, 
            // though ffmpeg might fail later.
            return finalVideoUrl;
        }
    }

    console.log(`[Google AI Studio - Veo] Generation complete: ${finalVideoUrl}`);
    return finalVideoUrl;

} else {
    // Immediate response fallback
    let finalVideoUrl = response.data?.predictions?.[0]?.videoUri || response.data?.predictions?.[0]?.videos?.[0]?.uri;

    if (finalVideoUrl) {
        // Also download for immediate response
        if (finalVideoUrl.startsWith('http')) {
            const downloadRes = await axios.get(`${finalVideoUrl}${finalVideoUrl.includes('?') ? '&' : '?'}key=${API_KEY}`, {
                responseType: 'arraybuffer'
            });
            const publicDir = path.join(__dirname, '..', 'public');
            const outputDir = path.join(publicDir, 'outputs');
            const filename = `veo-immediate-${Date.now()}.mp4`;
            fs.writeFileSync(path.join(outputDir, filename), Buffer.from(downloadRes.data));
            return `/outputs/${filename}`;
        }
        return finalVideoUrl;
    } else {
        console.log("[Google AI Studio - Veo] Full immediate response payload:", JSON.stringify(response.data, null, 2));
        throw new Error("Could not extract video URL from immediate response.");
    }
}

    } catch (error) {
    // Axios errors have detailed response data
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error("[Google AI Studio - Veo] Error:", errMsg);
    throw new Error(`Google AI Studio Veo Error: ${errMsg}`);
}
};
