import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Video, PlusCircle, Settings, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { useStore } from '../store/useStore';

export const Navbar = () => {
  const [location, setLocation] = useLocation();
  const { user, activeOrg, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/50 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-end px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-4 relative">
          <Link href="/videos/new" className="hidden md:block">
              <Button size="sm" variant="secondary" className="gap-2 rounded-xl text-xs font-black uppercase tracking-widest border-slate-200">
                <PlusCircle className="h-4 w-4" />
                New Video
              </Button>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
          
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all p-2 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100">
            <UserCircle className="h-6 w-6" />
            <ChevronDown className={cn("h-4 w-4 transition-transform", menuOpen && "rotate-180")} />
          </button>

          {/* User Dropdown - Executive Style */}
          {menuOpen && (
            <div className="absolute top-14 right-0 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-5 py-3 border-b border-slate-100 mb-2">
                <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{user?.email}</p>
              </div>
              <Link href="/settings/company" className="px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-bold flex items-center gap-3 transition-colors" onClick={() => setMenuOpen(false)}>
                  <Settings size={18} className="text-slate-400 group-hover:text-indigo-600" /> Workspace Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left font-bold flex items-center gap-3 mt-2 border-t border-slate-100 pt-3 transition-colors"
              >
                <LogOut size={18} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
