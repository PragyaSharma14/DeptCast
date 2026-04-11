import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
    LayoutDashboard, PlusCircle, Folder, 
    BarChart, Video, Building2, Users, 
    Settings, LogOut, ChevronDown, CheckCircle2,
    Briefcase, Shield, Banknote, HelpCircle, GraduationCap, PackageSearch, Activity, PenTool
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

export const Sidebar = () => {
    const [location, setLocation] = useLocation();
    const { activeOrg, logout } = useStore();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Create Video', icon: PlusCircle, path: '/videos/new' },
        { name: 'My Projects', icon: Folder, path: '/projects' },
        { name: 'Analytics', icon: BarChart, path: '/analytics' },
    ];

    const adminItems = [
        { name: 'Company Setup', icon: Building2, path: '/settings/company' },
        { name: 'User Management', icon: Users, path: '/settings/users' },
    ];

    const departments = [
        { name: 'Corporate & General', active: true },
        { name: 'Human Resources' },
        { name: 'Finance & Accounts' },
        { name: 'Administration' },
        { name: 'Legal & Compliance' },
        { name: 'IT & Technology' },
        { name: 'Marketing' },
        { name: 'Sales' },
        { name: 'Customer Service' },
        { name: 'Procurement' },
        { name: 'Operations' },
    ];

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

                {/* Industry Selector */}
                <div className="space-y-1 pt-2">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Industry</p>
                    <button className="flex items-center justify-between w-full px-4 py-2 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all text-left shadow-sm">
                        <span className="flex items-center gap-2"><Building2 size={14} className="text-slate-400"/> All Industries</span>
                        <ChevronDown size={14} className="text-slate-400" />
                    </button>
                </div>

                {/* Departments Section */}
                <div className="space-y-1 pt-2">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                        Departments
                    </p>
                    {departments.map((dept) => (
                        <button key={dept.name} className={cn(
                            "flex items-center gap-3 w-full px-4 py-2 rounded-lg text-[13px] transition-all text-left",
                            dept.active ? "text-brand font-bold bg-brand/5" : "text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-50"
                        )}>
                            {dept.active ? <div className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" /> : <Shield size={14} className="text-slate-400 flex-shrink-0 opacity-0" />}
                            <span className="flex-1 truncate relative -left-3">{dept.name}</span>
                        </button>
                    ))}
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
        </aside>
    );
};
