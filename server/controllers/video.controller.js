import Project from '../models/Project.js';
import Scene from '../models/Scene.js';
import { getTemplateByDomain } from '../services/template.service.js';
import { buildCinematicPrompt } from '../services/prompt.service.js';
import { generateVideoAsync } from '../services/veo.service.js';
import { renderFinalVideo } from '../services/render.service.js';

export const generateVideo = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: "Project not found" });

        await Project.findByIdAndUpdate(projectId, { status: 'generating' });

        // Get all scenes for project
        const scenes = await Scene.find({ projectId }).sort({ sceneNumber: 1 });
        const template = getTemplateByDomain(project.domain);
        
        // This process takes time, so we should respond right away and process in background
        // For REST MVP, we will do it synchronously or simulate background depending on client timeout
        // Express might timeout if generation takes > 2 mins. Better to process async.

        res.status(202).json({ message: "Video generation started", project });

        // Background Processing
        (async () => {
            try {
                // 1. Generate video segments sequentially to avoid API limits
                const completedScenes = [];
                for (const scene of scenes) {
                    await Scene.findByIdAndUpdate(scene._id, { status: 'generating' });
                    
                    const finalPrompt = buildCinematicPrompt(scene.prompt, { tone: project.style }, template);
                    console.log(`Generating Video for Scene ${scene.sceneNumber}: ${finalPrompt}`);
                    
                    try {
                        const videoUrl = await generateVideoAsync(finalPrompt, template.defaultDuration, "1280:720");
                        console.log(`Scene ${scene.sceneNumber} Generated: ${videoUrl}`);
                        
                        const updatedScene = await Scene.findByIdAndUpdate(scene._id, { 
                            videoUrl, 
                            status: 'completed' 
                        }, { new: true });
                        
                        completedScenes.push(updatedScene);
                    } catch (err) {
                        console.error(`Failed to generate Scene ${scene.sceneNumber}:`, err);
                        await Scene.findByIdAndUpdate(scene._id, { status: 'failed' });
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
                await Project.findByIdAndUpdate(projectId, { status: 'failed' });
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
        
        const scene = await Scene.findById(sceneId);
        if(!scene) return res.status(404).json({ error: "Scene not found" });
        
        const project = await Project.findById(scene.projectId);
        const template = getTemplateByDomain(project.domain);

        await Scene.findByIdAndUpdate(sceneId, { status: 'generating', prompt: promptOverride || scene.prompt });
        res.status(202).json({ message: "Scene regeneration started" });

        (async () => {
            try {
                const finalPrompt = buildCinematicPrompt(promptOverride || scene.prompt, { tone: project.style }, template);
                const videoUrl = await generateVideoAsync(finalPrompt, template.defaultDuration, "1280:720");
                await Scene.findByIdAndUpdate(sceneId, { videoUrl, status: 'completed' });

                // We don't auto stitch here, user can trigger "re-render" separately if desired
            } catch (err) {
                 console.error("Regenerate Scene Failed", err);
                 await Scene.findByIdAndUpdate(sceneId, { status: 'failed' });
            }
        })();
        
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
}
