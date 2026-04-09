import prisma from '../db.js';
import { analyzeIntent } from '../services/intent.service.js';
import { getTemplateByDomain } from '../services/template.service.js';
import { generateScenes } from '../services/scene.service.js';

export const createProject = async (req, res) => {
    try {
        const { additionalPrompt, department, templateId, style, dimension, targetDuration } = req.body;

        // Retrieve Template from DB
        let templateSystemPrompt = "Standard corporate communication";
        if (templateId) {
            const dbTemplate = await prisma.template.findUnique({ where: { id: templateId } });
            if (dbTemplate) {
                templateSystemPrompt = `Template Title: ${dbTemplate.title}\nTemplate Rules: ${dbTemplate.systemPrompt}\nKey Points: ${dbTemplate.keyPoints}`;
            }
        }
        
        let initialIntent = additionalPrompt || "Standard template generation.";
        
        const project = await prisma.project.create({
            data: {
                userId: req.user.id || req.user._id,
                organizationId: req.org.id || req.org._id,
                intent: initialIntent,
                domain: department || 'General',
                style: style || 'Cinematic',
                templateId: templateId || null,
                dimension: dimension,
                targetDuration: targetDuration || 8,
                status: 'draft'
            }
        });

        console.log("Generating Structured Scenes via AutoGen (GPT-4o) Microservice...");
        const response = await fetch('http://localhost:8000/generate-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: initialIntent,
                department: department || 'General',
                style: style || 'Cinematic',
                template: templateSystemPrompt,
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
