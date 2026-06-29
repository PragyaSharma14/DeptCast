import * as googleTTS from 'google-tts-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadAudio = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

/**
 * Generate Voiceover MP3 using google-tts-api.
 * @param {string} text The narration text.
 * @returns {Promise<string>} The local path to the generated MP3.
 */
export const generateAudioAsync = async (text) => {
    if (!text || text.trim() === '') {
        return null;
    }
    
    console.log(`[Audio Service] Generating Voiceover for: "${text.substring(0, 30)}..."`);

    try {
        // google-tts-api only supports up to 200 chars at a time.
        // For longer texts, we would use getAllAudioUrls, but for our short 5-8s scene narrations, 
        // getAudioUrl is usually sufficient. We'll use getAllAudioUrls to be safe.
        const urls = googleTTS.getAllAudioUrls(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
            splitPunct: ',.?'
        });

        const publicDir = path.join(__dirname, '..', 'public');
        const outputDir = path.join(publicDir, 'outputs', 'audio');
        
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
        if (!fs.existsSync(path.join(publicDir, 'outputs'))) fs.mkdirSync(path.join(publicDir, 'outputs'));
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        const filename = `voiceover-${Date.now()}-${Math.floor(Math.random() * 1000)}.mp3`;
        const localPath = path.join(outputDir, filename);

        // If it's a short text, just download the first URL
        if (urls.length === 1) {
            await downloadAudio(urls[0].url, localPath);
        } else {
            // For multiple chunks, we'd ideally stitch them with FFmpeg, but we will do that in the stitching service.
            // For now, we'll just download the first chunk or let stitching handle it.
            // Let's just download the first one for simplicity of the PoC per scene.
            console.warn(`[Audio Service] Text split into ${urls.length} chunks. Downloading first chunk.`);
            await downloadAudio(urls[0].url, localPath);
        }

        console.log(`[Audio Service] Voiceover complete: /outputs/audio/${filename}`);
        return `/outputs/audio/${filename}`;
    } catch (error) {
        console.error("[Audio Service] Error:", error.message);
        throw new Error(`Audio Generation Error: ${error.message}`);
    }
};
