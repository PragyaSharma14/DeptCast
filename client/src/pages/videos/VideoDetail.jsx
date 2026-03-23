import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { getProjectDetails, getMediaUrl, regenerateScene } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Loader2, Download, Video as VideoIcon, RotateCw, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const VideoDetail = () => {
    const { projectId } = useParams();
    const [, setLocation] = useLocation();
    const [project, setProject] = useState(null);
    const [scenes, setScenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(null);

    const fetchDetails = async () => {
        try {
            const data = await getProjectDetails(projectId);
            setProject(data.project);
            setScenes(data.scenes);
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!projectId) return;
        fetchDetails();
        
        let interval;
        if (project?.status === 'generating') {
            interval = setInterval(fetchDetails, 5000);
        }
        return () => clearInterval(interval);
    }, [projectId, project?.status]);

    const handleRegenerateScene = async (sceneId) => {
        setRegenerating(sceneId);
        try {
            await regenerateScene(sceneId, null);
            await fetchDetails();
        } catch(e) {
            console.error(e);
            alert("Failed to regenerate scene");
        } finally {
            setRegenerating(null);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin text-brand h-12 w-12" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-20 bg-dark-glass backdrop-blur-md rounded-2xl max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-4">Video Not Found</h2>
                <Button onClick={() => setLocation('/')} variant="secondary">Back to Dashboard</Button>
            </div>
        );
    }

    const isGenerating = project.status === 'generating' || project.status === 'pending';
    const isFailed = project.status === 'failed';

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => setLocation('/')}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
                        {project.prompt ? project.prompt.substring(0, 50) + '...' : 'Generated Video'}
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "text-xs px-2.5 py-1 rounded-md font-medium uppercase tracking-wider",
                            isGenerating ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : 
                            isFailed ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                            "bg-green-500/10 text-green-400 border border-green-500/20"
                        )}>
                            {project.status}
                        </span>
                        <span className="text-sm text-gray-500 border-l border-white/10 pl-3">
                            {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {project.finalVideoUrl && (
                    <Button 
                        asChild
                        className="bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        <a href={getMediaUrl(project.finalVideoUrl)} download target="_blank" rel="noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Download Master
                        </a>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Main Player Area */}
                <div className="lg:col-span-2 space-y-6">
                    {isGenerating ? (
                        <Card className="aspect-video flex flex-col items-center justify-center border-dashed border-2 bg-black/40 text-center p-8">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full scale-150 animate-pulse" />
                                <div className="bg-darker p-4 rounded-full border border-white/10 relative">
                                    <Loader2 className="animate-spin text-brand h-10 w-10" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Rendering Final Video...</h3>
                            <p className="text-gray-400 max-w-sm">We are synthesizing the AI scenes and rendering the master file. This process may take a few minutes.</p>
                        </Card>
                    ) : project.finalVideoUrl ? (
                        <Card className="overflow-hidden border border-brand/30 shadow-[0_0_40px_rgba(170,59,255,0.1)] bg-black/50">
                            <div className="aspect-video relative group bg-black flex items-center justify-center">
                                <video 
                                    src={getMediaUrl(project.finalVideoUrl)} 
                                    controls 
                                    autoPlay
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </Card>
                    ) : isFailed ? (
                        <Card className="aspect-video flex flex-col items-center justify-center bg-red-900/10 border-red-500/20 text-center p-8">
                            <div className="bg-red-500/10 p-4 rounded-full mb-4">
                                <VideoIcon className="h-10 w-10 text-red-500 opacity-50 block" />
                            </div>
                            <h3 className="text-xl font-bold text-red-400 mb-2">Generation Failed</h3>
                            <p className="text-gray-400 max-w-sm">The background rendering cluster encountered an error. Please try regenerating individual scenes.</p>
                        </Card>
                    ) : null}

                    {/* Meta Script info */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-heading font-semibold text-white mb-4">Prompt Configuration</h3>
                            <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-sm text-gray-300 leading-relaxed overflow-x-auto">
                                {project.prompt}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Scenes Sidebar */}
                <div className="space-y-4">
                    <h3 className="text-xl font-heading font-semibold text-white sticky top-20 bg-darker/90 backdrop-blur-md py-4 z-10 border-b border-white/10">
                        Scene Breakdown
                    </h3>
                    
                    <div className="space-y-4">
                        {scenes.map((scene, i) => (
                            <Card key={scene._id} className="overflow-hidden group hover:border-white/20 transition-all duration-300">
                                {scene.videoUrl ? (
                                    <div className="aspect-video bg-black relative">
                                        <video src={getMediaUrl(scene.videoUrl)} controls className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-black/60 flex flex-col items-center justify-center text-gray-500 border-b border-white/5">
                                        {scene.status === 'generating' ? (
                                            <Loader2 className="animate-spin mb-3 text-brand" size={28} />
                                        ) : (
                                            <VideoIcon className="mb-3 opacity-30" size={28} />
                                        )}
                                        <span className="text-xs uppercase tracking-widest font-bold font-heading">{scene.status}</span>
                                    </div>
                                )}
                                <CardContent className="p-4 flex flex-col gap-4">
                                    <div className="flex gap-3 items-start">
                                        <div className="flex-shrink-0 w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                            {scene.sceneNumber || i+1}
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                                            {scene.description}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="secondary" 
                                        size="sm"
                                        onClick={() => handleRegenerateScene(scene._id)}
                                        disabled={regenerating === scene._id || isGenerating}
                                        className="w-full text-xs"
                                    >
                                        {regenerating === scene._id ? <Loader2 size={14} className="animate-spin mr-2" /> : <RotateCw size={14} className="mr-2" />}
                                        Regenerate Fix
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
