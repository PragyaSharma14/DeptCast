import React, { useEffect, useState } from 'react';
import { getProjects } from '../services/api';
import { PlusCircle, Video, Loader2 } from 'lucide-react';

export const Dashboard = ({ onCreateNew, onSelectProject }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProjects().then(data => {
            setProjects(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold font-heading">Your Projects</h2>
                <button onClick={onCreateNew} className="flex items-center gap-2 bg-brand/20 hover:bg-brand/40 text-brand-light border border-brand/50 px-4 py-2 rounded-lg transition-all">
                    <PlusCircle size={20} /> New Project
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={40} /></div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Video size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No projects yet. Create your first video tracking!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project._id} onClick={() => onSelectProject(project)} className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl p-5 cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand/10">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-1 text-xs rounded-full uppercase tracking-wider font-semibold 
                                    ${project.status === 'completed' ? 'bg-green-500/20 text-green-400' 
                                    : project.status === 'failed' ? 'bg-red-500/20 text-red-400' 
                                    : project.status === 'generating' ? 'bg-purple-500/20 text-purple-400' 
                                    : 'bg-blue-500/20 text-blue-400'}`}>
                                    {project.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-semibold text-lg line-clamp-2 mb-3 text-gray-200 leading-snug">{project.intent}</h3>
                            <div className="flex gap-2 text-xs">
                                <span className="bg-gray-700/50 px-2 py-1 rounded-md text-gray-300 capitalize">{project.domain}</span>
                                <span className="bg-gray-700/50 px-2 py-1 rounded-md text-gray-300 capitalize">{project.style}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
