import prisma from '../db.js';

export const generateBlueprint = async (req, res) => {
    try {
        const { department, templateId, style, additionalPrompt, avatar } = req.body;

        let templateSystemPrompt = "Standard generation";
        if (templateId) {
            const dbTemplate = await prisma.template.findUnique({ where: { id: templateId } });
            if (dbTemplate) {
                templateSystemPrompt = `Intent/Topic: ${dbTemplate.title}`;
            }
        }

        const autogenUrl = process.env.AUTOGEN_URL;
        if (!autogenUrl && process.env.NODE_ENV === 'production') {
            throw new Error("AUTOGEN_URL is missing in production environment. Please set it in your Render settings.");
        }
        const finalAutogenUrl = (autogenUrl || 'http://localhost:8000').replace(/\/$/, '');

        console.log(`[AI SERVICE] Calling Blueprint Gen at: ${finalAutogenUrl}/generate-blueprint-text`);

        let response = await fetch(`${finalAutogenUrl}/generate-blueprint-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Secret': process.env.AUTOGEN_SECRET || ''
            },
            body: JSON.stringify({
                prompt: additionalPrompt || "Standard template generation.",
                department: department || 'General',
                style: style || 'Cinematic',
                template: templateSystemPrompt,
                dimension: '16:9',
                avatar: avatar || null
            })
        }).catch(err => {
            console.error(`[AI SERVICE] Network Error:`, err.message);
            throw new Error(`AI Service unreachable. Verify AUTOGEN_URL.`);
        });

        // Retry once if the service is sleeping (502/503)
        if (response.status === 502 || response.status === 503) {
            console.log("[AI SERVICE] Service sleeping or restarting. Retrying in 5 seconds...");
            await new Promise(r => setTimeout(r, 5000));
            response = await fetch(`${finalAutogenUrl}/generate-blueprint-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Secret': process.env.AUTOGEN_SECRET || ''
                },
                body: JSON.stringify({
                    prompt: additionalPrompt || "Standard template generation.",
                    department: department || 'General',
                    style: style || 'Cinematic',
                    template: templateSystemPrompt,
                    dimension: '16:9',
                    avatar: avatar || null
                })
            }).catch(err => { throw new Error(`AI Service unreachable after retry.`); });
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[AI SERVICE] ${response.status} Error from ${autogenUrl}:`, errorText.substring(0, 500)); // Log first 500 chars only
            throw new Error(`Blueprint Generation failed (${response.status}). The service might be sleeping or misconfigured.`);
        }

        const result = await response.json();
        res.json({ status: "queued", jobId: result.job_id });
    } catch (error) {
        console.error("Generate Blueprint Error:", error);
        res.status(500).json({
            error: error.message,
            code: "AI_SERVICE_ERROR",
            hint: "Check if the AutoGen service is awake and the AUTOGEN_URL is set correctly."
        });
    }
};

export const checkBlueprintStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const autogenUrl = process.env.AUTOGEN_URL || 'http://localhost:8000';
        const finalAutogenUrl = autogenUrl.replace(/\/$/, '');

        let response = await fetch(`${finalAutogenUrl}/jobs/${jobId}`, {
            method: 'GET',
            headers: { 'X-API-Secret': process.env.AUTOGEN_SECRET || '' }
        });

        if (response.status === 502 || response.status === 503) {
            await new Promise(r => setTimeout(r, 2000));
            response = await fetch(`${finalAutogenUrl}/jobs/${jobId}`, {
                method: 'GET',
                headers: { 'X-API-Secret': process.env.AUTOGEN_SECRET || '' }
            });
        }

        if (!response.ok) {
            throw new Error(`Failed to check job status: ${response.status}`);
        }

        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error("Check Blueprint Status Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const createProject = async (req, res) => {
    try {
        const { additionalPrompt, department, templateId, style, dimension, targetDuration, referenceImageUrl } = req.body;

        // Retrieve Template from DB
        let templateSystemPrompt = "Standard generation";
        if (templateId) {
            const dbTemplate = await prisma.template.findUnique({ where: { id: templateId } });
            if (dbTemplate) {
                templateSystemPrompt = `Intent/Topic: ${dbTemplate.title}`;
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
                referenceImageUrl: referenceImageUrl || null,
                status: 'draft'
            }
        });

        // We bypass /generate-script completely. The `additionalPrompt` is the exact Veo command generated during the AI Magic step.
        const storyline = `Direct command generation for ${department} department.`;
        const imagePrompt = `Visual representing ${department}.`;
        const promptText = initialIntent; // The finalized prompt from the UI

        let structuredScenesInfo = [
            {
                sceneNumber: 1,
                description: "AI Generated Scene",
                prompt: promptText
            }
        ];

        // Update Project with storyline and imagePrompt
        await prisma.project.update({
            where: { id: project.id },
            data: { storyline, imagePrompt }
        });

        const scenes = await Promise.all(
            structuredScenesInfo.map((scene, i) => prisma.scene.create({
                data: {
                    projectId: project.id,
                    sceneNumber: scene.sceneNumber || (i + 1),
                    description: scene.description || (typeof scene === 'string' ? scene : ""),
                    prompt: scene.prompt || (typeof scene === 'string' ? scene : "Cinematic video generation prompt"),
                    status: 'pending'
                }
            }))
        );

        res.status(201).json({
            project: { ...project, id: project.id, storyline, imagePrompt },
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

        if (!project) return res.status(404).json({ error: "Project not found in this organization" });

        const scenes = await prisma.scene.findMany({
            where: { projectId: project.id },
            orderBy: { sceneNumber: 'asc' }
        });

        res.json({
            project: { ...project, _id: project.id },
            scenes: scenes.map(s => ({ ...s, _id: s.id }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
