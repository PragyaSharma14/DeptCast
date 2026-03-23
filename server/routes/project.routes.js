import express from 'express';
import { createProject, getProjects, getProjectDetails } from '../controllers/project.controller.js';

const router = express.Router();

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectDetails);

export default router;
