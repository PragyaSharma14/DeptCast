import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
    LayoutDashboard, PlusCircle, Folder, 
    LayoutTemplate, BarChart, Settings, Video,
    Building2, Users, Shield, Briefcase, 
    Factory, Stethoscope, Banknote, GraduationCap,
    ShoppingBag, Clapperboard, Truck, Home as HomeIcon,
    Search, ChevronDown, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { getSectors, getDepartmentsBySector } from '../services/api';

const Cpu = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
);

const sectorIconMap = {
    'technology-software': Cpu,
    'banking-finance': Banknote,
    'healthcare-pharma': Stethoscope,
    'manufacturing-engineering': Factory,
    'retail-e-commerce': ShoppingBag,
    'education-training': GraduationCap,
    'media-entertainment': Clapperboard,
    'logistics-supply-chain': Truck,
    'real-estate': HomeIcon,
    'consulting-professional-services': Briefcase,
    'government-public-sector': Shield
};

export const Sidebar = () => {
    const [location, setLocation] = useLocation();
    const { activeOrg } = useStore();
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loadingDepts, setLoadingDepts] = useState(false);

    useEffect(() => {
        getSectors().then(data => {
            setSectors(data);
            if (data.length > 0) setSelectedSector(data[2]); // Default to Healthcare or first
        });
    }, []);

    useEffect(() => {
        if (selectedSector) {
            setLoadingDepts(true);
            getDepartmentsBySector(selectedSector.id).then(data => {
                setDepartments(data);
                setLoadingDepts(false);
            });
        }
    }, [selectedSector]);

    const adminNav = [
        { name: 'Company Setup', icon: Building2, path: '/settings/company' },
        { name: 'User Management', icon: Users, path: '/settings/users' },
    ];

    return (
        <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/5 bg-[#0a0a0c] hidden md:flex flex-col shadow-2xl">
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b border-white/5 bg-black/20">
                <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="flex bg-brand/20 p-1.5 rounded-lg border border-brand/30">
                            <Video className="h-4 w-4 text-brand" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-heading font-black text-white tracking-tight leading-none">
                                Dept<span className="text-brand">Cast</span>
                            </span>
                            <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-1 opacity-50">Enterprise Creator</span>
                        </div>
                </Link>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto stealth-scrollbar py-4 px-3 space-y-6">
                
                {/* Main Menu */}
                <div className="space-y-1">
                    <p className="px-3 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Menu</p>
                    <Link href="/" className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all",
                        location === '/' ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                </div>

                {/* Admin Section */}
                <div className="space-y-1">
                    <p className="px-3 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Admin</p>
                    {adminNav.map(item => (
                        <Link key={item.name} href={item.path} className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all",
                            location === item.path ? "bg-white/10 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                        )}>
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Industry Selector */}
                <div className="space-y-3 pt-2">
                    <p className="px-3 text-[10px] font-black text-gray-600 uppercase tracking-widest">Industry</p>
                    <div className="px-2">
                        <div className="relative group">
                            <select 
                                value={selectedSector?.id || ''}
                                onChange={(e) => setSelectedSector(sectors.find(s => s.id === e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-gray-300 appearance-none focus:outline-none focus:border-brand/50 transition-colors cursor-pointer pr-10"
                            >
                                {sectors.map(s => (
                                    <option key={s.id} value={s.id} className="bg-black">{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-brand transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Departments Tree */}
                <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between px-3 mb-2">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Departments</p>
                        {loadingDepts && <div className="w-3 h-3 border-2 border-brand/50 border-t-brand rounded-full animate-spin" />}
                    </div>
                    
                    <div className="space-y-0.5">
                        {departments.map((dept, i) => {
                            const Icon = sectorIconMap[selectedSector?.key] || Briefcase;
                            return (
                                <button
                                    key={dept.id}
                                    onClick={() => {
                                        localStorage.setItem('deptcast_current_dept', dept.key);
                                        setLocation('/videos/new');
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-all group text-left"
                                >
                                    <Icon size={14} className="opacity-20 group-hover:opacity-100 group-hover:text-brand transition-all" />
                                    <span className="truncate uppercase tracking-wider">{dept.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Workspace Persistence */}
            <div className="p-4 border-t border-white/5 bg-black/40">
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center font-bold text-sm shadow-xl border border-white/10">
                        {activeOrg?.name.substring(0,2).toUpperCase() || 'DC'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[9px] text-brand uppercase tracking-widest font-black leading-none mb-1">Live Org</p>
                        <p className="text-xs text-white font-bold truncate leading-tight">{activeOrg?.name || 'Loading...'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
