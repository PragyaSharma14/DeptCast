import React from 'react';
import { cn } from '../../lib/utils';
import { Smartphone, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const DIMENSIONS = [
  { id: '16:9', label: 'Landscape', ratio: '16:9', desc: 'YouTube, Presentations, TV', icon: Monitor },
  { id: '9:16', label: 'Portrait', ratio: '9:16', desc: 'TikTok, Reels, Shorts', icon: Smartphone }
];

export const DimensionSelector = ({ selectedId, onSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-3">
        {DIMENSIONS.map((dim) => {
          const isSelected = selectedId === dim.id;
          return (
            <button 
              key={dim.id}
              onClick={() => onSelect(dim.id)}
              className={cn(
                "relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left group overflow-hidden",
                isSelected 
                  ? "border-brand bg-brand/10 shadow-[0_0_20px_var(--color-brand-glow)] ring-1 ring-brand/30" 
                  : "border-white/5 bg-black/20 hover:border-white/20 hover:bg-white/5 text-gray-400"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0",
                isSelected ? "bg-brand/20 text-brand" : "bg-white/5 text-gray-500 group-hover:text-gray-300"
              )}>
                <dim.icon className="h-6 w-6" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                    <span className={cn("font-bold text-sm tracking-wide", isSelected ? "text-white" : "text-gray-400")}>{dim.label}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border leading-none font-mono", isSelected ? "border-brand/30 text-brand bg-brand/5" : "border-white/10 text-gray-600")}>{dim.ratio}</span>
                </div>
                <p className="text-[11px] leading-tight text-gray-500 line-clamp-1">{dim.desc}</p>
              </div>

              {isSelected && (
                  <motion.div 
                    layoutId="dim-active" 
                    className="absolute right-0 top-0 bottom-0 w-1 bg-brand" 
                  />
              )}
            </button>
          );
        })}
      </div>
  );
};
