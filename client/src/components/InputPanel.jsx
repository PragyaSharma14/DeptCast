import React, { useState } from 'react';
import { createProject } from '../services/api';
import { Loader2, Wand2, ArrowLeft } from 'lucide-react';

export const InputPanel = ({ onProjectCreated, onCancel }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!prompt.trim()) return;
        setLoading(true);
        try {
            const data = await createProject(prompt);
            onProjectCreated(data); // { project, scenes }
        } catch(err) {
            console.error(err);
            alert("Failed to analyze intent. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <button onClick={onCancel} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </button>
            
            <h2 className="text-3xl font-bold mb-2">What do you want to create?</h2>
            <p className="text-gray-400 mb-8">Describe your video. Our AI will determine the best domain, style, and structure.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. A fast-paced marketing promo for our new cloud infrastructure monitoring tool..."
                        className="w-full h-40 bg-gray-800/80 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none resize-none transition-all"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading || !prompt.trim()}
                    className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-brand to-purple-600 hover:from-brand-light hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                    {loading ? 'Analyzing Intent & Planning Scenes...' : 'Generate Video Plan'}
                </button>
            </form>
        </div>
    );
};
