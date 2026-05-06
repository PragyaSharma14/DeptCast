import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { getWizardBootstrap, createProject, generateBlueprint } from '../../services/api';
import { DimensionSelector } from '../../components/features/DimensionSelector';
import { Button } from '../../components/ui/Button';
import { Loader2, ArrowLeft, Wand2, Building2, Presentation, Sparkles, Clapperboard, PenTool, CheckCircle2, Layout, Sliders, ChevronDown, Monitor, UserCheck } from 'lucide-react';
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
    style: 'Hyper-Realistic', // Character/Style
    dimension: '16:9',
    targetDuration: 15,
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
    } catch (error) {
        console.error("Blueprint synthesis failed:", error);
        const backendError = error.response?.data?.error || error.message;
        const backendHint = error.response?.data?.hint ? `\nHint: ${error.response.data.hint}` : "";
        alert(`Strategic synthesis failed.\nError: ${backendError}${backendHint}`);
    } finally {
        setSynthesizing(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="relative">
              <div className="absolute inset-x-[-50%] inset-y-[-50%] bg-brand/10 blur-3xl rounded-full" />
              <Loader2 className="animate-spin h-12 w-12 text-brand relative z-10" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Loading Configuration</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-32 font-sans text-slate-800">
      
      {/* Background Atmosphere - Light & Airy */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-blue-50/50 blur-[150px] rounded-[100%] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-12 sm:mt-10 relative z-10 gap-6"
      >
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setLocation('/')}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-400 hover:text-brand transition-all shadow-sm border border-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <Layout className="h-4 w-4 text-brand" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Production Studio</span>
            </div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Configure Video</h1>
          </div>
        </div>
      </motion.div>

      <div className="space-y-12">

        {/* 1. Foundation Selection Table */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-6 pl-2">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-xs shadow-md">1</div>
              <h2 className="text-xl font-heading font-bold text-slate-900">Blueprint Selection</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm relative z-20">
                
                {/* 1. Sectors Pane (Industry) */}
                <div className="lg:col-span-3 border-r border-slate-200 flex flex-col bg-slate-50/50">
                    <div className="p-4 border-b border-slate-200 bg-white/50">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">1. Industry Sector</span>
                    </div>
                    <div className="overflow-y-auto stealth-scrollbar p-3 space-y-1.5 h-[400px]">
                        {bootstrapData.map(sector => (
                            <button
                                key={sector.id}
                                onClick={() => handleSectorChange(sector)}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl text-left transition-all duration-200 text-sm font-semibold group relative",
                                    selectedSectorId === sector.id 
                                        ? "bg-white text-brand shadow-sm ring-1 ring-slate-200" 
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                )}
                            >
                                {selectedSectorId === sector.id && (
                                    <motion.div layoutId="sector-pip" className="absolute left-0 top-3 bottom-3 w-1 bg-brand rounded-full" />
                                )}
                                {sector.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Departments Pane (Internal Units) */}
                <div className="lg:col-span-3 border-r border-slate-200 flex flex-col bg-slate-50/30">
                    <div className="p-4 border-b border-slate-200 bg-white/50 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">2. Department</span>
                        {departments.length > 0 && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{departments.length}</span>}
                    </div>
                    <div className="overflow-y-auto stealth-scrollbar p-3 space-y-1.5 h-[400px]">
                        {departments.map(dept => (
                            <button
                                key={dept.key}
                                onClick={() => handleDeptChange(dept)}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl text-left transition-all duration-200 group relative flex items-center gap-3",
                                    config.department === dept.key 
                                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" 
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                )}
                            >
                                <div className={cn("p-1.5 rounded-lg transition-colors", config.department === dept.key ? "bg-blue-50 text-brand" : "bg-slate-100 text-slate-300")}>
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
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">3. Template Selection</span>
                    </div>
                    
                    <div className="overflow-y-auto stealth-scrollbar p-6 h-[400px]">
                        {templates.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest">Select a department above...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                                {templates.map((tpl, i) => (
                                    <motion.button 
                                      key={tpl.id}
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: i * 0.03 }}
                                      onClick={() => setConfig({...config, templateId: tpl.id})}
                                      className={cn(
                                          "relative flex flex-col p-5 rounded-2xl border transition-all duration-300 text-left group hover:-translate-y-1 h-full",
                                          config.templateId === tpl.id 
                                            ? "border-brand bg-blue-50/50 shadow-sm"
                                            : "border-slate-200 bg-white hover:border-brand/30 hover:bg-slate-50 shadow-sm"
                                      )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors shrink-0",
                                            config.templateId === tpl.id ? "bg-brand text-white shadow-md shadow-brand/20" : "bg-slate-100 text-slate-500"
                                        )}>
                                            <Presentation className="h-5 w-5" />
                                        </div>
                                        <h4 className={cn("text-sm font-bold mb-1.5 tracking-tight transition-colors", config.templateId === tpl.id ? "text-brand" : "text-slate-900")}>{tpl.title}</h4>
                                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
                                            {tpl.keyPoints ? JSON.parse(tpl.keyPoints).join(' • ') : "Strategic template"}
                                        </p>

                                        {config.templateId === tpl.id && (
                                            <div className="absolute top-4 right-4 text-brand">
                                                <CheckCircle2 className="h-5 w-5" />
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

        {/* 2. Character & Quality Config */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-6 pl-2 mt-8">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-xs shadow-md">2</div>
              <h2 className="text-xl font-heading font-bold text-slate-900">Style Options</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-1 max-w-xl gap-6 relative">
                 {/* Character Type */}
                 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Character Style</p>
                     <div className="grid grid-cols-2 gap-3">
                         {['Hyper-Realistic', '3D Animated'].map((style) => (
                             <button
                                 key={style}
                                 onClick={() => setConfig({...config, style: style})}
                                 className={cn(
                                     "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all",
                                     config.style === style ? "border-brand bg-blue-50 text-brand font-bold" : "border-slate-200 text-slate-600 hover:border-slate-300 font-medium"
                                 )}
                             >
                                 <UserCheck size={20} />
                                 <span className="text-sm">{style}</span>
                             </button>
                         ))}
                     </div>
                 </div>
            </div>
        </motion.div>

        {/* 3. Global Context & Precision Control */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-3 mb-6 pl-2 mt-10">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-xs shadow-md">3</div>
              <h2 className="text-xl font-heading font-bold text-slate-900">Details & Prompt</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Override Editor */}
                <div className="lg:col-span-2 relative group p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="rounded-xl overflow-hidden flex flex-col h-full border border-slate-100">
                      <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Video Description</span>
                          </div>
                          <button 
                            onClick={handleSynthesize}
                            disabled={synthesizing || !config.templateId}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-brand hover:bg-brand hover:text-white transition-all text-xs font-semibold border border-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                             {synthesizing ? <Loader2 className="animate-spin h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                             {synthesizing ? "Enhancing..." : "Enhance with AI"}
                          </button>
                      </div>
                      <textarea 
                          value={config.additionalPrompt}
                          onChange={(e) => setConfig({ ...config, additionalPrompt: e.target.value })}
                          placeholder="Describe exactly what should happen in your video... (e.g. 'Emphasize the new Q4 financial goals and end with our corporate logo in blue')"
                          className="w-full h-56 bg-white p-6 text-slate-900 focus:outline-none resize-none transition-all placeholder:text-slate-300 font-medium text-sm leading-relaxed"
                          spellCheck="false"
                      />
                  </div>
                </div>

                {/* Sizing & Intensity */}
                <div className="space-y-6">
                   <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
                       
                       <div className="relative z-10 w-full mb-6">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Dimensions</p>
                           <DimensionSelector 
                               selectedId={config.dimension} 
                               onSelect={(id) => setConfig({ ...config, dimension: id })} 
                           />
                       </div>

                       <div className="relative z-10 w-full border-t border-slate-100 pt-6 mt-auto">
                           <label className="block text-[10px] font-bold text-slate-400 mb-3 tracking-widest uppercase">Target Duration</label>
                           <div className="relative">
                               <select 
                                   value={config.targetDuration}
                                   onChange={(e) => setConfig({ ...config, targetDuration: parseInt(e.target.value) })}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 appearance-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-semibold text-sm tracking-wide shadow-sm cursor-pointer"
                               >
                                   <option value={5}>5 Seconds (Focused)</option>
                                   <option value={10}>10 Seconds (Standard)</option>
                                   <option value={15}>15 Seconds (Extended)</option>
                               </select>
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                   <ChevronDown size={16} />
                               </div>
                           </div>
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-6 pointer-events-none"
        >
            <div className="bg-white/95 backdrop-blur-3xl p-3 rounded-[2rem] border border-slate-200 shadow-[0_10px_40px_rgba(37,99,235,0.15)] flex items-center justify-between pr-3 pl-8 overflow-hidden pointer-events-auto">
                <div className="flex flex-col mr-6">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Template</span>
                    <span className="text-sm text-slate-900 font-bold truncate max-w-[200px]">
                        {selectedTemplate ? selectedTemplate.title : "Select Blueprint"}
                    </span>
                </div>
                
                <Button 
                    size="lg" 
                    onClick={handleGenerate} 
                    disabled={loading || !config.templateId}
                    className="relative px-8 rounded-[1.5rem] bg-brand text-white shadow-md active:scale-95 border-none font-bold text-sm tracking-white py-5 h-auto btn-primary"
                >
                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {loading ? 'Initializing...' : 'Draft Strategic Blueprint'}
                </Button>
            </div>
        </motion.div>

      </div>
    </div>
  );
};
