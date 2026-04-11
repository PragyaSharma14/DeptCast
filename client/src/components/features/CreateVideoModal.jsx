import React, { useState, useEffect } from 'react';
import { 
    X, ChevronRight, Sparkles, Wand2, 
    Monitor, Tablet, Smartphone, Clock, 
    Video, CheckCircle, ArrowRight, Loader2,
    Briefcase, FileText, Layout, Palette,
    Globe, Target, MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { generateBlueprint, createProject } from '../../services/api';
import { useLocation } from 'wouter';

export const CreateVideoModal = ({ isOpen, onClose, initialDepartment }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [, setLocation] = useLocation();
    const [config, setConfig] = useState({
        department: initialDepartment,
        template: initialDepartment?.templates?.[0],
        dimension: '16:9',
        style: 'Cinematic',
        duration: 8,
        customPrompt: ''
    });
    const [blueprint, setBlueprint] = useState(null);

    if (!isOpen) return null;

    const handleGenerateScript = async () => {
        setLoading(true);
        try {
            const result = await generateBlueprint({
                templateId: config.template?.id,
                style: config.style,
                dimension: config.dimension,
                customPrompt: config.customPrompt
            });
            setBlueprint(result);
            setStep(2);
        } catch (error) {
            console.error("Blueprint generation failed:", error);
            alert("Failed to generate AI script. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        setLoading(true);
        try {
            const project = await createProject({
                templateId: config.template?.id,
                style: config.style,
                dimension: config.dimension,
                intent: config.template?.title,
                domain: config.department?.name,
                targetDuration: config.duration,
                scenes: blueprint.scenes
            });
            onClose();
            setLocation(`/projects/${project.id}`);
        } catch (error) {
            console.error("Project creation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-3xl animate-in fade-in duration-500" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-7xl h-full max-h-[880px] bg-white border border-slate-200 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-700">
                
                {/* Left Section: Blueprint Tree (Target Style) */}
                <div className="w-full md:w-80 border-r border-slate-100 bg-slate-50/50 flex flex-col h-full">
                    <div className="p-10 border-b border-slate-100 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                <Video className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-heading font-black text-slate-900 leading-none">{config.department?.name}</h2>
                                <p className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest mt-2">Operational Node</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto stealth-scrollbar p-6 space-y-2">
                        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Strategic Blueprints</p>
                        {config.department?.templates?.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setConfig({ ...config, template: t })}
                                className={cn(
                                    "w-full p-5 rounded-[2rem] border-2 transition-all text-left flex items-center gap-4 group relative overflow-hidden",
                                    config.template?.id === t.id 
                                        ? "bg-white border-indigo-600 shadow-[0_10px_30px_rgba(79,70,229,0.1)]" 
                                        : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    config.template?.id === t.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                )}>
                                    <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-xs font-black truncate",
                                        config.template?.id === t.id ? "text-slate-900" : "text-slate-600"
                                    )}>{t.title}</p>
                                    <p className={cn(
                                        "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                                        config.template?.id === t.id ? "text-indigo-500" : "text-slate-400"
                                    )}>AI Ready Blueprint</p>
                                </div>
                                {config.template?.id === t.id && (
                                    <div className="absolute right-[-10px] top-[-10px] opacity-10">
                                        <CheckCircle size={40} className="text-indigo-600" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Section: Configuration Flow */}
                <div className="flex-1 flex flex-col bg-white h-full relative">
                    {/* Header with Luxury Stepper */}
                    <div className="p-10 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-12">
                            {[
                                { s: 1, label: 'Direction' },
                                { s: 2, label: 'AI Synthesis' },
                                { s: 3, label: 'Validation' }
                            ].map((item) => (
                                <div key={item.s} className="flex items-center gap-4 group">
                                    <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all",
                                        step >= item.s 
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                                            : "bg-slate-50 text-slate-300"
                                    )}>
                                        {step > item.s ? <CheckCircle size={18} /> : item.s}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1",
                                            step === item.s ? "text-slate-900" : "text-slate-300"
                                        )}>
                                            Stage 0{item.s}
                                        </span>
                                        <span className={cn(
                                            "text-xs font-black transition-colors",
                                            step === item.s ? "text-indigo-600 font-extrabold" : "text-slate-300"
                                        )}>{item.label}</span>
                                    </div>
                                    {item.s < 3 && <ChevronRight size={14} className="text-slate-200" />}
                                </div>
                            ))}
                        </div>
                        <button onClick={onClose} className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 overflow-y-auto stealth-scrollbar p-16">
                        {step === 1 && (
                            <div className="max-w-4xl space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
                                {/* Visual Direction */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-4">
                                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                            Select Visual Intelligence
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        {[
                                            { id: 'Cinematic', name: 'Cinematic Reality', desc: 'Photorealistic AI-Mesh Synthesis', icon: Globe },
                                            { id: 'Infographic', name: 'Premium Graphics', desc: 'Enterprise Motion Architecture', icon: Target }
                                        ].map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setConfig({ ...config, style: s.id })}
                                                className={cn(
                                                    "p-10 rounded-[3rem] border transition-all text-left space-y-6 group relative overflow-hidden",
                                                    config.style === s.id 
                                                        ? "bg-white border-indigo-600 shadow-[0_30px_60px_rgba(79,70,229,0.12)]" 
                                                        : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-sm",
                                                    config.style === s.id ? "bg-indigo-600 text-white" : "bg-white text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                                                )}>
                                                    <s.icon size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-slate-900 leading-tight">{s.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-extrabold mt-2 uppercase tracking-widest">{s.desc}</p>
                                                </div>
                                                {config.style === s.id && (
                                                    <div className="absolute top-8 right-8 text-indigo-600">
                                                        <Sparkles size={24} className="animate-pulse" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Frame Architecture */}
                                <div className="space-y-8">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-4">
                                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                        Frame Architecture
                                    </h3>
                                    <div className="flex gap-6 overflow-x-auto pb-4 stealth-scrollbar">
                                        {[
                                            { id: '16:9', name: 'Landscape', icon: Monitor, sub: 'Digital Displays' },
                                            { id: '9:16', name: 'Vertical', icon: Smartphone, sub: 'Mobile Mesh' },
                                            { id: '1:1', name: 'Standard', icon: Tablet, sub: 'Global Units' }
                                        ].map((d) => (
                                            <button
                                                key={d.id}
                                                onClick={() => setConfig({ ...config, dimension: d.id })}
                                                className={cn(
                                                    "min-w-[200px] flex-1 p-8 rounded-[2.5rem] border transition-all flex flex-col items-center text-center gap-4 group",
                                                    config.dimension === d.id 
                                                        ? "bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-900/20" 
                                                        : "bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                                                    config.dimension === d.id ? "bg-white/10" : "bg-white"
                                                )}>
                                                    <d.icon size={28} />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[11px] font-black uppercase tracking-widest leading-none block">{d.name}</span>
                                                    <span className="text-[10px] opacity-40 font-bold uppercase tracking-tight">{d.sub}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Context Engine */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-4">
                                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                            Context Extraction Engine
                                        </h3>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">High Priority</span>
                                    </div>
                                    <textarea 
                                        value={config.customPrompt}
                                        onChange={(e) => setConfig({ ...config, customPrompt: e.target.value })}
                                        placeholder="Add specific instructions for this production intelligence flow..."
                                        className="w-full h-40 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 text-base text-slate-900 shadow-inner placeholder:text-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <div className="flex items-center justify-between mb-8">
                                     <div className="space-y-2">
                                         <h3 className="text-4xl font-heading font-black text-slate-900 leading-none">Intelligence Synthesis</h3>
                                         <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">Constructing high-fidelity visual prompts</p>
                                     </div>
                                     <div className="px-5 py-2.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center gap-3">
                                         <Sparkles size={14} className="animate-pulse" /> AutoGen Powered
                                     </div>
                                </div>

                                <div className="space-y-6">
                                    {blueprint?.scenes?.map((scene, idx) => (
                                        <div key={idx} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all flex flex-col md:flex-row gap-8 items-start group shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.05)]">
                                            <div className="flex-shrink-0 w-16 h-16 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 space-y-6">
                                                <div className="space-y-4">
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block border-b border-indigo-100 w-fit pb-1">Segment Protocol</span>
                                                    <p className="text-xl text-slate-900 font-black leading-tight italic">"{scene.description}"</p>
                                                </div>
                                                <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-inner space-y-3">
                                                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Visual Prompt Architecture</p>
                                                     <p className="text-sm text-slate-500 font-medium leading-relaxed">{scene.prompt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-12 border-t border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
                        <div className="flex items-center gap-4 text-slate-400">
                            <Clock size={18} className="text-indigo-400" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Est. Latency: 3m 45s</span>
                        </div>
                        <div className="flex items-center gap-6">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-10 py-5 rounded-full text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest"
                                >
                                    Back
                                </button>
                            )}
                            <button 
                                onClick={step === 1 ? handleGenerateScript : handleCreateProject}
                                disabled={loading}
                                className="px-12 py-6 rounded-[2rem] bg-slate-900 hover:bg-black text-white font-black uppercase tracking-[0.25em] text-[11px] shadow-[0_20px_50px_rgba(15,23,42,0.2)] flex items-center gap-4 group transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        {step === 1 ? 'Execute AI Synthesis' : 'Finalize Broadcast'}
                                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
