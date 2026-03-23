import React from 'react';
import { cn } from '../../lib/utils';
import { Volume2, VolumeX } from 'lucide-react';

const VOICES = [
  { id: 'v_american_m', label: 'Michael (US)', description: 'Deep, authoritative', gender: 'Male' },
  { id: 'v_british_f', label: 'Emma (UK)', description: 'Professional, crisp', gender: 'Female' },
  { id: 'v_indian_m', label: 'Rahul (IN)', description: 'Warm, engaging', gender: 'Male' },
  { id: 'v_american_f', label: 'Sarah (US)', description: 'Energetic, upbeat', gender: 'Female' },
];

export const VoiceSelector = ({ selectedId, onSelect }) => {
  const [playingId, setPlayingId] = React.useState(null);

  const handlePlaySample = (e, voice) => {
    e.stopPropagation();
    if (playingId === voice.id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    setPlayingId(voice.id);
    
    const utterance = new SpeechSynthesisUtterance("Hello, this is a sample of my voice for your next video.");
    // Note: Actually selecting the voices requires deep speech API mapping, using generic mapping for UX demo
    utterance.rate = 0.9;
    utterance.pitch = voice.gender === 'Female' ? 1.2 : 0.8;
    
    utterance.onend = () => setPlayingId(null);
    window.speechSynthesis.speak(utterance);
  };

  React.useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Voice Profile</h3>
        <span className="text-sm text-gray-500">{VOICES.find(v => v.id === selectedId)?.label || 'None'} Selected</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {VOICES.map((voice) => {
          const isSelected = selectedId === voice.id;
          const isPlaying = playingId === voice.id;
          
          return (
            <div 
              key={voice.id}
              onClick={() => onSelect(voice.id)}
              className={cn(
                "cursor-pointer rounded-2xl border p-4 transition-all duration-300 relative group flex flex-col justify-between h-32",
                isSelected 
                  ? "border-brand bg-brand/10 shadow-[0_0_20px_var(--color-brand-glow)]" 
                  : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={cn("font-medium", isSelected ? "text-white" : "text-gray-300")}>{voice.label}</h4>
                  <p className="text-xs text-gray-500 mt-1">{voice.description}</p>
                </div>
                <button 
                  onClick={(e) => handlePlaySample(e, voice)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isPlaying ? "bg-brand text-white" : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
                  )}
                >
                  {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-brand/50"></span>
                <span className="text-xs text-brand font-medium tracking-wider uppercase">{voice.gender}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
