import prisma from '../db.js';
import { getTemplateByDomain } from '../services/template.service.js';
import { buildCinematicPrompt } from '../services/prompt.service.js';
import { generateVideoVeoAsync } from '../services/veo.service.js';
import { generateRemotionVideo } from '../services/remotion.service.js';
import { generateImageAsync } from '../services/imagen.service.js';
import { generateAudioAsync } from '../services/audio.service.js';
import { stitchScenesAsync } from '../services/stitching.service.js';

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
            return res.status(402).json({ error: `Insufficient credits. This ${project.targetDuration}s video requires ${CREDIT_COST} credits.` });
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
            message: `Video generation started via Google Veo (${project.targetDuration}s)`, 
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
                
                // 4s -> 4s per scene, 8s -> 8s per scene, 16s -> 8s per scene (2 scenes)
                const perSceneDuration = project.targetDuration <= 8 ? project.targetDuration : 8;

                // 1. Mark scenes as generating
                await prisma.scene.updateMany({
                    where: { projectId },
                    data: { status: 'generating' }
                });

                // Always parse/generate scenes via AutoGen regardless of style
                let jsonScenes = null;
                console.log(`[AutoGen] Generating scene breakdown for project ${projectId}...`);
                
                try {
                    // Try to see if it's already a JSON
                    const parsed = JSON.parse(scenes[0].prompt);
                    if (parsed.scenes && Array.isArray(parsed.scenes)) {
                        jsonScenes = parsed.scenes;
                    } else if (parsed.type === 'sequence') {
                        // Legacy Infographic format
                        jsonScenes = [parsed];
                    } else {
                        throw new Error("Invalid structure");
                    }
                } catch (e) {
                    console.log("[AutoGen] Calling AutoGen to break down script...");
                    const autogenUrl = (process.env.AUTOGEN_URL || 'http://localhost:8000').replace(/\/$/, '');
                    const response = await fetch(`${autogenUrl}/generate-script`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-Secret': process.env.AUTOGEN_SECRET || ''
                        },
                        body: JSON.stringify({
                            prompt: scenes.map(s => s.prompt).join('\n'),
                            department: project.domain || 'General',
                            style: project.style || 'Hyper Realistic',
                            template: (template && template.title) ? template.title : "Standard generation",
                            dimension: project.dimension || '16:9',
                            targetDuration: project.targetDuration || 16,
                            avatar: project.avatar || null
                        })
                    });
                    
                    if (!response.ok) throw new Error(`AutoGen failed: ${response.status}`);
                    
                    const result = await response.json();
                    if (result.scenes && Array.isArray(result.scenes)) {
                        jsonScenes = result.scenes;
                    } else {
                        throw new Error("AutoGen returned invalid data.");
                    }
                }

                if (project.style === 'Infographics') {
                    console.log(`[Remotion] Starting Remotion generation for project ${projectId}...`);
                    
                    // The AST is embedded in the first scene's `prompt` for Infographics
                    let jsonAst;
                    try {
                        jsonAst = (new Function(`return ${jsonScenes[0].prompt};`))();
                    } catch(err) {
                        throw new Error("AI generated invalid AST format for Remotion.");
                    }

                    const finalVideoUrl = await generateRemotionVideo(jsonAst, projectId);
                    
                    await prisma.scene.updateMany({
                        where: { projectId },
                        data: { status: 'completed' }
                    });

                    await prisma.project.update({
                        where: { id: projectId },
                        data: { status: 'completed', finalVideoUrl }
                    });
                    
                    console.log(`Project ${projectId} finished using Remotion! URL: ${finalVideoUrl}`);

                } else {
                    console.log(`[Google Veo] Starting progressive generation for ${jsonScenes.length} scenes...`);

                    const stitchedClips = [];

                    for (let i = 0; i < jsonScenes.length; i++) {
                        const sceneData = jsonScenes[i];
                        const duration = sceneData.duration_seconds || 8;
                        console.log(`\n--- Processing Scene ${i + 1} (${duration}s) ---`);
                        
                        try {
                            // 1. Generate Image (Imagen)
                            let imageUrl = project.referenceImageUrl; // fallback to base if no scene prompt
                            if (sceneData.image_prompt) {
                                console.log(`[Imagen] Generating reference image for scene ${i + 1}...`);
                                imageUrl = await generateImageAsync(sceneData.image_prompt, project.dimension || "16:9", project.avatar);
                            }

                            // 2. Generate Video (Veo)
                            console.log(`[Veo] Generating video for scene ${i + 1}...`);
                            const videoUrl = await generateVideoVeoAsync(sceneData.prompt, duration, videoRes, imageUrl);

                            // 3. Generate Audio (TTS)
                            let audioUrl = null;
                            if (sceneData.narration && sceneData.narration.trim() !== '') {
                                console.log(`[Audio] Generating TTS for scene ${i + 1}...`);
                                audioUrl = await generateAudioAsync(sceneData.narration);
                            }

                            stitchedClips.push({
                                videoPath: videoUrl,
                                audioPath: audioUrl,
                                duration: duration
                            });
                            
                            // Try to update DB to reflect progress
                            if (scenes[i]) {
                                await prisma.scene.update({
                                    where: { id: scenes[i].id },
                                    data: { status: 'completed', description: sceneData.description || 'Done' }
                                });
                            }

                        } catch (error) {
                            console.error(`Failed on Scene ${i + 1}:`, error);
                            throw error; 
                        }
                    }

                    // 4. Stitch it all together
                    console.log(`[Stitching] Commencing final stitch...`);
                    const finalVideoUrl = await stitchScenesAsync(stitchedClips);
                    
                    await prisma.project.update({
                        where: { id: projectId },
                        data: { 
                            status: 'completed',
                            finalVideoUrl: finalVideoUrl 
                        }
                    });

                    console.log(`Project ${projectId} completely finished using Google Veo Pipeline! URL: ${finalVideoUrl}`);
                }
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
                
                console.log("\n=======================================================");
                console.log("[FINAL VEO PROMPT SENT TO GEMINI (REGENERATE)]");
                console.log(finalPrompt);
                console.log("=======================================================\n");

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

