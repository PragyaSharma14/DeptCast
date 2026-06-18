import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const PUBLIC_DIR = path.resolve('public', 'outputs');

export const generateRemotionVideo = async (jsonAst, projectId) => {
    // Ensure outputs directory exists
    if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    const outputFilename = `infographic_${projectId}_${Date.now()}.mp4`;
    const outputPath = path.join(PUBLIC_DIR, outputFilename);

    // MOCK MODE FOR TESTING
    if (process.env.MOCK_VEO === 'true') {
        console.log(`[Remotion Service] Running in MOCK mode for project ${projectId}`);
        fs.writeFileSync(outputPath, "mock video data");
        return `/outputs/${outputFilename}`;
    }

    console.log(`[Remotion Service] Bundling Remotion project...`);
    // Absolute path to the Remotion project
    const remotionProjectDir = path.resolve('..', 'remotion-app', 'src', 'index.ts');
    
    try {
        const bundledDir = await bundle({
            entryPoint: remotionProjectDir,
            webpackOverride: (config) => config,
        });

        console.log(`[Remotion Service] Selecting composition...`);
        const composition = await selectComposition({
            serveUrl: bundledDir,
            id: 'DynamicVideo',
            inputProps: {
                ast: jsonAst
            }
        });

        console.log(`[Remotion Service] Rendering media...`);
        await renderMedia({
            composition,
            serveUrl: bundledDir,
            codec: 'h264',
            outputLocation: outputPath,
            inputProps: {
                ast: jsonAst
            }
        });

        console.log(`[Remotion Service] Render complete: ${outputPath}`);
        return `/outputs/${outputFilename}`;

    } catch (error) {
        console.error(`[Remotion Service] Render Failed:`, error);
        throw error;
    }
};
