import { stitchVideos } from '../utils/ffmpeg.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import prisma from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const renderFinalVideo = async (scenes, projectId) => {
    // scenes is expected to be an array of Objects containing truthy videoUrl
    const videoUrls = scenes.map(s => s.videoUrl).filter(url => url);
    if(videoUrls.length === 0) {
        throw new Error("No video segments found to render.");
    }
    
    // Create output folder in server/public/outputs for static serving
    const publicDir = path.join(__dirname, '..', 'public');
    const outputDir = path.join(publicDir, 'outputs');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const outputPath = path.join(outputDir, `project-${projectId}-final.mp4`);
    
    try {
        await stitchVideos(videoUrls, outputPath);
        
        // Update Project in DB
        const finalUrl = `/outputs/project-${projectId}-final.mp4`;
        await prisma.project.update({
            where: { id: projectId },
            data: { 
                finalVideoUrl: finalUrl,
                status: 'completed'
            }
        });

        return finalUrl;
    } catch(err) {
        console.error("Render service failed:", err);
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'failed' }
        });
        throw err;
    }
};
