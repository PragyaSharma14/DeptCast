import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const stitchVideos = (videoUrls, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!videoUrls || videoUrls.length === 0) {
      return reject(new Error("No video URLs provided for stitching."));
    }

    const command = ffmpeg();
    
    videoUrls.forEach(url => {
      command.input(url);
    });

    const tmpDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(tmpDir)){
        fs.mkdirSync(tmpDir);
    }

    command.on('end', () => {
      console.log('Video stitching completed:', outputPath);
      resolve(outputPath);
    })
    .on('error', (err) => {
      console.error('Error stitching videos:', err);
      reject(err);
    })
    .mergeToFile(outputPath, tmpDir);
  });
};
