import express from 'express';
import { createProject, getProjects, getProjectDetails, generateBlueprint, checkBlueprintStatus } from '../controllers/project.controller.js';
import { getWizardBootstrap } from '../controllers/wizard.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/bootstrap', getWizardBootstrap);
router.post('/', createProject);
router.post('/generate-blueprint', generateBlueprint);
router.get('/generate-blueprint-status/:jobId', checkBlueprintStatus);
router.get('/', getProjects);
router.get('/:id', getProjectDetails);

export default router;
