import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("GEMINI_API_KEY is missing!");
    process.exit(1);
}

const testImagen = async () => {
    console.log("Testing Imagen 4.0 via Google AI Studio...");
    
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
            {
                instances: [
                    { prompt: "A hyper-realistic cinematic portrait of a professional female corporate employee, warm lighting, 8k resolution" }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "16:9"
                }
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const base64Image = response.data.predictions?.[0]?.bytesBase64Encoded;
        
        if (base64Image) {
            console.log("SUCCESS: Image generated successfully!");
            const buffer = Buffer.from(base64Image, 'base64');
            const outputPath = path.join(process.cwd(), 'test-imagen-output.jpg');
            fs.writeFileSync(outputPath, buffer);
            console.log(`Saved output to ${outputPath}`);
        } else {
            console.error("FAILED: No image data returned. Full response:");
            console.dir(response.data, { depth: null });
        }
    } catch (error) {
        console.error("FAILED to generate image:");
        console.error(error.response?.data?.error?.message || error.message);
    }
};

testImagen();
