import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        
        const models = response.data.models;
        models.forEach(m => {
            if (m.name.includes("imagen")) {
                console.log(m.name, m.supportedGenerationMethods);
            }
        });
        console.log("Total models:", models.length);
    } catch (e) {
        console.error(e.message);
    }
}
listModels();
