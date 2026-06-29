import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

ffmpeg.setFfmpegPath(ffmpegStatic);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Combines a video clip and an audio clip, ensuring exact duration trim.
 * @param {string} videoPath 
 * @param {string} audioPath 
 * @param {number|null} duration 
 * @param {string} outputPath 
 * @returns {Promise<string>}
 */
const combineAudioVideo = (videoPath, audioPath, duration, outputPath) => {
    return new Promise((resolve, reject) => {
        let cmd = ffmpeg().input(videoPath);
        
        if (audioPath) {
            cmd = cmd.input(audioPath)
               .complexFilter(['[1:a]apad[A]']) // Pad audio infinitely
               .outputOptions(['-map 0:v', '-map [A]', '-c:v copy', '-c:a aac']);
        } else {
            cmd.outputOptions(['-c:v copy']);
        }

        if (duration) {
            // Force strict exact cut to the second (e.g. 5)
            cmd.outputOptions([`-t ${duration}`]);
        } else if (audioPath) {
            // fallback if no duration provided but audio exists
            cmd.outputOptions(['-shortest']);
        }

        cmd.save(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => {
                console.error(`[Stitching] Combine Error:`, err);
                reject(err);
            });
    });
};

/**
 * Concatenates multiple combined mp4 files into one final video.
 * @param {string[]} videoPaths Array of local paths to the .mp4 files.
 * @param {string} outputPath 
 * @returns {Promise<string>}
 */
const concatVideos = (videoPaths, outputPath) => {
    return new Promise((resolve, reject) => {
        const listPath = path.join(path.dirname(outputPath), `concat_list_${Date.now()}.txt`);
        const fileContent = videoPaths.map(vp => `file '${vp}'`).join('\n');
        fs.writeFileSync(listPath, fileContent);

        ffmpeg()
            .input(listPath)
            .inputOptions(['-f concat', '-safe 0'])
            .outputOptions(['-c copy'])
            .save(outputPath)
            .on('end', () => {
                fs.unlinkSync(listPath); // Cleanup
                resolve(outputPath);
            })
            .on('error', (err) => {
                if(fs.existsSync(listPath)) fs.unlinkSync(listPath);
                console.error(`[Stitching] Concat Error:`, err);
                reject(err);
            });
    });
};

/**
 * Main Stitching Orchestrator
 * @param {Array<{videoPath: string, audioPath: string}>} scenes 
 * @returns {Promise<string>} The final relative path to the stitched video.
 */
export const stitchScenesAsync = async (scenes) => {
    console.log(`[Stitching] Stitching ${scenes.length} scenes together...`);
    
    const publicDir = path.join(__dirname, '..', 'public');
    const outputDir = path.join(publicDir, 'outputs', 'videos');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const combinedPaths = [];

    // Step 1: Combine Audio and Video for each scene separately
    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        if (!scene.videoPath) continue;

        const absoluteVideo = path.join(publicDir, scene.videoPath.replace('/outputs/', 'outputs/'));
        const absoluteAudio = scene.audioPath ? path.join(publicDir, scene.audioPath.replace('/outputs/', 'outputs/')) : null;
        const duration = scene.duration || null;
        
        const combinedOut = path.join(outputDir, `combined_scene_${i}_${Date.now()}.mp4`);
        
        if (absoluteAudio && fs.existsSync(absoluteAudio)) {
            console.log(`[Stitching] Combining audio for scene ${i+1}... (Trim to ${duration}s)`);
            await combineAudioVideo(absoluteVideo, absoluteAudio, duration, combinedOut);
            combinedPaths.push(combinedOut);
        } else {
            console.log(`[Stitching] No audio for scene ${i+1}, using video as is.`);
            if (duration) {
                await combineAudioVideo(absoluteVideo, null, duration, combinedOut);
                combinedPaths.push(combinedOut);
            } else {
                combinedPaths.push(absoluteVideo);
            }
        }
    }

    // Step 2: Concat all combined scenes
    const finalFilename = `final-render-${Date.now()}.mp4`;
    const finalPath = path.join(outputDir, finalFilename);

    console.log(`[Stitching] Concatenating ${combinedPaths.length} clips into final video...`);
    await concatVideos(combinedPaths, finalPath);

    // Cleanup temporary combined files
    for (const p of combinedPaths) {
        if (p.includes('combined_scene_')) {
            fs.unlinkSync(p);
        }
    }

    console.log(`[Stitching] Final video ready: /outputs/videos/${finalFilename}`);
    return `/outputs/videos/${finalFilename}`;
};
