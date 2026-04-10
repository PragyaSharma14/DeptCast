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
                "relative flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 text-left group overflow-hidden",
                isSelected 
                  ? "border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-600/5 ring-1 ring-indigo-600/20" 
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-400"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0",
                isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
              )}>
                <dim.icon className="h-6 w-6" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className={cn("font-bold text-sm tracking-tight", isSelected ? "text-slate-900" : "text-slate-500")}>{dim.label}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-md border leading-none font-black tracking-widest", isSelected ? "border-indigo-200 text-indigo-600 bg-white" : "border-slate-100 text-slate-400 bg-slate-50")}>{dim.ratio}</span>
                </div>
                <p className="text-[11px] font-medium leading-tight text-slate-500 line-clamp-1">{dim.desc}</p>
              </div>

              {isSelected && (
                  <motion.div 
                    layoutId="dim-active" 
                    className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-600" 
                  />
              )}
            </button>
          );
        })}
      </div>
  );
};
