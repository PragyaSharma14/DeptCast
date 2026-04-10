import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Building2, Globe, Mail, Phone, MapPin, 
    Palette, Layers, Image as ImageIcon,
    Save, Loader2, Upload, CheckCircle2,
    ChevronDown, Info, Globe2, Briefcase
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getOrgDetails, updateOrg, getSectors, getDepartmentsBySector } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

export const Company = () => {
    const { activeOrg, setActiveOrg } = useStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sectors, setSectors] = useState([]);
    const [departments, setDepartments] = useState([]);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        description: '',
        industry: '',
        companySize: '',
        website: '',
        brandColor: '#aa3bff',
        contactEmail: '',
        contactPhone: '',
        address: '',
        country: 'India',
        state: '',
        city: ''
    });

    const [selectedDepts, setSelectedDepts] = useState([]);

    useEffect(() => {
        const init = async () => {
            if (!activeOrg?._id) return;
            try {
                const [details, sectorData] = await Promise.all([
                    getOrgDetails(activeOrg._id),
                    getSectors()
                ]);
                
                const org = details.organization;
                setFormData({
                    name: org.name || '',
                    tagline: org.tagline || '',
                    description: org.description || '',
                    industry: org.industry || '',
                    companySize: org.companySize || '',
                    website: org.website || '',
                    brandColor: org.brandColor || '#aa3bff',
                    contactEmail: org.contactEmail || '',
                    contactPhone: org.contactPhone || '',
                    address: org.address || '',
                    country: org.country || 'India',
                    state: org.state || '',
                    city: org.city || ''
                });
                setSectors(sectorData);
            } catch (err) {
                console.error("Failed to load company details", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [activeOrg?._id]);

    useEffect(() => {
        if (formData.industry) {
            const sector = sectors.find(s => s.name === formData.industry || s.id === formData.industry);
            if (sector) {
                getDepartmentsBySector(sector.id).then(setDepartments);
            }
        }
    }, [formData.industry, sectors]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await updateOrg(activeOrg._id, { ...formData, departments: selectedDepts });
            setActiveOrg(updated);
        } catch (err) {
            console.error("Save error", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="animate-spin text-brand" size={40} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Synchronizing Identity...</p>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, subtitle }) => (
        <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-brand/10 rounded-2xl border border-brand/20">
                <Icon className="text-brand" size={20} />
            </div>
            <div>
                <h3 className="text-xl font-heading font-black text-white leading-none">{title}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5">{subtitle}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-dark/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center shadow-lg shadow-brand/20">
                        <Building2 className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-heading font-black text-white">Company Setup</h1>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Workspace configuration</p>
                    </div>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="rounded-2xl px-8 h-12 shadow-xl shadow-brand/20"
                >
                    {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                    Save Changes
                </Button>
            </div>

            <div className="space-y-8">
                <motion.section 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8"
                >
                    <SectionHeader icon={Building2} title="Company Identity" subtitle="Branding and visibility across DeptCast" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Company Logo</label>
                            <div className="group relative w-full aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-all">
                                <Upload className="text-gray-600 group-hover:text-brand transition-colors" size={32} />
                                <span className="text-[10px] font-black text-gray-600 group-hover:text-brand uppercase tracking-widest">Upload Image</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white flex items-center gap-1">Company Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="glass-input" placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white">Tagline / Slogan</label>
                                <input 
                                    type="text" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})}
                                    className="glass-input" placeholder="e.g. Delivering Excellence, Every Day"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white">About the Company</label>
                                <textarea 
                                    rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="glass-input resize-none" placeholder="Brief description of what your company does..."
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-panel p-8"
                >
                    <SectionHeader icon={Globe} title="Organisation Details" subtitle="Industry, size, and segmentation" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">Industry <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <select 
                                    value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
                                    className="glass-input appearance-none pr-10"
                                >
                                    <option value="" disabled className="bg-darker">Select industry...</option>
                                    {sectors.map(s => <option key={s.id} value={s.name} className="bg-darker">{s.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-brand transition-colors" size={18} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">Company Size</label>
                            <div className="relative group">
                                <select 
                                    value={formData.companySize} onChange={e => setFormData({...formData, companySize: e.target.value})}
                                    className="glass-input appearance-none pr-10"
                                >
                                    <option value="" disabled className="bg-darker">Select size...</option>
                                    <option value="1-10" className="bg-darker">1-10 employees</option>
                                    <option value="11-50" className="bg-darker">11-50 employees</option>
                                    <option value="51-200" className="bg-darker">51-200 employees</option>
                                    <option value="201-500" className="bg-darker">201-500 employees</option>
                                    <option value="500+" className="bg-darker">500+ employees</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-brand transition-colors" size={18} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">Website</label>
                            <div className="relative group flex items-center">
                                <Globe2 className="absolute left-4 text-gray-500" size={18} />
                                <input 
                                    type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
                                    className="glass-input pl-12" placeholder="https://www.yourcompany.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">Brand Colour</label>
                            <div className="flex gap-2">
                                <div className="relative group flex items-center flex-1">
                                    <div className="absolute left-4 w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: formData.brandColor }} />
                                    <input 
                                        type="text" value={formData.brandColor} onChange={e => setFormData({...formData, brandColor: e.target.value})}
                                        className="glass-input pl-12" placeholder="#aa3bff"
                                    />
                                </div>
                                <input 
                                    type="color" value={formData.brandColor} onChange={e => setFormData({...formData, brandColor: e.target.value})}
                                    className="w-12 h-12 bg-transparent border-none p-0 cursor-pointer overflow-hidden rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass-panel p-8"
                >
                    <SectionHeader icon={Mail} title="Contact Information" subtitle="Primary contact channels" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">Contact Email</label>
                            <input 
                                type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                                className="glass-input" placeholder="hr@yourcompany.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">Phone Number</label>
                            <input 
                                type="tel" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                                className="glass-input" placeholder="+91 98765 43210"
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <label className="text-sm font-bold text-white">Office Address</label>
                            <input 
                                type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                                className="glass-input" placeholder="Street address, building, floor"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">Country</label>
                            <select className="glass-input appearance-none bg-darker" value={formData.country} disabled>
                                <option>India</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">State</label>
                            <input 
                                type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                                className="glass-input" placeholder="Select state..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">City</label>
                            <input 
                                type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                                className="glass-input" placeholder="Select city..."
                            />
                        </div>
                    </div>
                </motion.section>

                <motion.section 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-panel p-8"
                >
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-brand/10 rounded-2xl border border-brand/20">
                                <Layers className="text-brand" size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-heading font-black text-white leading-none">Select Departments</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5">Map your organization structure</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                            <span className="text-brand">{selectedDepts.length} selected</span>
                            <button className="text-gray-500 hover:text-white transition-colors" onClick={() => setSelectedDepts(departments.map(d => d.id))}>Select All</button>
                            <button className="text-gray-500 hover:text-white transition-colors" onClick={() => setSelectedDepts([])}>Clear</button>
                        </div>
                    </div>

                    {departments.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {departments.map((dept) => {
                                const active = selectedDepts.includes(dept.id);
                                return (
                                    <button
                                        key={dept.id}
                                        onClick={() => active 
                                            ? setSelectedDepts(selectedDepts.filter(id => id !== dept.id))
                                            : setSelectedDepts([...selectedDepts, dept.id])
                                        }
                                        className={cn(
                                            "p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 group",
                                            active 
                                                ? "bg-brand/10 border-brand/40 shadow-lg shadow-brand/5" 
                                                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            active ? "bg-brand text-white" : "bg-white/10 text-gray-500 group-hover:bg-white/20 group-hover:text-white"
                                        )}>
                                            <Briefcase size={16} />
                                        </div>
                                        <span className={cn(
                                            "text-[11px] font-black uppercase tracking-wider",
                                            active ? "text-white" : "text-gray-400 group-hover:text-white"
                                        )}>{dept.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                            <Layers className="text-gray-700 opacity-20" size={48} />
                            <div>
                                <p className="text-gray-500 font-bold">No departments to display</p>
                                <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Select an Industry from the Organization Details section above</p>
                            </div>
                        </div>
                    )}
                </motion.section>

                <div className="flex justify-end pt-4">
                    <Button 
                        size="lg" onClick={handleSave} disabled={saving}
                        className="rounded-2xl px-12 py-6 h-auto shadow-2xl shadow-brand/20 text-lg"
                    >
                        {saving ? <Loader2 className="animate-spin mr-3" size={24} /> : <CheckCircle2 className="mr-3" size={24} />}
                        Save Company Setup
                    </Button>
                </div>
            </div>
        </div>
    );
};
