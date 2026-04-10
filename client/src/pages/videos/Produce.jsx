import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { createProject } from '../../services/api';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_STEPS = [
  "Synthesizing Master Blueprint...",
  "Synchronizing Strategic Intent...",
  "Compiling Visual Assets...",
  "Executing Render Protocol...",
  "Finalizing Production Masterpiece..."
];

export const Produce = () => {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cycle through professional milestones
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);

    const generate = async () => {
      try {
        const configStr = localStorage.getItem('deptcast_pending_config');
        if (!configStr) throw new Error("No configuration found. Please start over.");
        
        const config = JSON.parse(configStr);
        // Backend handles the blueprint execution silently
        const result = await createProject(config);
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
      }
    };

    generate();

    return () => clearInterval(stepInterval);
  }, [setLocation]);

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
          className="mt-4 px-8 py-3 bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-sm"
        >
          Return to Studio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-lg mx-auto space-y-12 relative px-6">
      
      {/* Background Ambience */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-indigo-50/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div className="absolute inset-x-[-20%] inset-y-[-20%] bg-indigo-600/10 blur-3xl rounded-full" />
        <div className="relative bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-indigo-600/5 ring-1 ring-slate-100">
          <Sparkles className="h-20 w-20 text-indigo-600" />
        </div>
      </motion.div>

      <div className="space-y-6 w-full">
        <div className="space-y-2">
            <h2 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Executing Strategic Blueprint</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Advanced AI Synthesis in Progress</p>
        </div>
        
        <div className="h-16 relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.p
              key={currentStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-indigo-600 text-lg font-black absolute w-full text-center"
            >
              {LOADING_STEPS[currentStep]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="max-w-xs mx-auto space-y-4">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 p-0.5">
              <motion.div 
                className="h-full bg-indigo-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Efficiency Optimized for Enterprise</p>
        </div>
      </div>
    </div>
  );
};
