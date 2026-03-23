import Project from '../models/Project.js';
import Scene from '../models/Scene.js';
import { analyzeIntent } from '../services/intent.service.js';
import { getTemplateByDomain } from '../services/template.service.js';
import { generateScenes } from '../services/scene.service.js';

export const createProject = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        // 1. Analyze Intent
        console.log("Analyzing Intent...");
        const intent = await analyzeIntent(prompt);
        console.log("Intent resolved:", intent);
        
        // 2. Load Template
        const template = getTemplateByDomain(intent.domain);
        
        // 3. Create Project Record
        const project = await Project.create({
            userId: req.user._id,
            organizationId: req.org._id,
            intent: prompt,
            domain: template.domain,
            style: template.styleHints || 'standard',
            status: 'draft'
        });

        // 4. Generate structured scenes via LLM
        console.log("Generating Structured Scenes...");
        let structuredScenesInfo = await generateScenes(prompt, intent, template);
        
        // Ensure structuredScenesInfo is array
        if(!Array.isArray(structuredScenesInfo)) {
            structuredScenesInfo = [structuredScenesInfo]; 
        }

        const scenes = await Promise.all(
            structuredScenesInfo.map((scene, i) => Scene.create({
                projectId: project._id,
                sceneNumber: scene.sceneNumber || (i + 1),
                description: scene.description || scene,
                prompt: scene.description || scene, // baseline prompt
                status: 'pending'
            }))
        );

        res.status(201).json({
            project,
            scenes
        });

    } catch (error) {
        console.error("Create Project Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ organizationId: req.org._id }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectDetails = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, organizationId: req.org._id });
        if(!project) return res.status(404).json({ error: "Project not found in this organization" });
        
        const scenes = await Scene.find({ projectId: project._id }).sort({ sceneNumber: 1 });
        res.json({ project, scenes });
    } catch(error) {
         res.status(500).json({ error: error.message });
    }
};
