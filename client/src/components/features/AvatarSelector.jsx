import React from 'react';
import { cn } from '../../lib/utils';

const AVATARS = [
  { id: 'alex', name: 'Alex', role: 'Corporate Presenter', seed: 'Alex' },
  { id: 'priya', name: 'Priya', role: 'HR Specialist', seed: 'Priya' },
  { id: 'james', name: 'James', role: 'IT Lead', seed: 'James' },
  { id: 'sarah', name: 'Sarah', role: 'Marketing', seed: 'Sarah' },
  { id: 'default', name: 'Custom Avatars', role: 'Pro Feature', seed: 'Oliver' },
];

export const AvatarSelector = ({ selectedId, onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Visual Avatar</h3>
        <span className="text-sm text-gray-500">{AVATARS.find(a => a.id === selectedId)?.name || 'None'} Selected</span>
      </div>
      
      {/* Horizontal scrolling list for premium feel */}
      <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
        {AVATARS.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          return (
            <div 
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              className={cn(
                "snap-start shrink-0 cursor-pointer w-40 rounded-2xl border transition-all duration-300 relative overflow-hidden group",
                isSelected 
                  ? "border-brand bg-brand/10 shadow-[0_0_20px_var(--color-brand-glow)]" 
                  : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5"
              )}
            >
              <div className="p-4 flex flex-col items-center">
                <img 
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${avatar.seed}&backgroundColor=transparent`} 
                  alt={avatar.name}
                  className={cn(
                    "w-24 h-24 duration-300 transition-transform",
                    isSelected ? "scale-110 drop-shadow-md" : "group-hover:scale-105"
                  )}
                />
              </div>
              <div className={cn(
                "p-3 text-center transition-colors",
                isSelected ? "bg-brand/20 border-t border-brand/30" : "bg-black/50 border-t border-white/5"
              )}>
                <p className={cn("font-medium", isSelected ? "text-white" : "text-gray-300")}>{avatar.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{avatar.role}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
