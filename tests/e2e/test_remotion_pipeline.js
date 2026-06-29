import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { renderRemotionVideo } from '../../services/remotion.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars so gemini api key is available
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runE2E() {
    console.log("=== Starting Remotion E2E Test ===");
    
    const department = "hr";
    const style = "Infographics";
    const template = "blank";
    const dimension = "16:9";
    const prompt = "Create a video explaining the new 2026 Leave Policy. Key points: 25 days annual leave, 5 sick days, mandatory 2 weeks continuous leave. Use a clean, corporate layout.";
    
    console.log(`Topic: Company Leave Policy 2026\n`);
    
    console.log("1. Invoking AutoGen Agent...");
    
    const runAgentScript = path.resolve(__dirname, 'run_agent.py');
    const pythonExecutable = path.resolve(__dirname, '../../autogen_service/venv/Scripts/python.exe');
    const command = `"${pythonExecutable}" "${runAgentScript}"`;
    
    let pythonOutput = '';
    try {
        console.log(`Running: ${command}`);
        pythonOutput = execSync(command, { encoding: 'utf-8', cwd: path.resolve(__dirname, '../../') });
        console.log("Python script completed.");
    } catch (e) {
        console.error("Failed to run python script. Error:", e.message);
        if (e.stdout) console.log("Stdout:\n", e.stdout);
        if (e.stderr) console.error("Stderr:\n", e.stderr);
        process.exit(1);
    }
    
    let aiData;
    try {
        const parts = pythonOutput.split("===FINAL_JSON===");
        if (parts.length > 1) {
            const jsonStr = parts[1].trim();
            console.log("Extracted JSON:", jsonStr);
            aiData = JSON.parse(jsonStr);
        } else {
            console.error("Failed to find ===FINAL_JSON=== marker in output. Raw output:\n", pythonOutput);
            process.exit(1);
        }
    } catch (e) {
        console.error("Failed to parse JSON. Error:", e);
        process.exit(1);
    }
    
    console.log("\nParsed AI Output:");
    console.log(JSON.stringify(aiData, null, 2));
    
    if (!aiData.scenes || !aiData.scenes[0] || !aiData.scenes[0].prompt) {
        console.error("AST structure looks invalid or missing scenes[0].prompt.");
        process.exit(1);
    }
    
    console.log("\nSuccessfully parsed JSON AST from prompt.");
    
    console.log("\n2. Rendering Video with Remotion...");
    
    const astString = aiData.scenes[0].prompt;
    const outputFilename = `infographic_e2e_test_leave_policy_${Date.now()}.mp4`;
    
    try {
        const renderResult = await renderRemotionVideo({
            dimension: dimension,
            astString: astString,
            outputFilename: outputFilename
        });
        
        console.log(`[Remotion Service] Render complete: ${renderResult.outputFile}`);
        console.log(`\n=== E2E Test Completed Successfully ===`);
        console.log(`Video output location: /outputs/${outputFilename}`);
    } catch (e) {
        console.error("Failed to render video with Remotion:", e);
        process.exit(1);
    }
}

runE2E();
