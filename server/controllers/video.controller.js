import prisma from '../db.js';
import { getTemplateByDomain } from '../services/template.service.js';
import { buildCinematicPrompt } from '../services/prompt.service.js';
import { generateVideoVeoAsync } from '../services/veo.service.js';
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

        // Get all scenes for project
        const scenes = await prisma.scene.findMany({
            where: { projectId },
            orderBy: { sceneNumber: 'asc' }
        });
        
        // Dynamic Credit Calculation: 1 credit per second (5 seconds per Veo scene)
        const totalDurationSeconds = scenes.length * 5;
        const CREDIT_COST = totalDurationSeconds;
        
        const org = await prisma.organization.findUnique({ where: { id: req.org.id || req.org._id } });
        if (org.credits < CREDIT_COST) {
            return res.status(402).json({ error: `Insufficient credits. This ${totalDurationSeconds}s video requires ${CREDIT_COST} credits.` });
        }

        // Deduct Credits and Update Status in one transaction
        const [updatedProject] = await prisma.$transaction([
            prisma.project.update({
                where: { id: projectId },
                data: { status: 'generating' }
            }),
            prisma.organization.update({
                where: { id: org.id },
                data: { credits: { decrement: CREDIT_COST } }
            })
        ]);

        const template = getTemplateByDomain(project.domain);
        
        // Respond with updated status to trigger frontend polling immediately
        res.status(202).json({ 
            message: `Video generation started via Google Veo (${totalDurationSeconds}s)`, 
            project: { ...updatedProject, _id: updatedProject.id },
            creditsRemaining: org.credits - CREDIT_COST
        });

        // Background Processing
        (async () => {
            try {
                // Sora 2 Pro specifically targets 1080p exports
                const dimensionMap = {
                    "16:9": "1920x1080",
                    "9:16": "1080x1920"
                };
                const videoRes = dimensionMap[project.dimension] || "1920x1080";

                // 1. Mark scenes as generating
                await prisma.scene.updateMany({
                    where: { projectId },
                    data: { status: 'generating' }
                });

                console.log(`[Google Veo] Starting parallel generation for ${scenes.length} scenes...`);

                // 2. Call Veo in parallel for each scene
                const videoPromises = scenes.map(async (scene) => {
                    try {
                        const videoUrl = await generateVideoVeoAsync(scene.prompt, 5, videoRes);
                        
                        // Update individual scene status
                        await prisma.scene.update({
                            where: { id: scene.id },
                            data: { status: 'completed' } // We could store a videoUrl on the scene model if it existed, for now just status
                        });
                        
                        // Pass along the URL so we can stitch it later.
                        // We will add the url dynamically to the scene object
                        return { ...scene, videoUrl };
                    } catch (error) {
                        await prisma.scene.update({
                            where: { id: scene.id },
                            data: { status: 'failed' }
                        });
                        throw error; // Fail the entire project if one scene fails
                    }
                });

                const completedScenesWithVideoUrls = await Promise.all(videoPromises);
                console.log(`[Google Veo] All scenes generated. Stitching videos...`);

                // 3. Stitch videos together
                const finalVideoUrl = await renderFinalVideo(completedScenesWithVideoUrls, projectId);
                
                // 4. Update project with final single video URL
                await prisma.project.update({
                    where: { id: projectId },
                    data: { 
                        status: 'completed',
                        finalVideoUrl: finalVideoUrl 
                    }
                });

                console.log(`Project ${projectId} completely finished using Google Veo! URL: ${finalVideoUrl}`);
            } catch (err) {
                console.error("Background Video Generation Failed for project", projectId, err);
                
                // Refund Credits and mark failed
                await prisma.$transaction([
                    prisma.project.update({
                        where: { id: projectId },
                        data: { status: 'failed' }
                    }),
                    prisma.organization.update({
                        where: { id: req.org.id || req.org._id },
                        data: { credits: { increment: CREDIT_COST } } // Refund dynamic CREDIT_COST
                    })
                ]);
                console.log(`[Refund] Refunded ${CREDIT_COST} credits to org ${req.org.id || req.org._id} due to generation failure.`);
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
                const videoUrl = await generateVideoVeoAsync(finalPrompt, 5, "1920x1080");
                
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
