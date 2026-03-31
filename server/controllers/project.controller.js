import prisma from '../db.js';
import { analyzeIntent } from '../services/intent.service.js';
import { getTemplateByDomain } from '../services/template.service.js';
import { generateScenes } from '../services/scene.service.js';

export const createProject = async (req, res) => {
    try {
        const { prompt, department, avatar, voice, dimension } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        // Load Template based on department to get style hints
        const template = getTemplateByDomain(department || 'marketing');
        
        // 1. Create Project Record with specific UI overrides
        const project = await prisma.project.create({
            data: {
                userId: req.user.id || req.user._id,
                organizationId: req.org.id || req.org._id,
                intent: prompt,
                domain: department || template.domain,
                style: template.styleHints || 'standard',
                avatar: avatar,
                voice: voice,
                dimension: dimension,
                status: 'draft'
            }
        });

        // 2. Generate structured scenes via AutoGen Python Microservice
        console.log("Generating Structured Scenes via AutoGen Microservice...");
        const response = await fetch('http://localhost:8000/generate-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                department: department || 'marketing',
                avatar: avatar || 'standard',
                voice: voice || 'standard',
                dimension: dimension || '16:9'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AutoGen Microservice failed: ${errorText}`);
        }

        const result = await response.json();
        let structuredScenesInfo = result.scenes;
        
        if(!Array.isArray(structuredScenesInfo)) {
            structuredScenesInfo = [structuredScenesInfo]; 
        }

        const scenes = await Promise.all(
            structuredScenesInfo.map((scene, i) => prisma.scene.create({
                data: {
                    projectId: project.id,
                    sceneNumber: scene.sceneNumber || (i + 1),
                    description: scene.description || scene,
                    prompt: scene.prompt || scene.description || "Cinematic video generation prompt",
                    status: 'pending'
                }
            }))
        );

        res.status(201).json({
            project: { ...project, _id: project.id },
            scenes: scenes.map(s => ({ ...s, _id: s.id }))
        });

    } catch (error) {
        console.error("Create Project Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { organizationId: req.org.id || req.org._id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects.map(p => ({ ...p, _id: p.id })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectDetails = async (req, res) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.id,
                organizationId: req.org.id || req.org._id
            }
        });

        if(!project) return res.status(404).json({ error: "Project not found in this organization" });
        
        const scenes = await prisma.scene.findMany({
            where: { projectId: project.id },
            orderBy: { sceneNumber: 'asc' }
        });
        
        res.json({
            project: { ...project, _id: project.id },
            scenes: scenes.map(s => ({ ...s, _id: s.id }))
        });
    } catch(error) {
         res.status(500).json({ error: error.message });
    }
};
