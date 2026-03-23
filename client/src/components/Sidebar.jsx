import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
    LayoutDashboard, PlusCircle, Folder, 
    LayoutTemplate, BarChart, Settings, Video 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

export const Sidebar = () => {
    const [location] = useLocation();
    const { activeOrg } = useStore();

    const mainNav = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Create Video', icon: PlusCircle, path: '/videos/new' },
    ];

    const futureNav = [
        { name: 'My Projects', icon: Folder, path: '#projects', disabled: true },
        { name: 'Templates', icon: LayoutTemplate, path: '#templates', disabled: true },
        { name: 'Analytics', icon: BarChart, path: '#analytics', disabled: true },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-darker/90 backdrop-blur-xl hidden md:flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <Link href="/">
                    <a className="flex items-center gap-2 group cursor-pointer">
                        <div className="flex bg-brand/20 p-1.5 rounded-lg group-hover:bg-brand/30 transition-colors border border-brand/30">
                            <Video className="h-5 w-5 text-brand" />
                        </div>
                        <span className="text-xl font-heading font-bold text-white tracking-tight">
                            Dept<span className="text-gradient-brand">Cast</span>
                        </span>
                    </a>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                {activeOrg && (
                    <div className="px-2 mb-6">
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl shadow-inner">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center font-bold text-xs shadow-lg border border-white/20">
                                {activeOrg.name.substring(0,2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-brand uppercase tracking-widest font-bold">Workspace</p>
                                <p className="text-sm text-white font-semibold truncate leading-tight">{activeOrg.name}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Menu</p>
                    <nav className="space-y-1.5">
                        {mainNav.map(item => (
                            <Link key={item.name} href={item.path}>
                                <a className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                    location === item.path 
                                        ? "bg-brand/20 text-brand shadow-[0_0_20px_rgba(170,59,255,0.15)] border border-brand/30" 
                                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                )}>
                                    <item.icon size={18} className={cn(location === item.path ? "text-brand" : "text-gray-400 group-hover:text-white transition-colors")} />
                                    {item.name}
                                </a>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div>
                    <div className="flex items-center gap-2 px-3 mb-3">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Modules</p>
                        <span className="text-[9px] bg-brand/20 text-brand px-1.5 py-0.5 rounded font-bold tracking-widest uppercase border border-brand/20">Soon</span>
                    </div>
                    <nav className="space-y-1.5">
                        {futureNav.map(item => (
                            <div key={item.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 cursor-not-allowed border border-transparent">
                                <item.icon size={18} className="opacity-40" />
                                {item.name}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <Link href="/settings/company">
                    <a className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                        location.startsWith('/settings') 
                            ? "bg-white/10 text-white border-white/20 shadow-lg" 
                            : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                    )}>
                        <Settings size={18} className={location.startsWith('/settings') ? "text-white animate-spin-slow" : ""} />
                        Settings
                    </a>
                </Link>
            </div>
        </aside>
    );
};
