import React from 'react';
import { useStore } from '../store/useStore';
import { Download, RotateCcw, Play, CheckCircle2, AlertCircle, Video } from 'lucide-react';

export function VideoPreview() {
  const { currentVideo, isGenerating, error } = useStore();

  if (error) {
    return (
      <div className="glass-panel p-8 w-full max-w-2xl mx-auto mt-8 flex flex-col items-center justify-center text-center border-red-500/30">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">Generation Failed</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="glass-panel p-8 w-full max-w-2xl mx-auto mt-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-brand rounded-full animate-spin border-t-transparent shadow-[0_0_15px_var(--color-brand-glow)]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-6 h-6 text-brand animate-pulse ml-1" />
          </div>
        </div>
        <h3 className="text-xl font-heading font-medium text-white mb-2">Crafting Your Vision...</h3>
        <p className="text-gray-400 text-sm animate-pulse">This might take a few moments.</p>
      </div>
    );
  }

  if (!currentVideo) return null;

  return (
    <div className="glass-panel overflow-hidden w-full max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center space-x-2 text-green-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Generation Complete</span>
        </div>
      </div>
      
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {currentVideo.url ? (
           <video 
             src={currentVideo.url} 
             controls 
             autoPlay 
             loop 
             className="w-full h-full object-contain"
           />
        ) : (
           <div className="text-gray-500 flex flex-col items-center">
               <Video className="w-12 h-12 mb-2 opacity-50"/>
               <p>Video Preview Unavailable</p>
           </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Prompt used</p>
          <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-gray-200 text-sm italic">
            "{currentVideo.prompt}"
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
             {currentVideo.settings.style !== 'none' && (
                 <span className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400">Style: {currentVideo.settings.style}</span>
             )}
             <span className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400">{currentVideo.settings.resolution}</span>
             <span className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400">{currentVideo.settings.duration}s</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <a
            href={currentVideo.url}
            download
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download High-Res</span>
          </a>
          {/* We do not implement regenerate logic deeply here but it could call handler again */}
          <button 
            type="button" 
            className="btn-secondary p-3 flex-shrink-0"
            title="Regenerate with same settings"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
