import React, { useState } from 'react';
import { generateVideo } from '../services/api';
import { Play, Loader2, Edit3, ArrowLeft } from 'lucide-react';

export const AIPreview = ({ projectData, onGenerationStarted }) => {
    const { project, scenes } = projectData;
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            await generateVideo(project._id);
            onGenerationStarted();
        } catch(err) {
            console.error(err);
            alert("Failed to start generation.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold mb-2">Video Plan Ready</h2>
            <p className="text-gray-400 mb-8">Review the AI-generated scene structure before we render the final video.</p>
            
            <div className="bg-gray-800/40 rounded-xl p-6 mb-8 border border-gray-700/50">
                <div className="flex gap-4 mb-4">
                    <div>
                        <span className="text-xs text-brand block mb-1 uppercase tracking-wider font-bold">Domain</span>
                        <div className="bg-gray-800 px-3 py-1 rounded text-sm capitalize font-medium">{project.domain}</div>
                    </div>
                    <div>
                        <span className="text-xs text-purple-400 block mb-1 uppercase tracking-wider font-bold">Style Summary</span>
                        <div className="bg-gray-800 px-3 py-1 rounded text-sm capitalize font-medium">{project.style}</div>
                    </div>
                </div>
                <p className="text-sm text-gray-300 bg-gray-900/50 p-4 rounded-lg border border-gray-800 italic">
                    "{project.intent}"
                </p>
            </div>

            <div className="space-y-4 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-xl font-semibold mb-4 sticky top-0 bg-gray-900/90 backdrop-blur py-2 z-10">Scenes ({scenes.length})</h3>
                {scenes.map((scene, i) => (
                    <div key={scene._id || i} className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-5 flex gap-4 transition-all group">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold">
                            {i + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-200 text-sm leading-relaxed">{scene.description}</p>
                        </div>
                        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Edit Scene (coming soon)">
                            <Edit3 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 transform hover:scale-[1.02]"
            >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Play size={24} />}
                {loading ? 'Starting cluster...' : 'Start Rendering Video'}
            </button>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
            `}</style>
        </div>
    );
};
