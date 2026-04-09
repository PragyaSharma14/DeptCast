import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { getDepartments, getTemplatesByDepartment } from '../../services/api';
import { DimensionSelector } from '../../components/features/DimensionSelector';
import { Button } from '../../components/ui/Button';
import { Loader2, ArrowRight, ArrowLeft, Wand2, Building2, Presentation, Sparkles, Clapperboard, PenTool, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const NewVideoWizard = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  const [config, setConfig] = useState({
    sector: '',
    department: '',
    templateId: '',
    style: 'Cinematic',
    dimension: '16:9',
    targetDuration: 16,
    additionalPrompt: ''
  });

  useEffect(() => {
    import('../../services/api').then(api => {
      api.getSectors().then(data => {
        setSectors(data);
        if (data.length > 0) {
          setSelectedSectorId(data[0].id);
          setConfig(prev => ({ ...prev, sector: data[0].name }));
        }
      });
    });
  }, []);

  useEffect(() => {
    if (selectedSectorId) {
      import('../../services/api').then(api => {
        api.getDepartmentsBySector(selectedSectorId).then(data => {
          setDepartments(data);
          // If current dept is not in the new sector list, reset it
          if (data.length > 0) {
            setConfig(prev => ({ ...prev, department: data[0].key }));
          }
        });
      });
    }
  }, [selectedSectorId]);

  useEffect(() => {
    if (config.department) {
        const deptId = departments.find(d => d.key === config.department)?.id;
        if (deptId) {
            getTemplatesByDepartment(deptId).then(data => {
                setTemplates(data);
                // Auto-select first template for faster flow
                if (data.length > 0 && !config.templateId) {
                   setConfig(prev => ({ ...prev, templateId: data[0].id }));
                }
            }).catch(console.error);
        }
    }
  }, [config.department, departments]);

  const handleGenerate = async () => {
    if (!config.templateId) return alert("Please select a valid blueprint.");
    setLoading(true);
    localStorage.setItem('deptcast_pending_config', JSON.stringify(config));
    setLocation('/videos/produce/new');
  };

  const selectedTemplate = templates.find(t => t.id === config.templateId);

  return (
    <div className="max-w-6xl mx-auto pb-24 font-sans text-gray-100">
      
      {/* Premium Gradient Background Blur */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-brand/20 blur-[150px] rounded-[100%] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-12 sm:mt-8 relative z-10"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLocation('/')}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-gray-400 hover:text-white transition-all shadow-lg border border-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">Create AI Studio Master</h1>
            <p className="text-gray-400 mt-1">Design department-specific video communications implicitly powered by AutoGen & Sora.</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-10">

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-4 pl-2">
              <div className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold">1</div>
              <h2 className="text-2xl font-heading font-semibold text-white">Select Your Foundation</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative z-20 mb-32">
                
                {/* 1. Sectors Pane (Industry) */}
                <div className="lg:col-span-2 border-r border-white/5 flex flex-col bg-black/20">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">1. Sector</span>
                    </div>
                    <div className="overflow-y-auto stealth-scrollbar p-2 space-y-1 h-[500px] pb-48">
                        {sectors.map(sector => (
                            <button
                                key={sector.id}
                                onClick={() => setSelectedSectorId(sector.id)}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl text-left transition-all duration-200 text-xs font-medium group relative",
                                    selectedSectorId === sector.id 
                                        ? "bg-brand/10 text-white" 
                                        : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                                )}
                            >
                                {selectedSectorId === sector.id && (
                                    <motion.div layoutId="sector-pip" className="absolute left-0 top-2 bottom-2 w-0.5 bg-brand rounded-full" />
                                )}
                                {sector.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Departments Pane (Internal Units) */}
                <div className="lg:col-span-3 border-r border-white/5 flex flex-col bg-black/10">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">2. Department</span>
                        {departments.length > 0 && <span className="text-[10px] bg-white/5 px-1.5 rounded opacity-40">{departments.length}</span>}
                    </div>
                    <div className="overflow-y-auto stealth-scrollbar p-2 space-y-1 h-[500px] pb-48">
                        {departments.map(dept => (
                            <button
                                key={dept.key}
                                onClick={() => setConfig({...config, department: dept.key, templateId: ''})}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl text-left transition-all duration-200 group relative flex items-center gap-3",
                                    config.department === dept.key 
                                        ? "bg-white/10 text-white shadow-inner" 
                                        : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                                )}
                            >
                                <Building2 className={cn("w-4 h-4 shrink-0", config.department === dept.key ? "text-brand" : "opacity-20")} />
                                <span className="text-xs font-semibold truncate uppercase tracking-wider">{dept.name}</span>
                                {config.department === dept.key && (
                                    <div className="ml-auto">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(170,59,255,0.8)]" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Templates Pane (Blueprints) */}
                <div className="lg:col-span-7 flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">3. Production Blueprint</span>
                        <div className="flex items-center gap-2">
                             <Sparkles className="w-3 h-3 text-brand" />
                             <span className="text-[10px] text-gray-400 font-medium">AI Trained Models</span>
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto stealth-scrollbar p-6 h-[500px] pb-48">
                        {templates.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <Loader2 className="animate-spin h-8 w-8 text-brand opacity-50" />
                                </div>
                                <p className="text-sm font-medium">Syncing specialized blueprints...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
                                {templates.map((tpl, i) => (
                                    <motion.button 
                                      key={tpl.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.03 }}
                                      onClick={() => setConfig({...config, templateId: tpl.id})}
                                      className={cn(
                                          "relative flex flex-col p-5 rounded-2xl border transition-all duration-300 text-left group bg-white/5 hover:-translate-y-1 shadow-xl h-full",
                                          config.templateId === tpl.id 
                                            ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30"
                                            : "border-white/5 hover:border-white/20"
                                      )}
                                    >
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center mb-4 transition-colors shrink-0",
                                            config.templateId === tpl.id ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-500"
                                        )}>
                                            <Presentation className="h-4 w-4" />
                                        </div>
                                        <h4 className={cn("text-base font-bold mb-1 tracking-tight", config.templateId === tpl.id ? "text-blue-100" : "text-gray-200")}>{tpl.title}</h4>
                                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2">
                                            {JSON.parse(tpl.keyPoints).join(' • ')}
                                        </p>

                                        {config.templateId === tpl.id && (
                                            <div className="absolute top-4 right-4 text-blue-400">
                                                <CheckCircle2 className="h-4 w-4" />
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

        {/* Visual Engine Config */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-4 pl-2 mt-8">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">2</div>
              <h2 className="text-2xl font-heading font-semibold text-white">Visual Engine Styling</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                 <button 
                     onClick={() => setConfig({...config, style: 'Cinematic'})}
                     className={cn(
                         "relative flex flex-col p-8 rounded-3xl border transition-all duration-500 text-left overflow-hidden group hover:-translate-y-1 shadow-2xl",
                         config.style === 'Cinematic' 
                         ? "border-purple-400 ring-2 ring-purple-400/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]" 
                         : "border-white/5 hover:border-white/20 filter grayscale hover:grayscale-0"
                     )}
                 >
                     <div className="absolute inset-0 z-0">
                         <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Cinematic" className={cn(
                             "w-full h-full object-cover transition-transform duration-700", 
                             config.style === 'Cinematic' ? "opacity-[0.15] scale-105" : "opacity-[0.03] group-hover:opacity-10 group-hover:scale-105"
                         )} />
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black z-0 rounded-3xl" />

                     <div className="relative z-10 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-4 rounded-2xl backdrop-blur-md border", config.style === 'Cinematic' ? "bg-purple-500/20 text-purple-300 border-purple-500/50" : "bg-white/5 border-white/5 text-gray-400")}>
                                <Clapperboard className="w-8 h-8" />
                            </div>
                            {config.style === 'Cinematic' && <div className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold uppercase rounded-full tracking-widest border border-purple-500/30">Active Engine</div>}
                         </div>
                         <h3 className="text-2xl font-bold text-white mb-2">High-Fidelity Cinematic</h3>
                         <p className="text-gray-300 leading-relaxed max-w-sm">Deep rendering pipeline optimized for hyper-realism, photorealistic humans, anamorphic lighting, and premium corporate messaging depth.</p>
                     </div>
                 </button>
                 
                 <button 
                     onClick={() => setConfig({...config, style: 'Infographic'})}
                     className={cn(
                         "relative flex flex-col p-8 rounded-3xl border transition-all duration-500 text-left overflow-hidden group hover:-translate-y-1 shadow-2xl",
                         config.style === 'Infographic' 
                         ? "border-emerald-400 ring-2 ring-emerald-400/30 shadow-[0_0_40px_rgba(52,211,153,0.2)]" 
                         : "border-white/5 hover:border-white/20 filter grayscale hover:grayscale-0"
                     )}
                 >
                     <div className="absolute inset-0 z-0">
                         <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Infographics" className={cn(
                             "w-full h-full object-cover transition-transform duration-700", 
                             config.style === 'Infographic' ? "opacity-[0.25] scale-105 mix-blend-color-dodge" : "opacity-[0.05] group-hover:opacity-10 group-hover:scale-105"
                         )} />
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/90 to-black z-0 rounded-3xl" />

                     <div className="relative z-10 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-4 rounded-2xl backdrop-blur-md border", config.style === 'Infographic' ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : "bg-white/5 border-white/5 text-gray-400")}>
                                <PenTool className="w-8 h-8" />
                            </div>
                            {config.style === 'Infographic' && <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase rounded-full tracking-widest border border-emerald-500/30">Active Engine</div>}
                         </div>
                         <h3 className="text-2xl font-bold text-white mb-2">2D Motion Graphics Layout</h3>
                         <p className="text-gray-300 leading-relaxed max-w-sm">Generates beautifully stylized typography, crisp flat vectors, and isometric layout movements perfectly suited for data-heavy announcements.</p>
                     </div>
                 </button>
            </div>
        </motion.div>

        {/* User Context & Sizing */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-3 mb-4 pl-2 mt-8">
              <div className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold">3</div>
              <h2 className="text-2xl font-heading font-semibold text-white">Directorial Overrides <span className="opacity-50 text-sm font-normal ml-2">(Optional)</span></h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 relative group p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent">
                  <div className="bg-black border border-white/5 rounded-[22px] overflow-hidden flex flex-col h-full">
                      <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                              <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                              </div>
                              <span className="ml-3 text-xs font-mono text-gray-500 uppercase tracking-widest leading-none">AI Prompt Extension</span>
                          </div>
                      </div>
                      <textarea 
                          value={config.additionalPrompt}
                          onChange={(e) => setConfig({ ...config, additionalPrompt: e.target.value })}
                          placeholder="Type any specific details you want the AI to include, overriding the template defaults... (e.g. 'Must specifically mention John from accounting and use a bright red color palette.')"
                          className="w-full h-40 bg-transparent p-6 text-gray-100 focus:outline-none resize-none transition-all placeholder:text-gray-600/70 font-mono text-sm leading-relaxed"
                          spellCheck="false"
                      />
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="p-6 rounded-3xl bg-black border border-white/5 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between max-h-[450px] overflow-y-auto stealth-scrollbar">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl rounded-full" />
                       <div className="relative z-10 w-full mb-4">
                           <DimensionSelector 
                               selectedId={config.dimension} 
                               onSelect={(id) => setConfig({ ...config, dimension: id })} 
                           />
                       </div>
                       <div className="relative z-10 w-full border-t border-white/5 pt-6 mt-auto">
                           <label className="block text-sm font-bold text-gray-300 mb-3 tracking-wide uppercase">Render Length (Secs)</label>
                           <select 
                               value={config.targetDuration}
                               onChange={(e) => setConfig({ ...config, targetDuration: parseInt(e.target.value) })}
                               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-medium tracking-wide shadow-inner cursor-pointer"
                           >
                               <option className="bg-black text-white" value={8}>8 Seconds (Short)</option>
                               <option className="bg-black text-white" value={16}>16 Seconds (Standard)</option>
                               <option className="bg-black text-white" value={20}>20 Seconds (Extended)</option>
                           </select>
                           <p className="text-[11px] text-gray-500 font-medium tracking-wide mt-3 leading-relaxed">Extending duration burns exactly <span className="text-white">x2</span> compute credits.</p>
                       </div>
                   </div>
                </div>

            </div>
        </motion.div>

        {/* Floating Action Header overlay */}
        <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-none"
        >
            <div className="bg-black/60 backdrop-blur-2xl p-2 rounded-full border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center justify-between pr-2 pl-6 overflow-hidden relative pointer-events-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-transparent pointer-events-none" />
                
                <div className="flex flex-col mr-6 z-10 py-2">
                    <span className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-0.5">Ready to Roll</span>
                    <span className="text-sm text-gray-200 font-medium truncate max-w-[200px]">
                        {selectedTemplate ? selectedTemplate.title : "Assemble Blueprint"}
                    </span>
                </div>
                
                <Button 
                    size="lg" 
                    onClick={handleGenerate} 
                    disabled={loading || !config.templateId}
                    className="relative px-8 rounded-full bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10 border-none font-bold tracking-wide"
                >
                    {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5 text-brand" /> : <Wand2 className="mr-2 h-5 w-5" />}
                    {loading ? 'Booting Sora Pipeline...' : 'Generate Masterpiece'}
                </Button>
            </div>
        </motion.div>

      </div>
    </div>
  );
};
