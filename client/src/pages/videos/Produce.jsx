import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { createProject, generateBlueprint } from '../../services/api';
import { Loader2, Sparkles, CheckCircle2, Wand2, ArrowRight, ArrowLeft, Save, Layout } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';

export const Produce = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const [masterPrompt, setMasterPrompt] = useState("");
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const initScript = async () => {
      try {
        const configStr = localStorage.getItem('deptcast_pending_config');
        if (!configStr) throw new Error("No configuration found. Please start over.");
        
        const parsedConfig = JSON.parse(configStr);
        setConfig(parsedConfig);
        
        // Fetch the AI generated master prompt based on config
        const result = await generateBlueprint({
            department: parsedConfig.department,
            templateId: parsedConfig.templateId,
            style: parsedConfig.style,
            dimension: parsedConfig.dimension,
            additionalPrompt: parsedConfig.additionalPrompt
        });
        
        setMasterPrompt(result.blueprint || result.prompt || "Strategic AI Blueprint failed to load. Please write your prompt here.");
      } catch (err) {
        console.error("AI Magic failed:", err);
        // Fallback
        setMasterPrompt("Error synthesizing master prompt. You can write your instructions manually here.");
      } finally {
        setLoading(false);
      }
    };

    initScript();
  }, []);

  const handleCreateVideo = async () => {
      if(!config) return;
      setGenerating(true);
      try {
          // Construct the final prompt matching Sora format if needed
          const finalPrompt = `[Style: ${config.style}, Ratio: ${config.dimension}]\n\n${masterPrompt}`;
          
          const finalConfig = {
              ...config,
              additionalPrompt: finalPrompt,
          };
          
          const result = await createProject(finalConfig);
          const projectId = result.project?._id || result.project?.id;

          if (projectId) {
              try {
                  const { generateVideo: triggerGeneration } = await import('../../services/api');
                  await triggerGeneration(projectId);
              } catch (genErr) {
                  console.warn("Auto-generation trigger failed:", genErr);
              }

              localStorage.removeItem('deptcast_pending_config');
              setLocation(`/videos/${projectId}`);
          } else {
              throw new Error("Invalid response from server");
          }
      } catch (err) {
          console.error(err);
          const errorData = err.response?.data;
          if (errorData?.code === 'CREDITS_EXHAUSTED' || errorData?.status === 402) {
            setError("Strategic Quota Exceeded: Your enterprise credit allocation has been reached. Please contact administration.");
          } else {
            setError("Blueprint Execution Interrupted. Ensure connectivity and check project parameters.");
          }
          setGenerating(false);
      }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-lg mx-auto space-y-12 relative px-6">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-blue-50/40 blur-[120px] rounded-full pointer-events-none -z-10" />
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="absolute inset-x-[-20%] inset-y-[-20%] bg-brand/10 blur-3xl rounded-full" />
          <div className="relative bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-brand/5 ring-1 ring-slate-100">
            <Sparkles className="h-16 w-16 text-brand" />
          </div>
        </motion.div>
        <div className="space-y-4 w-full">
            <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">AI Magic in Progress</h2>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand animate-pulse">Drafting Strategic Blueprint...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto space-y-6">
        <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
          <CheckCircle2 className="h-10 w-10 text-red-500" />
        </div>
        <div className="space-y-2">
            <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Production Interrupted</h2>
            <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
        </div>
        <button 
          onClick={() => setLocation('/videos/new')}
          className="mt-4 px-8 py-3 bg-white border border-slate-200 hover:border-brand hover:text-brand rounded-2xl transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
        >
          Return to Studio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-32 font-sans text-slate-800">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-blue-50/50 blur-[150px] rounded-[100%] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mt-10 relative z-10 gap-6"
      >
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setLocation('/videos/new')}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-400 hover:text-brand transition-all shadow-sm border border-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 2: AI Magic</span>
            </div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Review Strategic Blueprint</h1>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm relative z-20 flex flex-col h-[600px] overflow-hidden">
            
            {/* Editor Top Bar */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                        <Layout className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-900">Strategic Blueprint</h3>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Creative Direction Setup</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 shadow-sm">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Saved
                    </span>
                </div>
            </div>

            {/* Editing Area */}
            <div className="flex-1 p-6 bg-slate-50/30">
                <textarea
                    value={masterPrompt}
                    onChange={(e) => setMasterPrompt(e.target.value)}
                    className="w-full h-full bg-white border border-slate-200 rounded-xl p-6 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none font-medium leading-relaxed text-base shadow-inner"
                    placeholder="Describe your video's visual trajectory here..."
                />
            </div>
            
            {/* Config Info Bar */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">

                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Style</span>
                        <span className="text-sm font-semibold text-slate-700">{config?.style || 'Hyper-Realistic'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Duration</span>
                        <span className="text-sm font-semibold text-slate-700">{config?.targetDuration || '16'}s</span>
                    </div>
                </div>
                
                <Button 
                    size="lg"
                    onClick={handleCreateVideo}
                    disabled={generating || !masterPrompt}
                    className="bg-brand text-white shadow-md active:scale-95 border-none font-bold text-sm rounded-xl px-8 h-12 btn-primary"
                >
                    {generating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {generating ? 'Submitting to Sora...' : 'Submit & Generate'}
                </Button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
