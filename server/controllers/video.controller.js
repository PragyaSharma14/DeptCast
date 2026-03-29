import prisma from '../db.js';
import { getTemplateByDomain } from '../services/template.service.js';
import { buildCinematicPrompt } from '../services/prompt.service.js';
import { generateVideoAsync } from '../services/veo.service.js';
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

        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'generating' }
        });

        // Get all scenes for project
        const scenes = await prisma.scene.findMany({
            where: { projectId },
            orderBy: { sceneNumber: 'asc' }
        });
        const template = getTemplateByDomain(project.domain);
        
        // This process takes time, so we should respond right away and process in background
        res.status(202).json({ message: "Video generation started", project: { ...project, _id: project.id } });

        // Background Processing
        (async () => {
            try {
                // 1. Generate video segments sequentially to avoid API limits
                const completedScenes = [];
                for (const scene of scenes) {
                    await prisma.scene.update({
                        where: { id: scene.id },
                        data: { status: 'generating' }
                    });
                    
                    const finalPrompt = buildCinematicPrompt(scene.prompt, { tone: project.style }, template);
                    console.log(`Generating Video for Scene ${scene.sceneNumber}: ${finalPrompt}`);
                    
                    try {
                        const videoUrl = await generateVideoAsync(finalPrompt, template.defaultDuration, "1280:720");
                        console.log(`Scene ${scene.sceneNumber} Generated: ${videoUrl}`);
                        
                        const updatedScene = await prisma.scene.update({
                            where: { id: scene.id },
                            data: { videoUrl, status: 'completed' }
                        });
                        
                        completedScenes.push({ ...updatedScene, _id: updatedScene.id });
                    } catch (err) {
                        console.error(`Failed to generate Scene ${scene.sceneNumber}:`, err);
                        await prisma.scene.update({
                            where: { id: scene.id },
                            data: { status: 'failed' }
                        });
                        throw err; // Stop the pipeline if a scene fails
                    }
                }

                // 2. Render final video using FFmpeg
                console.log("Starting final render for project:", projectId);
                const finalUrl = await renderFinalVideo(completedScenes, projectId);
                
                console.log(`Project ${projectId} completely finished! URL: ${finalUrl}`);
                // project status is updated in renderFinalVideo
            } catch (err) {
                console.error("Background Video Generation Failed for project", projectId, err);
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

        await prisma.scene.update({
            where: { id: sceneId },
            data: { status: 'generating', prompt: promptOverride || scene.prompt }
        });

        res.status(202).json({ message: "Scene regeneration started" });

        (async () => {
            try {
                const finalPrompt = buildCinematicPrompt(promptOverride || scene.prompt, { tone: project.style }, template);
                const videoUrl = await generateVideoAsync(finalPrompt, template.defaultDuration, "1280:720");
                await prisma.scene.update({
                    where: { id: sceneId },
                    data: { videoUrl, status: 'completed' }
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
