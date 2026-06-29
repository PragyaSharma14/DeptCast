import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

const checkTTSModels = async () => {
    console.log("Checking Google AI Studio for TTS models...");
    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        const models = response.data.models;
        const ttsModels = models.filter(m => m.name.toLowerCase().includes('tts') || m.name.toLowerCase().includes('speech') || m.name.toLowerCase().includes('audio'));
        
        if (ttsModels.length > 0) {
            console.log("Found Audio/TTS models:", JSON.stringify(ttsModels, null, 2));
        } else {
            console.log("No TTS or Audio models found in the standard API. Falling back to free open-source TTS.");
        }
    } catch (error) {
        console.error("FAILED to list models:", error.message);
    }
};

checkTTSModels();
