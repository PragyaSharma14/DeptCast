import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Sparkles, Video, CheckCircle2, ArrowRight, Loader2,
    Building2, Monitor, Tablet, Smartphone, UserCheck, Layout, Clock, FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { generateBlueprint, createProject } from '../../services/api';
import { DimensionSelector } from './DimensionSelector';

export const ProductionModal = ({ isOpen, onClose, selectedDepartment }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [, setLocation] = useLocation();
    
    // Store configuration
    const [config, setConfig] = useState({
        template: null, // This is the Blueprint in UI
        dimension: '16:9',
        style: 'Hyper Realistic',
        duration: 16,
        customPrompt: ''
    });
    
    const [aiResult, setAiResult] = useState('');

    // Reset when modal opens with a new department
    useEffect(() => {
        if (isOpen && selectedDepartment) {
            setStep(1);
            setConfig(prev => ({
                ...prev,
                template: selectedDepartment.templates?.[0] || null,
                customPrompt: '',
                dimension: '16:9',
                style: 'Hyper Realistic',
                duration: 16
            }));
            setAiResult('');
        }
    }, [isOpen, selectedDepartment]);

    const templates = selectedDepartment?.templates || [];

    const handleMagic = async () => {
        setLoading(true);
        try {
            const result = await generateBlueprint({
                department: selectedDepartment.name,
                templateId: config.template?.id,
                style: config.style,
                dimension: config.dimension,
                additionalPrompt: config.customPrompt || "Standard generation without additional constraints."
            });
            
            if (!result.jobId) throw new Error("Failed to initialize AI Job.");
            
            setStep(2); // Move to loading screen immediately
            
            // Start polling the backend for completion
            const { checkBlueprintStatus } = await import('../../services/api');
            let attempts = 0;
            const maxAttempts = 40; // 40 * 3 seconds = 120 seconds total
            let blueprintText = "";

            while (attempts < maxAttempts) {
                const statusResult = await checkBlueprintStatus(result.jobId);
                
                if (statusResult.status === 'completed') {
                    blueprintText = statusResult.result;
                    break;
                } else if (statusResult.status === 'failed') {
                    throw new Error("AI Agent execution failed: " + (statusResult.error || "Internal Error"));
                }

                // Wait 3 seconds before next poll
                await new Promise(resolve => setTimeout(resolve, 3000));
                attempts++;
            }

            if (!blueprintText) throw new Error("Drafting timed out. The agents are still thinking, please try again.");
            
            setAiResult(blueprintText);
        } catch (error) {
            console.error("AI execution failed:", error);
            alert("Failed to synthesize strategic template. " + (error.message || "Please check logs."));
            setStep(1); // Revert step on error
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        setLoading(true);
        try {
            const finalPrompt = `[Style: ${config.style}, Ratio: ${config.dimension}, Target Length: ${config.duration}s]\n\n${aiResult}`;
            const projectResult = await createProject({
                department: selectedDepartment.name,
                templateId: config.template?.id,
                style: config.style,
                dimension: config.dimension,
                targetDuration: parseInt(config.duration),
                intent: config.template?.title || 'Unknown',
                additionalPrompt: finalPrompt
            });
            const projectId = projectResult.project?._id || projectResult.project?.id;

            if (projectId) {
                try {
                    const { generateVideo } = await import('../../services/api');
                    await generateVideo(projectId);
                } catch (err) {
                    console.warn("Auto-gen trigger failed", err);
                }
                onClose();
                setLocation(`/videos/${projectId}`);
            }
        } catch (error) {
            console.error("Project generation failed", error);
            alert("Failed to create video project.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && selectedDepartment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden font-sans">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" 
                        onClick={!loading ? onClose : undefined} 
                    />
                    
                    {/* Modal Container */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-[1400px] h-full max-h-[900px] bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
                    >
                        
                        {/* Left Pane: Blueprint Selection */}
                        <div className="w-full md:w-80 border-r border-slate-200 bg-[#4F46E5] flex flex-col h-full flex-shrink-0 text-white">
                            <div className="p-8 border-b border-white/10 space-y-4">
                                <div className="space-y-1">
                                     <div className="flex items-center gap-2 text-indigo-200 text-[11px] font-bold uppercase tracking-widest mb-2">
                                         <span>Departments</span> <span className="opacity-50">/</span> <span className="text-white">{selectedDepartment.name}</span>
                                     </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-xl font-heading font-bold leading-tight">{selectedDepartment.name}</h2>
                                        <p className="text-[10px] text-indigo-200 font-medium mt-1 pr-2 line-clamp-2">
                                            {selectedDepartment.description || 'Internal communications and training.'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 pt-2">
                                     <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg border border-white/10 text-[10px] font-bold tracking-widest">
                                         <Layout size={12} /> {templates.length} Blueprints
                                     </div>
                                     <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg border border-white/10 text-[10px] font-bold tracking-widest">
                                         <Sparkles size={12} /> {templates.length} AI Ready
                                     </div>
                                </div>
                            </div>

                            <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
                                <div className="px-5 py-3 tracking-widest text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 bg-white">
                                    Select Blueprint
                                </div>
                                <div className="flex-1 overflow-y-auto stealth-scrollbar p-3 space-y-1">
                                    {templates.map((tpl, i) => (
                                        <button
                                            key={tpl.id}
                                            onClick={() => setConfig({ ...config, template: tpl })}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl transition-all text-left flex items-start flex-col gap-1 relative",
                                                config.template?.id === tpl.id 
                                                    ? "bg-white text-brand shadow-sm border border-slate-200 ring-1 ring-brand/10" 
                                                    : "hover:bg-slate-100 hover:text-slate-900 text-slate-600 border border-transparent"
                                            )}
                                        >
                                            {config.template?.id === tpl.id && (
                                                <div className="absolute left-0 top-3 bottom-3 w-1 bg-brand rounded-r-full" />
                                            )}
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="text-[10px] font-black opacity-40 w-4">{String(i + 1).padStart(2, '0')}</span>
                                                <span className="text-sm font-bold flex-1">{tpl.title}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest opacity-60 font-semibold pl-6">
                                                <Sparkles size={10} /> AI Script Ready
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Pane: Configuration Flow */}
                        <div className="flex-1 flex flex-col bg-white h-full relative">
                            {/* Header with Stepper & Close */}
                            <div className="px-8 py-5 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white z-10">
                                <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center">
                                         <Video size={20} />
                                     </div>
                                     <h1 className="text-2xl font-heading font-black text-slate-900 tracking-tight">Produce Your Corporate Video</h1>
                                </div>
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {/* Stepper Visual */}
                            <div className="px-10 py-6 border-b border-slate-50 flex items-center gap-8 justify-center max-w-2xl mx-auto w-full">
                                 {[
                                     { s: 1, label: 'Details' },
                                     { s: 2, label: 'AI Magic' },
                                     { s: 3, label: 'Review & Save' }
                                 ].map((item, idx) => (
                                     <React.Fragment key={item.s}>
                                         <div className="flex flex-col items-center gap-2">
                                             <div className={cn(
                                                 "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                                 step === item.s ? "bg-brand text-white shadow-md shadow-brand/20" : 
                                                 step > item.s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                                             )}>
                                                 {step > item.s ? <CheckCircle2 size={14} /> : item.s}
                                             </div>
                                             <span className={cn("text-[10px] font-bold uppercase tracking-widest", step === item.s ? "text-slate-900" : "text-slate-400")}>{item.label}</span>
                                         </div>
                                         {idx < 2 && <div className={cn("flex-1 h-px", step > idx + 1 ? "bg-slate-900" : "bg-slate-100")} />}
                                     </React.Fragment>
                                 ))}
                            </div>

                            {/* Content Scroll Area */}
                            <div className="flex-1 overflow-y-auto stealth-scrollbar p-6 lg:p-10">
                                <div className="max-w-3xl mx-auto">
                                    {!config.template ? (
                                        <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="w-16 h-16 bg-blue-50 text-indigo-400 rounded-2xl flex items-center justify-center mb-2">
                                                <Video size={32} />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Select a Blueprint</h2>
                                            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                                                Choose a video template from the menu on the left to start configuring and producing your corporate video.
                                            </p>
                                        </div>
                                    ) : step === 1 ? (
                                        <AnimatePresence mode="wait">
                                            <motion.div 
                                                key="step1"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-10 pb-20"
                                            >
                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Blueprint Type</label>
                                                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-700 font-semibold shadow-inner">
                                                        {config.template.title}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <FileText size={16} className="text-brand"/> Additional Data / Prompt (Optional)
                                                    </label>
                                                    <p className="text-[11px] text-slate-500 mb-2">Provide specific data, policies, or context to be injected into this template.</p>
                                                    <textarea 
                                                        value={config.customPrompt}
                                                        onChange={(e) => setConfig({...config, customPrompt: e.target.value})}
                                                        placeholder="e.g. 'Emphasize the new Q3 travel policy updates...'"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-700 shadow-inner focus:ring-brand focus:border-brand min-h-[100px] resize-y"
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <Clock size={16} className="text-brand"/> Target Duration
                                                    </label>
                                                    <div className="flex gap-4">
                                                        {[15, 30, 60, 90].map(secs => (
                                                            <button
                                                                key={secs}
                                                                onClick={() => setConfig({...config, duration: secs})}
                                                                className={cn(
                                                                    "px-5 py-2.5 rounded-xl border font-bold text-sm transition-all",
                                                                    config.duration === secs 
                                                                        ? "bg-brand/10 border-brand text-brand ring-1 ring-brand/20 shadow-sm"
                                                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                {secs}s
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <Monitor size={16} className="text-brand"/> Video Dimensions
                                                    </label>
                                                    <DimensionSelector 
                                                        selectedId={config.dimension} 
                                                        onSelect={(id) => setConfig({...config, dimension: id})} 
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">Choose Character / Engine</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {[
                                                            { id: 'Hyper Realistic', name: 'Hyper Realistic', badge: 'Cinematic', desc: 'A lifelike AI avatar with natural movements, skin texture, and photorealistic rendering.' },
                                                            { id: 'Infographics', name: 'Infographics', badge: 'Data-driven', desc: 'Bold animated graphics, data visuals, and motion charts to present information clearly.' }
                                                        ].map((style) => (
                                                            <div 
                                                                key={style.id}
                                                                onClick={() => setConfig({...config, style: style.id})}
                                                                className={cn(
                                                                    "p-5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden",
                                                                    config.style === style.id ? "border-brand bg-white shadow-lg shadow-brand/10 ring-1 ring-brand/10" : "border-slate-200 bg-slate-50 hover:bg-white"
                                                                )}
                                                            >
                                                                {config.style === style.id && <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-[100px] -mr-4 -mt-4" />}
                                                                <div className="flex items-center gap-3 relative z-10">
                                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.style === style.id ? "bg-brand/10 text-brand" : "bg-white text-slate-400 border border-slate-200")}>
                                                                        {style.id === 'Infographics' ? <Layout size={20} /> : <UserCheck size={20} />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="font-bold text-sm text-slate-900">{style.name}</h4>
                                                                            <span className={cn("text-[9px] font-bold uppercase py-0.5 px-2 rounded-md", config.style === style.id ? "bg-brand/10 text-brand" : "bg-slate-200 text-slate-500")}>{style.badge}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-medium relative z-10">{style.desc}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                            </motion.div>
                                        </AnimatePresence>
                                    ) : step === 2 ? (
                                        <AnimatePresence mode="wait">
                                            <motion.div 
                                                key="step2"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="space-y-6"
                                            >
                                                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="font-bold text-slate-900 text-sm">Strategic Template Definition</h3>
                                                        <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                                                            <Sparkles size={12} /> Synthesizing
                                                        </span>
                                                    </div>
                                                    <textarea
                                                        value={aiResult}
                                                        onChange={(e) => setAiResult(e.target.value)}
                                                        className="w-full h-80 bg-white border border-slate-200 rounded-xl p-5 text-slate-700 focus:outline-none focus:border-brand font-medium leading-relaxed resize-none shadow-inner text-sm"
                                                        placeholder="Waiting for AI synthesis..."
                                                    />
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    ) : null}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            {config.template && (
                                <div className="px-10 py-5 border-t border-slate-100 flex items-center justify-between bg-white z-10">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> DeptCast Engine Ready
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {step === 2 && (
                                            <Button variant="outline" onClick={() => setStep(1)} disabled={loading} className="px-6 rounded-xl font-bold">
                                                Back
                                            </Button>
                                        )}
                                        <Button 
                                            onClick={step === 1 ? handleMagic : handleFinalize}
                                            disabled={loading}
                                            className="bg-brand hover:bg-brand-600 text-white shadow-md shadow-brand/20 px-8 py-2.5 rounded-xl font-bold h-11 active:scale-95 transition-all text-sm btn-primary"
                                        >
                                            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : 
                                             step === 1 ? <Sparkles className="mr-2" size={18} /> : <CheckCircle2 className="mr-2" size={18} />}
                                            {loading ? 'Processing...' : step === 1 ? 'Execute AI Magic' : 'Confirm & Produce'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
