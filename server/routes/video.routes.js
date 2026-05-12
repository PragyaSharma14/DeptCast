import express from 'express';
import { generateVideo, regenerateScene, generateReferenceImage } from '../controllers/video.controller.js';

const router = express.Router();

router.post('/project/:projectId/generate-image', generateReferenceImage);
router.post('/project/:projectId/generate', generateVideo);
router.post('/scene/:sceneId/regenerate', regenerateScene);

export default router;
