import React from 'react';
import { Video, History, Sparkles, Github } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-dark-glass backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center border border-brand/50 group-hover:shadow-[0_0_15px_var(--color-brand-glow)] transition-all">
            <Video className="w-5 h-5 text-brand" />
          </div>
          <span className="text-xl font-heading font-semibold text-white tracking-wide">
            AI Video <span className="text-brand">Studio</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Sparkles className="w-4 h-4" />
            <span>Generate</span>
          </a>
          <a href="#history" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <History className="w-4 h-4" />
            <span>History</span>
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Pricing
          </a>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <Github className="w-5 h-5 text-gray-300" />
          </a>
        </nav>
      </div>
    </header>
  );
}
