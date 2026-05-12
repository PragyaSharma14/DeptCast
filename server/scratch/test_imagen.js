import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config({ path: '../server/.env' });

async function test() {
    try {
        const key = process.env.GEMINI_API_KEY;
        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${key}`,
            {
                instances: [{ prompt: "A sleek modern corporate office" }],
                parameters: { sampleCount: 1, aspectRatio: "16:9" }
            }
        );
        console.log("SUCCESS:", res.data.predictions ? "Got predictions" : res.data);
    } catch(err) {
        console.log("ERROR:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    }
}
test();
