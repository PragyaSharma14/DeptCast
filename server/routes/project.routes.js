import express from 'express';
import { createProject, getProjects, getProjectDetails, generateBlueprint, checkBlueprintStatus } from '../controllers/project.controller.js';
import { getWizardBootstrap } from '../controllers/wizard.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/bootstrap', getWizardBootstrap);
router.post('/', createProject);
router.post('/generate-blueprint', generateBlueprint);
router.get('/generate-blueprint-status/:jobId', checkBlueprintStatus);
router.get('/test-ai-service', (req, res) => {
    const rawAutogenUrl = process.env.AUTOGEN_URL || 'http://localhost:8000';
    const autogenUrl = rawAutogenUrl.endsWith('/') ? rawAutogenUrl.slice(0, -1) : rawAutogenUrl;
    fetch(`${autogenUrl}/health`)
        .then(r => r.json())
        .then(data => res.json({ 
            status: "connected", 
            url: autogenUrl, 
            response: data 
        }))
        .catch(err => res.status(500).json({ 
            status: "failed", 
            url: autogenUrl, 
            error: err.message,
            hint: "Verify AUTOGEN_URL in Render and ensure the Python service is running." 
        }));
});
router.get('/', getProjects);
router.get('/:id', getProjectDetails);

export default router;
