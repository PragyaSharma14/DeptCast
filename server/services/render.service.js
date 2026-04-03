import { stitchVideos } from '../utils/ffmpeg.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import prisma from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const renderFinalVideo = async (scenes, projectId) => {
    // Create output folder in server/public/outputs for static serving
    const publicDir = path.join(__dirname, '..', 'public');
    const outputDir = path.join(publicDir, 'outputs');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const videoUrls = scenes.map(s => s.videoUrl).filter(url => url).map(url => {
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        // Strip leading slash before path.join to ensure correct joining on Windows
        return path.join(publicDir, url.replace(/^\//, ''));
    });

    if(videoUrls.length === 0) {
        throw new Error("No video segments found to render.");
    }
    
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
