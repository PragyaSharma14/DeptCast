import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
    LayoutDashboard, PlusCircle, Folder, 
    BarChart, Video, Building2, Users, 
    Settings, LogOut, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

export const Sidebar = () => {
    const [location, setLocation] = useLocation();
    const { activeOrg, logout } = useStore();

    const mainNav = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Create Video', icon: PlusCircle, path: '/videos/new' },
        { name: 'My Projects', icon: Folder, path: '/projects' },
        { name: 'Analytics', icon: BarChart, path: '/analytics' },
    ];

    const adminNav = [
        { name: 'Company Setup', icon: Building2, path: '/settings/company' },
        { name: 'User Management', icon: Users, path: '/settings/users' },
    ];

    return (
        <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-800 bg-slate-900 shadow-2xl flex flex-col">
            {/* Branding */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-black/20">
                <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                    <div className="flex bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30">
                        <Video className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="text-lg font-heading font-black text-white tracking-tight">
                        Dept<span className="text-indigo-400">Cast</span>
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto stealth-scrollbar py-6 px-4 space-y-8">
                {/* Main Navigation */}
                <div className="space-y-1.5">
                    <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 opacity-50">Main Menu</p>
                    {mainNav.map((item) => {
                        const active = location === item.path;
                        return (
                            <Link key={item.name} href={item.path}>
                                <div className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group cursor-pointer",
                                    active 
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}>
                                    <item.icon size={18} className={cn(active ? "text-white" : "text-slate-400 group-hover:text-white")} />
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Management section */}
                <div className="space-y-1.5">
                    <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 opacity-50">Management</p>
                    {adminNav.map((item) => {
                        const active = location === item.path;
                        return (
                            <Link key={item.name} href={item.path}>
                                <div className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group cursor-pointer",
                                    active 
                                        ? "bg-white/10 text-white border border-white/10" 
                                        : "text-slate-500 hover:text-white hover:bg-white/5"
                                )}>
                                    <item.icon size={18} className={cn(active ? "text-white" : "text-slate-500 group-hover:text-white")} />
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-white/5 bg-black/10 space-y-2">
                <Link href="/settings/profile">
                    <div className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-white/5 transition-all group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center font-bold text-xs text-brand border border-brand/20">
                                {activeOrg?.name.substring(0,2).toUpperCase() || 'DC'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-white font-bold truncate">{activeOrg?.name || 'My Organization'}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Workspace</p>
                            </div>
                        </div>
                        <Settings size={14} className="text-gray-600 group-hover:text-white group-hover:rotate-90 transition-all" />
                    </div>
                </Link>
                
                <button 
                    onClick={() => logout()}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all text-left"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};
