import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { createProject } from '../../services/api';
import { AvatarSelector } from '../../components/features/AvatarSelector';
import { VoiceSelector } from '../../components/features/VoiceSelector';
import { DimensionSelector } from '../../components/features/DimensionSelector';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Loader2, Wand2, ArrowLeft, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';

const DEPARTMENTS = [
  { id: 'hr', name: 'Human Resources' },
  { id: 'it', name: 'IT Support' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'operations', name: 'Operations' },
];

export const NewVideoWizard = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  
  const [config, setConfig] = useState({
    department: 'marketing',
    avatar: 'alex',
    voice: 'v_american_m',
    dimension: '16:9',
    targetDuration: 8,
    prompt: ''
  });

  useEffect(() => {
    // Pre-fill department if navigated from Home Dashboard
    const dept = localStorage.getItem('deptcast_current_dept');
    if (dept) {
      setConfig(prev => ({ ...prev, department: dept }));
    }
  }, []);

  const handleGenerate = async () => {
    if (!config.prompt.trim()) return;
    
    setLoading(true);
    // Move to Produce state (loading/animation page)
    // We will save temp state to localstorage for Produce page to pick up
    localStorage.setItem('deptcast_pending_config', JSON.stringify(config));
    setLocation('/videos/produce/new');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setLocation('/')}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Create New Video</h1>
          <p className="text-gray-400">Configure your AI avatar and script generation parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Main Configuration Card */}
        <Card animate className="border-t-4 border-t-brand">
          <CardContent className="p-8 space-y-12">
            
            {/* Department Context */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand mb-2">
                <Settings2 className="h-5 w-5" />
                <h2 className="text-xl font-heading font-bold text-white">1. Core Context</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Department Topic</label>
                <select 
                  value={config.department}
                  onChange={(e) => setConfig({ ...config, department: e.target.value })}
                  className="w-full md:w-1/2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                >
                  {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            {/* Visual Avatar */}
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-brand mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand/20 text-xs font-bold">2</span>
                <h2 className="text-xl font-heading font-bold text-white">Visual & Audio</h2>
              </div>
              <AvatarSelector 
                selectedId={config.avatar} 
                onSelect={(id) => setConfig({ ...config, avatar: id })} 
              />
            </div>

            {/* Voice Profile */}
            <div className="pt-2 border-white/5">
              <VoiceSelector 
                selectedId={config.voice} 
                onSelect={(id) => setConfig({ ...config, voice: id })} 
              />
            </div>

            {/* Dimensions */}
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-brand mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand/20 text-xs font-bold">3</span>
                <h2 className="text-xl font-heading font-bold text-white">Formatting</h2>
              </div>
              <DimensionSelector 
                selectedId={config.dimension} 
                onSelect={(id) => setConfig({ ...config, dimension: id })} 
              />
            </div>

            {/* Duration */}
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-brand mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand/20 text-xs font-bold">4</span>
                <h2 className="text-xl font-heading font-bold text-white">Target Duration</h2>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-3">Choose the continuous playback length for your generated master video.</p>
                <select 
                  value={config.targetDuration}
                  onChange={(e) => setConfig({ ...config, targetDuration: parseInt(e.target.value) })}
                  className="w-full md:w-1/2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                >
                  <option value={8}>8 Seconds (Base Clip)</option>
                  <option value={15}>15 Seconds (Base + 1 Extension)</option>
                  <option value={22}>22 Seconds (Base + 2 Extensions)</option>
                  <option value={29}>29 Seconds (Base + 3 Extensions)</option>
                </select>
                <p className="text-xs text-brand/60 mt-2">Note: Longer durations require multiple API extension calls, charging more credits.</p>
              </div>
            </div>

            {/* Source Content / Prompt */}
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-brand mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand/20 text-xs font-bold">5</span>
                <h2 className="text-xl font-heading font-bold text-white">Source Script or Idea</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">What should this video be about?</label>
                <textarea 
                  value={config.prompt}
                  onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                  placeholder="e.g. A fast-paced policy update regarding the new Q4 Security guidelines..."
                  className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition-all"
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Action Bottom Bar */}
        <div className="flex justify-end sticky bottom-6 z-40 bg-darker/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
          <Button 
            size="lg" 
            onClick={handleGenerate} 
            disabled={loading || !config.prompt.trim()}
            className="w-full md:w-auto px-12"
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Wand2 className="mr-2 h-5 w-5" />}
            {loading ? 'Initializing Engine...' : 'Generate AI Script & Plan'}
          </Button>
        </div>

      </div>
    </div>
  );
};
