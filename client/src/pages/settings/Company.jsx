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
        brandColor: '#2563eb',
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
                    brandColor: org.brandColor || '#2563eb',
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
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Identity...</p>
        </div>
    );
    
    if (!activeOrg?._id) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 text-center">
            <Building2 className="text-slate-200" size={60} />
            <div>
                <h3 className="text-slate-900 font-bold">No Workspace Selected</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Please select a workspace from the dashboard to configure company settings.</p>
            </div>
            <Button onClick={() => setLocation('/')} className="rounded-xl px-8 mt-4">Go to Dashboard</Button>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, subtitle }) => (
        <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <Icon className="text-brand" size={20} />
            </div>
            <div>
                <h3 className="text-xl font-heading font-bold text-slate-900 leading-none">{title}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1.5">{subtitle}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 font-sans">
            <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between mb-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Building2 className="text-brand" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-slate-900">Company Setup</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Workspace configuration</p>
                    </div>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="rounded-xl px-8 h-10 shadow-sm active:scale-95 btn-primary text-xs"
                >
                    {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                    Save Changes
                </Button>
            </div>

            <div className="space-y-8">
                <motion.section 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm"
                >
                    <SectionHeader icon={Building2} title="Company Identity" subtitle="Branding and visibility across DeptCast" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Company Logo</label>
                            <div className="group relative w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand hover:bg-blue-50 transition-all">
                                <Upload className="text-slate-400 group-hover:text-brand transition-colors" size={32} />
                                <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand uppercase tracking-widest">Upload Image</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">Company Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all" placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Tagline / Slogan</label>
                                <input 
                                    type="text" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all" placeholder="e.g. Delivering Excellence, Every Day"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">About the Company</label>
                                <textarea 
                                    rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all resize-none" placeholder="Brief description of what your company does..."
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm"
                >
                    <SectionHeader icon={Globe} title="Organisation Details" subtitle="Industry, size, and segmentation" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Industry <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <select 
                                    value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all appearance-none pr-10 cursor-pointer"
                                >
                                    <option value="" disabled>Select industry...</option>
                                    {sectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-brand transition-colors" size={18} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Company Size</label>
                            <div className="relative group">
                                <select 
                                    value={formData.companySize} onChange={e => setFormData({...formData, companySize: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all appearance-none pr-10 cursor-pointer"
                                >
                                    <option value="" disabled>Select size...</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="500+">500+ employees</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-brand transition-colors" size={18} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Website</label>
                            <div className="relative group flex items-center">
                                <Globe2 className="absolute left-4 text-slate-400" size={18} />
                                <input 
                                    type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all" placeholder="https://www.yourcompany.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Brand Colour</label>
                            <div className="flex gap-2">
                                <div className="relative group flex items-center flex-1">
                                    <div className="absolute left-4 w-5 h-5 rounded-md border border-slate-200" style={{ backgroundColor: formData.brandColor }} />
                                    <input 
                                        type="text" value={formData.brandColor} onChange={e => setFormData({...formData, brandColor: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all" placeholder="#2563eb"
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
                    className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm"
                >
                    <SectionHeader icon={Mail} title="Contact Information" subtitle="Primary contact channels" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Contact Email</label>
                            <input 
                                type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all" placeholder="hr@yourcompany.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Phone Number</label>
                            <input 
                                type="tel" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all" placeholder="+91 98765 43210"
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-700">Office Address</label>
                            <input 
                                type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all" placeholder="Street address, building, floor"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Country</label>
                            <select className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 font-medium text-sm transition-all appearance-none" value={formData.country} disabled>
                                <option>India</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">State</label>
                            <input 
                                type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all" placeholder="Select state..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">City</label>
                            <input 
                                type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all" placeholder="Select city..."
                            />
                        </div>
                    </div>
                </motion.section>

                <motion.section 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm"
                >
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                <Layers className="text-brand" size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-heading font-bold text-slate-900 leading-none">Select Departments</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Map your organization structure</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-brand">{selectedDepts.length} selected</span>
                            <button className="text-slate-400 hover:text-slate-700 transition-colors" onClick={() => setSelectedDepts(departments.map(d => d.id))}>Select All</button>
                            <button className="text-slate-400 hover:text-slate-700 transition-colors" onClick={() => setSelectedDepts([])}>Clear</button>
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
                                            "p-4 rounded-xl border transition-all text-left flex flex-col gap-2 group",
                                            active 
                                                ? "bg-blue-50 border-brand shadow-sm" 
                                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            active ? "bg-brand text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                                        )}>
                                            <Briefcase size={16} />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold tracking-tight",
                                            active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                                        )}>{dept.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                            <Layers className="text-slate-300" size={48} />
                            <div>
                                <p className="text-slate-500 font-bold">No departments to display</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select an Industry from the Organization Details section above</p>
                            </div>
                        </div>
                    )}
                </motion.section>

                <div className="flex justify-end pt-4">
                    <Button 
                        size="lg" onClick={handleSave} disabled={saving}
                        className="rounded-2xl px-12 py-5 h-auto shadow-md text-sm font-bold bg-brand text-white active:scale-95 transition-all"
                    >
                        {saving ? <Loader2 className="animate-spin mr-3" size={20} /> : <CheckCircle2 className="mr-3" size={20} />}
                        Save Company Setup
                    </Button>
                </div>
            </div>
        </div>
    );
};
