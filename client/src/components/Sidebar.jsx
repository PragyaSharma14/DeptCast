import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
    LayoutDashboard, PlusCircle, Folder, 
    BarChart, Video, Building2, Users, 
    LogOut, ChevronDown, CheckCircle2,
    Shield
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { getWizardBootstrap } from '../services/api';
import { ProductionModal } from './features/ProductionModal';

export const Sidebar = () => {
    const [location, setLocation] = useLocation();
    const { activeOrg, logout } = useStore();
    
    const [departments, setDepartments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    useEffect(() => {
        const fetchNavData = async () => {
            try {
                const data = await getWizardBootstrap();
                // We expect data to be an array of sectors, but since we filtered it to IT,
                // it should just be one sector or we can just flatten the departments
                if (data && data.length > 0) {
                    const itSector = data[0]; 
                    setDepartments(itSector.departments || []);
                }
            } catch (err) {
                console.error("Failed to load departments navigation:", err);
            }
        };
        fetchNavData();
    }, []);

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'My Blueprints', icon: Folder, path: '/projects' },
        { name: 'Analytics', icon: BarChart, path: '/analytics' },
    ];

    const adminItems = [
        { name: 'Company Setup', icon: Building2, path: '/settings/company' },
        { name: 'User Management', icon: Users, path: '/settings/users' },
    ];

    const handleDepartmentClick = (dept) => {
        setSelectedDepartment(dept);
        setModalOpen(true);
    };

    return (
        <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white shadow-sm flex flex-col">
            {/* Branding */}
            <div className="h-20 flex px-6 items-center flex-shrink-0">
                <Link href="/" className="flex items-center gap-3 group cursor-pointer w-full mt-2">
                    <div className="flex bg-brand flex-shrink-0 p-2 rounded-xl">
                        <Video className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-xl font-heading font-bold text-slate-900 tracking-tight block leading-none">
                            Dept<span className="text-brand">Cast</span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Enterprise Creator</span>
                    </div>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto stealth-scrollbar py-4 px-4 space-y-6">
                {/* Main Navigation */}
                <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Menu</p>
                    {menuItems.map((item) => {
                        const active = location === item.path;
                        return (
                            <Link key={item.name} href={item.path}>
                                <div className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all group cursor-pointer",
                                    active 
                                        ? "bg-brand text-white shadow-md shadow-brand/20" 
                                        : "text-slate-600 hover:text-brand hover:bg-brand/5"
                                )}>
                                    <item.icon size={18} className={cn(active ? "text-white" : "text-slate-400 group-hover:text-brand")} />
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Management section */}
                <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Admin</p>
                    {adminItems.map((item) => {
                        const active = location === item.path;
                        return (
                            <Link key={item.name} href={item.path}>
                                <div className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all group cursor-pointer",
                                    active 
                                        ? "bg-brand text-white shadow-md shadow-brand/20" 
                                        : "text-slate-600 hover:text-brand hover:bg-brand/5"
                                )}>
                                    <item.icon size={18} className={cn(active ? "text-white" : "text-slate-400 group-hover:text-brand")} />
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Departments Section */}
                <div className="space-y-1 pt-2">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                        Departments
                        {departments.length > 0 && (
                            <span className="bg-brand text-white px-2 py-0.5 rounded-md text-[9px]">{departments.length}</span>
                        )}
                    </p>
                    {departments.length === 0 ? (
                        <div className="px-4 py-2 text-xs text-slate-500 italic">No departments loaded.</div>
                    ) : (
                        departments.map((dept) => {
                            const isSelected = selectedDepartment?.id === dept.id && modalOpen;
                            return (
                                <button 
                                    key={dept.id} 
                                    onClick={() => handleDepartmentClick(dept)}
                                    className={cn(
                                        "flex items-center gap-3 w-full px-4 py-2 rounded-lg text-[13px] transition-all text-left group",
                                        isSelected ? "text-brand font-bold bg-brand/5" : "text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-50"
                                    )}
                                >
                                    {isSelected ? <div className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" /> : <Shield size={14} className="text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    <span className="flex-1 truncate relative -left-3">{dept.name}</span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
                <button 
                    onClick={() => logout()}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 transition-all text-left"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>

            <ProductionModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                selectedDepartment={selectedDepartment}
            />
        </aside>
    );
};
