import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { createProject } from '../../services/api';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_STEPS = [
  "Analyzing context and intent...",
  "Applying department persona...",
  "Structuring script layout...",
  "Generating visual AI scenes...",
  "Finalizing production plan..."
];

export const Produce = () => {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cycle through loading messages purely for UX "magic"
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    const generate = async () => {
      try {
        const configStr = localStorage.getItem('deptcast_pending_config');
        if (!configStr) throw new Error("No configuration found. Please start over.");
        
        const config = JSON.parse(configStr);
        // This leverages the existing backend logic cleanly
        const result = await createProject(config);
        const projectId = result.project?._id || result.project?.id;

        if (projectId) {
            // PRODUCTION LEVEL: Automatically trigger the Sora generation so the user doesn't have to manually click "Compile"
            try {
                // We import and use generateVideo from api.js (it was already imported but check name)
                const { generateVideo: triggerGeneration } = await import('../../services/api');
                await triggerGeneration(projectId);
            } catch (genErr) {
                console.warn("Auto-generation trigger failed, user can still start it manually from the detail page:", genErr);
            }

            // Clear temp storage
            localStorage.removeItem('deptcast_pending_config');
            
            // Go straight to the Video Detail/Player page
            setLocation(`/videos/${projectId}`);
        } else {
            throw new Error("Invalid response from server");
        }
      } catch (err) {
        console.error(err);
        const errorData = err.response?.data;
        if (errorData?.code === 'CREDITS_EXHAUSTED' || errorData?.status === 402) {
          setError("Insufficient AI Credits: Your API quota has been reached. Please top up your credits to continue production.");
        } else {
          setError("AI Script Engine failed to process the request. Ensure backend is running and you have enough credits.");
        }
      }
    };

    generate();

    return () => clearInterval(stepInterval);
  }, [setLocation]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-4">
        <div className="bg-red-500/10 p-4 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold">Failed to Generate</h2>
        <p className="text-gray-400">{error}</p>
        <button 
          onClick={() => setLocation('/videos/new')}
          className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto space-y-8">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-brand/30 blur-3xl rounded-full scale-150" />
        <div className="relative bg-darker p-6 rounded-3xl border border-white/10 shadow-[0_0_40px_var(--color-brand-glow)]">
          <Sparkles className="h-16 w-16 text-brand" />
        </div>
      </motion.div>

      <div className="space-y-4 w-full">
        <h2 className="text-3xl font-heading font-bold text-white">Generating Magic</h2>
        
        <div className="h-12 relative overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.p
              key={currentStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400 font-medium absolute w-full text-center"
            >
              {LOADING_STEPS[currentStep]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-brand to-purple-400"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};
