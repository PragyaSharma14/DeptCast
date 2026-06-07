import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import CreateAvatarModal from './avatar/CreateAvatarModal';

const AVATARS = [
  { id: 'boy', name: 'Boy Avatar', role: 'Presenter', image: '/avatars/Alex_Avatar.png', zoom: 'object-left-top scale-[1.6] origin-top-left' },
  { id: 'girl', name: 'Girl Avatar', role: 'Presenter', image: '/avatars/girl.png', zoom: 'object-left-top scale-[1.6] origin-top-left -translate-x-10' }
];

export const AvatarSelector = ({ selectedId, onSelect }) => {
  const customAvatars = useStore((state) => state.customAvatars);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allAvatars = [...AVATARS, ...customAvatars.map(a => ({
    ...a,
    role: 'Custom Avatar',
    image: a.imageUrl,
    zoom: 'object-cover object-top'
  }))];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Visual Avatar</h3>
        <span className="text-sm text-gray-500">{allAvatars.find(a => a.id === selectedId)?.name || 'None'} Selected</span>
      </div>

      {/* Horizontal scrolling list for premium feel */}
      <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
        {/* Create Avatar Button */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="snap-start shrink-0 cursor-pointer w-42 h-56 rounded-2xl border border-dashed border-white/20 hover:border-brand/50 bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 text-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-brand/20 group-hover:text-brand">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Create Avatar</span>
        </div>

        {allAvatars.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          return (
            <div
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              className={cn(
                "snap-start shrink-0 cursor-pointer w-42 h-56 rounded-2xl border transition-all duration-300 relative overflow-hidden group flex flex-col justify-end",
                isSelected
                  ? "border-brand shadow-[0_0_20px_var(--color-brand-glow)]"
                  : "border-white/10 hover:border-white/30"
              )}
            >
              {/* Background Image Zoomed */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className={cn(
                    "w-full h-full object-cover duration-300 transition-all",
                    avatar.zoom,
                    isSelected ? "brightness-100 opacity-100" : "brightness-75 opacity-90 group-hover:brightness-90 group-hover:opacity-100"
                  )}
                />
              </div>

              {/* Text Area over the image */}
              <div className={cn(
                "relative z-10 p-3 text-center transition-colors backdrop-blur-md",
                isSelected ? "bg-brand/80 border-t border-brand/50" : "bg-black/70 border-t border-white/10"
              )}>
                <p className={cn("font-medium", isSelected ? "text-white" : "text-gray-200")}>{avatar.name}</p>
                <p className={cn("text-xs mt-0.5", isSelected ? "text-brand-100 opacity-90" : "text-gray-400")}>{avatar.role}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <CreateAvatarModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
