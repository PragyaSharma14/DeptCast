import express from 'express';
import { createProject, getProjects, getProjectDetails, generateBlueprint } from '../controllers/project.controller.js';
import { getWizardBootstrap } from '../controllers/wizard.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/bootstrap', getWizardBootstrap);
router.post('/', createProject);
router.post('/generate-blueprint', generateBlueprint);
router.get('/', getProjects);
router.get('/:id', getProjectDetails);

export default router;
