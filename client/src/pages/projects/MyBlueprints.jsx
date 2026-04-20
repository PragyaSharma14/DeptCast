import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { getProjects } from '../../services/api';
import { 
    Folder, Video, Clock, ArrowRight, PlayCircle, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

export const MyBlueprints = () => {
    const [, setLocation] = useLocation();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (err) {
                console.error("Failed to load blueprints", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Blueprints...</p>
            </div>
        );
    }

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="pb-20 w-full max-w-6xl mx-auto"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mt-10 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Folder className="h-5 w-5 text-brand" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Library</span>
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">My Blueprints</h1>
                    <p className="text-slate-500 font-medium mt-2">Manage and review your generated strategic templates and videos.</p>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 text-brand rounded-2xl flex items-center justify-center mb-4">
                        <Folder size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">No Blueprints Yet</h3>
                    <p className="text-slate-500 mt-2 max-w-md">You haven't generated any corporate videos yet. Select a department from the sidebar to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <motion.div 
                            variants={item}
                            key={project._id}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-brand/40 transition-all cursor-pointer"
                            onClick={() => setLocation(`/videos/${project._id}`)}
                        >
                            <div className="aspect-video bg-slate-900 relative overflow-hidden flex items-center justify-center">
                                {project.videoUrl ? (
                                    <video 
                                        src={project.videoUrl} 
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        muted 
                                        loop 
                                        onMouseOver={e => e.target.play()}
                                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-purple-500/20 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-2">
                                            {project.status === 'draft' || project.status === 'generating' ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <PlayCircle size={24} />
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="px-2.5 py-1 rounded-md bg-slate-900/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest border border-white/10">
                                        {project.domain || 'General'}
                                    </span>
                                </div>
                                
                                {project.status === 'generating' && (
                                    <div className="absolute top-3 right-3">
                                        <span className="px-2.5 py-1 rounded-md bg-amber-500/90 text-white text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                            <Loader2 size={10} className="animate-spin" /> Processing
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight flex-1">
                                    {project.intent || 'Corporate Communication Video'}
                                </h3>
                                
                                <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-[10px] uppercase font-bold tracking-widest text-slate-600">
                                        <Sparkles size={12} className="text-purple-500" /> {project.style || 'Hyper Realistic'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={12} /> {new Date(project.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
