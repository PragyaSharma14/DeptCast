import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

const testTTS = async () => {
    console.log("Testing Gemini 3.1 Flash TTS...");
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${API_KEY}`,
            {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: "Welcome to the new remote work policy for 2026. You can now work from home three days a week." }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2
                }
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const parts = response.data.candidates?.[0]?.content?.parts;
        let audioBase64 = null;
        let audioMime = null;
        
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
                    audioBase64 = part.inlineData.data;
                    audioMime = part.inlineData.mimeType;
                    break;
                }
            }
        }

        if (audioBase64) {
            console.log(`SUCCESS: Received audio data! MIME: ${audioMime}`);
            const buffer = Buffer.from(audioBase64, 'base64');
            const outputPath = path.join(process.cwd(), 'test-tts-output.mp3');
            fs.writeFileSync(outputPath, buffer);
            console.log(`Saved output to ${outputPath}`);
        } else {
            console.error("FAILED: No audio part returned. Full response:");
            console.dir(response.data, { depth: null });
        }
    } catch (error) {
        console.error("FAILED to generate audio:");
        console.error(error.response?.data?.error?.message || error.message);
    }
};

testTTS();
