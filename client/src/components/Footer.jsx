import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-darker/80 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-xl font-heading font-semibold text-white tracking-wide mb-4 block">
              AI Video <span className="text-brand">Studio</span>
            </span>
            <p className="text-gray-400 max-w-sm">
              Create cinematic, professional-quality videos from simple text descriptions using the power of RunwayML Gen3a Turbo.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-brand transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand transition-colors">API Reference</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand transition-colors">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand/20 hover:text-brand transition-colors text-gray-400">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand/20 hover:text-brand transition-colors text-gray-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand/20 hover:text-brand transition-colors text-gray-400">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AI Video Studio. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
