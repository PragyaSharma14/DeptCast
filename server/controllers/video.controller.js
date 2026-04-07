import prisma from '../db.js';
import { getTemplateByDomain } from '../services/template.service.js';
import { buildCinematicPrompt } from '../services/prompt.service.js';
import { generateVideoOpenAIAsync } from '../services/openai.service.js';
import { renderFinalVideo } from '../services/render.service.js';

export const generateVideo = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await prisma.project.findFirst({ 
            where: { 
                id: projectId,
                organizationId: req.org.id || req.org._id
            } 
        });
        if (!project) return res.status(404).json({ error: "Project not found or unauthorized" });

        // Guard against duplicate generation jobs
        if (project.status === 'generating' || project.status === 'pending') {
            return res.status(400).json({ error: "Generation is already in progress for this project." });
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: { status: 'generating' }
        });

        // Get all scenes for project
        const scenes = await prisma.scene.findMany({
            where: { projectId },
            orderBy: { sceneNumber: 'asc' }
        });
        const template = getTemplateByDomain(project.domain);
        
        // Respond with updated status to trigger frontend polling immediately
        res.status(202).json({ 
            message: "Video generation started via OpenAI", 
            project: { ...updatedProject, _id: updatedProject.id } 
        });

        // Background Processing
        (async () => {
            try {
                // OpenAI often accepts standard strings for resolutions or aspect ratios
                const dimensionMap = {
                    "16:9": "1280x720",
                    "9:16": "720x1280",
                    "1:1": "720x720",
                    "4:3": "960x720"
                };
                const videoRes = dimensionMap[project.dimension] || "1280x720";

                // 1. Synthesize Master Shot using AutoGen Cinematographer
                console.log("Synthesizing Master Continuous Shot via OpenAI Sora optimization...");
                
                // Update scenes to generating
                await prisma.scene.updateMany({
                    where: { projectId },
                    data: { status: 'generating' }
                });

                const autogenRes = await fetch('http://localhost:8000/generate-master-shot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scenes: scenes.map(s => ({ sceneNumber: s.sceneNumber, description: s.description })),
                        dimension: project.dimension || "16:9",
                        avatar: project.avatar || "standard"
                    })
                });

                if (!autogenRes.ok) {
                    throw new Error(`AutoGen Master Shot synthesis failed: ${await autogenRes.text()}`);
                }

                const autogenData = await autogenRes.json();
                const masterPrompt = autogenData.master_prompt;
                console.log(`Generated Master Prompt for OpenAI: ${masterPrompt}`);

                // 2. Call OpenAI Ora - Single Contiguous Generation
                const targetLen = project.targetDuration || 5; 
                const videoUrl = await generateVideoOpenAIAsync(masterPrompt, targetLen, videoRes);
                console.log(`OpenAI Sora Master Video Generated: ${videoUrl}`);

                // 3. Mark all narrative scenes as "completed" in status only
                await prisma.scene.updateMany({
                     where: { projectId },
                     data: { status: 'completed' }
                });
                
                // 4. Update project with final single video URL
                await prisma.project.update({
                    where: { id: projectId },
                    data: { 
                        status: 'completed',
                        finalVideoUrl: videoUrl 
                    }
                });

                console.log(`Project ${projectId} completely finished using OpenAI Sora Master Shot! URL: ${videoUrl}`);
            } catch (err) {
                console.error("Background OpenAI Video Generation Failed for project", projectId, err);
                await prisma.project.update({
                    where: { id: projectId },
                    data: { status: 'failed' }
                });
            }
        })();


    } catch (error) {
        console.error("Generate Video Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const regenerateScene = async (req, res) => {
    try {
        const { sceneId } = req.params;
        const { promptOverride } = req.body; // user can edit prompt
        
        const scene = await prisma.scene.findUnique({ where: { id: sceneId }, include: { project: true } });
        if(!scene) return res.status(404).json({ error: "Scene not found" });
        if(scene.project.organizationId !== (req.org.id || req.org._id)) return res.status(403).json({ error: "Unauthorized" });
        
        const project = scene.project;
        const template = getTemplateByDomain(project.domain);

        if (scene.status === 'generating') {
            return res.status(400).json({ error: "This scene is already being generated." });
        }

        await prisma.scene.update({
            where: { id: sceneId },
            data: { status: 'generating', prompt: promptOverride || scene.prompt }
        });

        res.status(202).json({ message: "Scene regeneration started" });

        (async () => {
            try {
                const finalPrompt = buildCinematicPrompt(promptOverride || scene.prompt, { tone: project.style }, template);
                const videoUrl = await generateVideoOpenAIAsync(finalPrompt, template.defaultDuration || 5, "1280x720");
                
                // For Sora, a "scene regeneration" updates the entire project's shot if requested
                // or we update the scene status. 
                await prisma.scene.update({
                    where: { id: sceneId },
                    data: { status: 'completed' }
                });

                await prisma.project.update({
                    where: { id: project.id },
                    data: { finalVideoUrl: videoUrl }
                });

                // We don't auto stitch here, user can trigger "re-render" separately if desired
            } catch (err) {
                 console.error("Regenerate Scene Failed", err);
                 await prisma.scene.update({
                     where: { id: sceneId },
                     data: { status: 'failed' }
                 });
            }
        })();
        
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
}
