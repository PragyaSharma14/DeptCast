import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function listModels() {
    const API_KEY = process.env.GEMINI_API_KEY;
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        console.log("Available Models:");
        response.data.models.forEach(m => {
            console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
        });
    } catch (error) {
        console.error("Error listing models:", error.response?.data || error.message);
    }
}

listModels();
