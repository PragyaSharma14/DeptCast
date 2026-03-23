import React from 'react';
import { useStore } from '../store/useStore';
import { History, PlayCircle, Trash2 } from 'lucide-react';

export function HistoryPanel() {
  const { history, setCurrentVideo, clearHistory } = useStore();

  if (history.length === 0) return null;

  return (
    <div id="history" className="w-full max-w-7xl mx-auto px-6 mt-24 mb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <History className="w-6 h-6 text-brand" />
          <h2 className="text-2xl font-heading font-semibold text-white">Recent Generations</h2>
        </div>
        <button 
          onClick={clearHistory}
          className="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center space-x-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {history.map((item, i) => (
          <div 
            key={item.id + i} 
            className="glass-panel overflow-hidden group cursor-pointer hover:border-brand/50 transition-colors"
            onClick={() => {
                setCurrentVideo(item);
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="relative aspect-video bg-black">
              {item.url ? (
                  <video 
                    src={item.url} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  />
              ) : (
                  <div className="w-full h-full flex justify-center items-center bg-gray-900">
                      <PlayCircle className="w-8 h-8 text-gray-600"/>
                  </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <PlayCircle className="w-12 h-12 text-white shadow-lg rounded-full" />
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed" title={item.prompt}>
                {item.prompt}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
                <span className="text-xs font-mono text-brand bg-brand/10 px-2 py-1 rounded">
                  {item.settings.duration}s
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
