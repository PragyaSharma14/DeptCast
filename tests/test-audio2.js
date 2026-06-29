import { generateAudioAsync } from './services/audio.service.js';

const run = async () => {
    try {
        const url = await generateAudioAsync("Welcome to the new remote work policy for 2026. You can now work from home three days a week.");
        console.log("Audio URL:", url);
    } catch (e) {
        console.error("Test failed:", e);
    }
};

run();
