import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Video, Home, PlusCircle, Settings, UserCircle, LogOut, ChevronDown } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-darker/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-end px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-4 relative">
          <Link href="/videos/new">
            <a className="hidden md:block">
              <Button size="sm" variant="secondary" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New Video
              </Button>
            </a>
          </Link>
          <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
          
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <UserCircle className="h-6 w-6" />
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* User Dropdown */}
          {menuOpen && (
            <div className="absolute top-14 right-0 w-48 bg-darker border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-white/5 mb-2">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link href="/settings/company">
                <a className="px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                  <Settings size={16} /> Workspace Settings
                </a>
              </Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-400 hover:bg-white/5 w-full text-left flex items-center gap-2 mt-2 border-t border-white/5 pt-2"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
