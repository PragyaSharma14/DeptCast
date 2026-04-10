import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { getWizardBootstrap, createProject, generateBlueprint } from '../../services/api';
import { DimensionSelector } from '../../components/features/DimensionSelector';
import { Button } from '../../components/ui/Button';
import { Loader2, ArrowRight, ArrowLeft, Wand2, Building2, Presentation, Sparkles, Clapperboard, PenTool, CheckCircle2, Layout, Sliders, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const NewVideoWizard = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  
  // High-performance data cache
  const [bootstrapData, setBootstrapData] = useState([]);
  
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [config, setConfig] = useState({
    sector: '',
    department: '',
    templateId: '',
    style: 'Cinematic',
    dimension: '16:9',
    targetDuration: 16,
    additionalPrompt: ''
  });

  // Optimized Bootstrap Fetch
  useEffect(() => {
    getWizardBootstrap()
      .then(data => {
        setBootstrapData(data);
        if (data.length > 0) {
          const firstSector = data[0];
          setSelectedSectorId(firstSector.id);
          const firstDept = firstSector.departments[0];
          
          setConfig(prev => ({ 
            ...prev, 
            sector: firstSector.name,
            department: firstDept?.key || '',
            templateId: firstDept?.templates[0]?.id || ''
          }));
        }
      })
      .catch(err => console.error("Bootstrap failed:", err))
      .finally(() => setInitLoading(false));
  }, []);

  // Derived State (Instant - No Round Trips)
  const currentSector = bootstrapData.find(s => s.id === selectedSectorId);
  const departments = currentSector?.departments || [];
  const currentDepartment = departments.find(d => d.key === config.department);
  const templates = currentDepartment?.templates || [];
  const selectedTemplate = templates.find(t => t.id === config.templateId);

  const handleSectorChange = (sector) => {
    setSelectedSectorId(sector.id);
    const firstDept = sector.departments[0];
    setConfig(prev => ({
      ...prev,
      sector: sector.name,
      department: firstDept?.key || '',
      templateId: firstDept?.templates[0]?.id || ''
    }));
  };

  const handleDeptChange = (dept) => {
    setConfig(prev => ({
      ...prev,
      department: dept.key,
      templateId: dept.templates[0]?.id || ''
    }));
  };

  const handleGenerate = async () => {
    if (!config.templateId) return alert("Please select a valid blueprint.");
    setLoading(true);
    localStorage.setItem('deptcast_pending_config', JSON.stringify(config));
    setLocation('/videos/produce/new');
  };

  const handleSynthesize = async () => {
    if (!config.templateId) return alert("Please select a sector and department first.");
    setSynthesizing(true);
    try {
        const result = await generateBlueprint({
            department: config.department,
            templateId: config.templateId,
            style: config.style,
            additionalPrompt: config.additionalPrompt
        });
        setConfig(prev => ({ ...prev, additionalPrompt: result.blueprint }));
    } catch (err) {
        console.error("Blueprint synthesis failed:", err);
        alert("Strategic synthesis engine timed out. Please try again.");
    } finally {
        setSynthesizing(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="relative">
              <div className="absolute inset-x-[-50%] inset-y-[-50%] bg-indigo-600/10 blur-3xl rounded-full" />
              <Loader2 className="animate-spin h-12 w-12 text-indigo-600 relative z-10" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Production Assets</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-32 font-sans text-slate-800">
      
      {/* Background Atmosphere - Light & Airy */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-indigo-50/50 blur-[150px] rounded-[100%] pointer-events-none -z-10" />

      {/* Header - Executive Control */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-12 sm:mt-10 relative z-10 gap-6"
      >
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setLocation('/')}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <Layout className="h-4 w-4 text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Production Studio</span>
            </div>
            <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Setup Production Blueprint</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex -space-x-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                        {s}
                    </div>
                ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 lg:block hidden">Creative Configuration</span>
        </div>
      </motion.div>

      <div className="space-y-12">

        {/* 1. Foundation Selection Table */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-6 pl-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-600/20">1</div>
              <h2 className="text-2xl font-heading font-black text-slate-900">Configure Market & Department</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl relative z-20">
                
                {/* 1. Sectors Pane (Industry) */}
                <div className="lg:col-span-3 border-r border-slate-100 flex flex-col bg-slate-50/50">
                    <div className="p-5 border-b border-slate-100 bg-white/50">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">1. Industry Sector</span>
                    </div>
                    <div className="overflow-y-auto stealth-scrollbar p-3 space-y-1.5 h-[500px] pb-48">
                        {bootstrapData.map(sector => (
                            <button
                                key={sector.id}
                                onClick={() => handleSectorChange(sector)}
                                className={cn(
                                    "w-full px-4 py-3.5 rounded-2xl text-left transition-all duration-200 text-xs font-bold group relative",
                                    selectedSectorId === sector.id 
                                        ? "bg-white text-indigo-600 shadow-md ring-1 ring-slate-200" 
                                        : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
                                )}
                            >
                                {selectedSectorId === sector.id && (
                                    <motion.div layoutId="sector-pip" className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-full" />
                                )}
                                {sector.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Departments Pane (Internal Units) */}
                <div className="lg:col-span-3 border-r border-slate-100 flex flex-col bg-slate-50/30">
                    <div className="p-5 border-b border-slate-100 bg-white/50 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">2. Target Department</span>
                        {departments.length > 0 && <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{departments.length}</span>}
                    </div>
                    <div className="overflow-y-auto stealth-scrollbar p-3 space-y-1.5 h-[500px] pb-48">
                        {departments.map(dept => (
                            <button
                                key={dept.key}
                                onClick={() => handleDeptChange(dept)}
                                className={cn(
                                    "w-full px-4 py-3.5 rounded-2xl text-left transition-all duration-200 group relative flex items-center gap-3",
                                    config.department === dept.key 
                                        ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200" 
                                        : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
                                )}
                            >
                                <div className={cn("p-1.5 rounded-lg transition-colors", config.department === dept.key ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-300 opacity-50")}>
                                    <Building2 className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold truncate uppercase tracking-widest">{dept.name}</span>
                                {config.department === dept.key && (
                                    <div className="ml-auto">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Templates Pane (Master Blueprints) */}
                <div className="lg:col-span-6 flex flex-col bg-white">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">3. Core Blueprint Selection</span>
                        <div className="flex items-center gap-2">
                             <Sparkles className="w-3 h-3 text-indigo-500" />
                             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">AI Trained Logic</span>
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto stealth-scrollbar p-6 h-[500px] pb-48">
                        {templates.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest">Select a department above...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
                                {templates.map((tpl, i) => (
                                    <motion.button 
                                      key={tpl.id}
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: i * 0.03 }}
                                      onClick={() => setConfig({...config, templateId: tpl.id})}
                                      className={cn(
                                          "relative flex flex-col p-6 rounded-3xl border transition-all duration-300 text-left group hover:-translate-y-1 h-full",
                                          config.templateId === tpl.id 
                                            ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-200 shadow-lg shadow-indigo-600/5"
                                            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 shadow-sm"
                                      )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center mb-5 transition-colors shrink-0",
                                            config.templateId === tpl.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-100 text-slate-400"
                                        )}>
                                            <Presentation className="h-5 w-5" />
                                        </div>
                                        <h4 className={cn("text-base font-black mb-1.5 tracking-tight transition-colors", config.templateId === tpl.id ? "text-indigo-600" : "text-slate-900")}>{tpl.title}</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                                            {tpl.keyPoints ? JSON.parse(tpl.keyPoints).join(' • ') : "Strategic corporate blueprint"}
                                        </p>

                                        {config.templateId === tpl.id && (
                                            <div className="absolute top-6 right-6 text-indigo-600">
                                                <div className="bg-white rounded-full p-0.5 shadow-sm">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>

        {/* 2. Visual Engine Config */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-6 pl-2 mt-8">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-600/20">2</div>
              <h2 className="text-2xl font-heading font-black text-slate-900">Visual Engine Styling</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                 <button 
                     onClick={() => setConfig({...config, style: 'Cinematic'})}
                     className={cn(
                         "relative flex flex-col p-10 rounded-[3rem] border transition-all duration-500 text-left overflow-hidden group hover:-translate-y-2 shadow-xl",
                         config.style === 'Cinematic' 
                         ? "border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-100 shadow-2xl shadow-indigo-600/10" 
                         : "border-slate-200 bg-white grayscale hover:grayscale-0"
                     )}
                 >
                     <div className="absolute inset-0 z-0">
                          <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Cinematic" className={cn(
                              "w-full h-full object-cover transition-transform duration-1000", 
                              config.style === 'Cinematic' ? "opacity-20 scale-110" : "opacity-0 group-hover:opacity-10"
                          )} />
                     </div>
                     <div className="relative z-10 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-8">
                            <div className={cn("p-5 rounded-[1.5rem] shadow-sm flex items-center justify-center", config.style === 'Cinematic' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}>
                                <Clapperboard size={32} />
                            </div>
                            {config.style === 'Cinematic' && <div className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg shadow-indigo-600/20">Active Engine</div>}
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 mb-3">High-Fidelity Cinematic</h3>
                         <p className="text-slate-500 leading-relaxed font-medium">Deep rendering pipeline optimized for photorealistic humans, anamorphic lighting, and premium corporate depth.</p>
                     </div>
                 </button>
                 
                 <button 
                     onClick={() => setConfig({...config, style: 'Infographic'})}
                     className={cn(
                         "relative flex flex-col p-10 rounded-[3rem] border transition-all duration-500 text-left overflow-hidden group hover:-translate-y-2 shadow-xl",
                         config.style === 'Infographic' 
                         ? "border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-100 shadow-2xl shadow-emerald-600/10" 
                         : "border-slate-200 bg-white grayscale hover:grayscale-0"
                     )}
                 >
                     <div className="absolute inset-0 z-0">
                          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Infographics" className={cn(
                              "w-full h-full object-cover transition-transform duration-1000", 
                              config.style === 'Infographic' ? "opacity-20 scale-110" : "opacity-0 group-hover:opacity-10"
                          )} />
                     </div>
                     <div className="relative z-10 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-8">
                            <div className={cn("p-5 rounded-[1.5rem] shadow-sm flex items-center justify-center", config.style === 'Infographic' ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}>
                                <PenTool size={32} />
                            </div>
                            {config.style === 'Infographic' && <div className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg shadow-emerald-600/20">Active Engine</div>}
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 mb-3">2D Motion Graphics</h3>
                         <p className="text-slate-500 leading-relaxed font-medium">Stylized typography, crisp flat vectors, and isometric movements perfectly suited for data-heavy announcements.</p>
                     </div>
                 </button>
            </div>
        </motion.div>

        {/* 3. Global Context & Precision Control */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-3 mb-6 pl-2 mt-12">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-600/20">3</div>
              <h2 className="text-2xl font-heading font-black text-slate-900">Directorial Overrides</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Override Editor */}
                <div className="lg:col-span-2 relative group p-1.5 rounded-[2.5rem] bg-slate-100 border border-slate-200 shadow-sm">
                  <div className="bg-white rounded-[2rem] overflow-hidden flex flex-col h-full border border-slate-200">
                      <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                          <div className="flex items-center gap-2">
                              <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                              </div>
                              <span className="ml-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">AI Production Protocol</span>
                          </div>
                          <button 
                            onClick={handleSynthesize}
                            disabled={synthesizing || !config.templateId}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                             {synthesizing ? <Loader2 className="animate-spin h-3 w-3" /> : <Sparkles className="h-3 w-3 group-hover:animate-pulse" />}
                             {synthesizing ? "Synthesizing..." : "Synthesize AI Blueprint"}
                          </button>
                      </div>
                      <textarea 
                          value={config.additionalPrompt}
                          onChange={(e) => setConfig({ ...config, additionalPrompt: e.target.value })}
                          placeholder="Inject specific details to override master defaults... (e.g. 'Emphasize reliability and use a corporate blue palette')"
                          className="w-full h-56 bg-white p-8 text-slate-900 focus:outline-none resize-none transition-all placeholder:text-slate-300 font-bold text-lg leading-relaxed selection:bg-indigo-100"
                          spellCheck="false"
                      />
                  </div>
                </div>

                {/* Sizing & Intensity */}
                <div className="space-y-8">
                   <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-3xl rounded-full opacity-50" />
                       
                       <div className="relative z-10 w-full mb-8">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Screen Dimensions</p>
                           <DimensionSelector 
                               selectedId={config.dimension} 
                               onSelect={(id) => setConfig({ ...config, dimension: id })} 
                           />
                       </div>

                       <div className="relative z-10 w-full border-t border-slate-100 pt-8 mt-auto">
                           <label className="block text-[10px] font-black text-slate-400 mb-4 tracking-[0.2em] uppercase">Targeted Rendering Length</label>
                           <div className="relative">
                               <select 
                                   value={config.targetDuration}
                                   onChange={(e) => setConfig({ ...config, targetDuration: parseInt(e.target.value) })}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] px-5 py-4 text-slate-900 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-black text-sm tracking-wide shadow-sm cursor-pointer"
                               >
                                   <option value={8}>8 Seconds (Focused)</option>
                                   <option value={16}>16 Seconds (Standard Execution)</option>
                                   <option value={20}>20 Seconds (Extended High-Impact)</option>
                               </select>
                               <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                   <ChevronDown size={18} />
                               </div>
                           </div>
                           <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-5 leading-relaxed flex items-center gap-2">
                               <Sparkles className="h-3 w-3 text-amber-400" />
                               Extended durations require <span className="text-slate-900">x2 compute cycle credits.</span>
                           </p>
                       </div>
                   </div>
                </div>

            </div>
        </motion.div>

        {/* Executive Action Deck */}
        <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6 pointer-events-none"
        >
            <div className="bg-white/95 backdrop-blur-3xl p-3.5 rounded-[3rem] border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex items-center justify-between pr-3.5 pl-10 overflow-hidden relative pointer-events-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-transparent pointer-events-none" />
                
                <div className="flex flex-col mr-8 z-10 py-1">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-0.5">Final Blueprint</span>
                    <span className="text-sm text-slate-900 font-black truncate max-w-[240px]">
                        {selectedTemplate ? selectedTemplate.title : "Assemble Strategic Blueprint"}
                    </span>
                </div>
                
                <Button 
                    size="lg" 
                    onClick={handleGenerate} 
                    disabled={loading || !config.templateId}
                    className="relative px-11 rounded-full bg-indigo-600 text-white hover:bg-black hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 z-10 border-none font-black text-sm tracking-widest uppercase py-7 h-auto"
                >
                    {loading ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <Wand2 className="mr-3 h-5 w-5" />}
                    {loading ? 'Initializing Render...' : 'Generate Masterpiece'}
                </Button>
            </div>
        </motion.div>

      </div>
    </div>
  );
};
