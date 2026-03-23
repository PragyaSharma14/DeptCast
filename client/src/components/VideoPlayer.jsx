import React, { useEffect, useState } from 'react';
import { getProjectDetails, getMediaUrl, regenerateScene } from '../services/api';
import { ArrowLeft, Loader2, Download, Video as VideoIcon, RotateCw } from 'lucide-react';

export const VideoPlayer = ({ project, onBack }) => {
    const [currentProject, setCurrentProject] = useState(project);
    const [scenes, setScenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(null);

    const fetchDetails = async () => {
        try {
            const data = await getProjectDetails(currentProject._id);
            setCurrentProject(data.project);
            setScenes(data.scenes);
            setLoading(false);
        } catch(err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
        // Polling if generating
        let interval;
        if (currentProject.status === 'generating') {
            interval = setInterval(fetchDetails, 5000);
        }
        return () => clearInterval(interval);
    }, [currentProject.status, currentProject._id]);

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
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={40} /></div>;
    }

    const isGenerating = currentProject.status === 'generating' || currentProject.status === 'pending';
    const isFailed = currentProject.status === 'failed';

    return (
        <div className="w-full">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </button>
            
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Project Output</h2>
                    <p className="text-gray-400">Status: <span className={`font-semibold uppercase tracking-wider ${isGenerating ? 'text-purple-400' : isFailed ? 'text-red-400' : 'text-green-400'}`}>{currentProject.status}</span></p>
                </div>
                {currentProject.finalVideoUrl && (
                    <a href={getMediaUrl(currentProject.finalVideoUrl)} download target="_blank" rel="noreferrer"
                       className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-700 hover:border-gray-600">
                        <Download size={18} /> Download Master
                    </a>
                )}
            </div>

            {isGenerating ? (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-10 text-center mb-10">
                    <Loader2 className="animate-spin text-brand mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2">Generating Masterpiece...</h3>
                    <p className="text-gray-400">This takes a few minutes as we render and stitch the cinematic scenes.</p>
                </div>
            ) : currentProject.finalVideoUrl ? (
                <div className="mb-10 w-full rounded-xl overflow-hidden border-[3px] border-brand/40 shadow-[0_0_30px_rgba(170,59,255,0.15)] bg-black aspect-video relative group">
                    <video 
                        src={getMediaUrl(currentProject.finalVideoUrl)} 
                        controls 
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : isFailed && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 mb-10 text-center text-red-500 font-medium">
                    Generation failed. Please try regenerating individual scenes or create a new project.
                </div>
            )}

            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-800 pb-2">Individual Scenes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scenes.map((scene, i) => (
                        <div key={scene._id} className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden flex flex-col hover:border-gray-600 transition-colors shadow-lg">
                            {scene.videoUrl ? (
                                <div className="aspect-video bg-black relative">
                                    <video src={getMediaUrl(scene.videoUrl)} controls className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center text-gray-500">
                                    {scene.status === 'generating' ? <Loader2 className="animate-spin mb-2" /> : <VideoIcon className="mb-2 opacity-50" size={32} />}
                                    <span className="text-sm uppercase tracking-wider font-semibold">{scene.status}</span>
                                </div>
                            )}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <p className="text-sm text-gray-300 mb-5 leading-relaxed">
                                    <span className="font-bold text-brand mr-2 px-1.5 py-0.5 bg-brand/10 rounded">#{scene.sceneNumber}</span>
                                    {scene.description}
                                </p>
                                <button 
                                    onClick={() => handleRegenerateScene(scene._id)}
                                    disabled={regenerating === scene._id || isGenerating}
                                    className="text-sm font-medium flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 py-2.5 rounded-lg transition-all disabled:opacity-50 hover:shadow-md"
                                >
                                    {regenerating === scene._id ? <Loader2 size={16} className="animate-spin" /> : <RotateCw size={16} />}
                                    Regenerate Scene
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
