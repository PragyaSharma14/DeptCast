import React from 'react';
import { cn } from '../../lib/utils';
import { Smartphone, Monitor } from 'lucide-react';

const DIMENSIONS = [
  { id: '16:9', label: 'Landscape', ratio: '16:9', desc: 'YouTube, Presentations', icon: Monitor },
  { id: '9:16', label: 'Portrait', ratio: '9:16', desc: 'TikTok, Reels, Shorts', icon: Smartphone },
  { id: '1:1', label: 'Square', ratio: '1:1', desc: 'Instagram, LinkedIn', icon: Monitor },
];

export const DimensionSelector = ({ selectedId, onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Video Dimensions</h3>
        <span className="text-sm text-gray-500">{selectedId} Selected</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {DIMENSIONS.map((dim) => {
          const isSelected = selectedId === dim.id;
          return (
            <div 
              key={dim.id}
              onClick={() => onSelect(dim.id)}
              className={cn(
                "cursor-pointer rounded-2xl border p-5 transition-all duration-300 flex items-center gap-4",
                isSelected 
                  ? "border-brand bg-brand/10 shadow-[0_0_20px_var(--color-brand-glow)]" 
                  : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5"
              )}
            >
              <div className={cn(
                "p-3 rounded-lg flex-shrink-0",
                isSelected ? "bg-brand/20 text-brand" : "bg-white/5 text-gray-400"
              )}>
                <dim.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className={cn("font-medium flex items-center gap-2", isSelected ? "text-white" : "text-gray-300")}>
                  {dim.label} <span className="text-xs opacity-60 border px-1.5 rounded">{dim.ratio}</span>
                </h4>
                <p className="text-xs text-gray-500 mt-1">{dim.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
