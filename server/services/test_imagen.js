import { generateReferenceImageAsync } from './imagen.service.js';

async function test() {
    try {
        console.log("Testing Imagen API...");
        const result = await generateReferenceImageAsync("A corporate office meeting", "16:9");
        console.log("Result:", result);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
