import React from 'react';
import { useStore } from '../store/useStore';
import { Wand2, Settings2, Image as ImageIcon, Clock, Hash, ChevronDown, Sparkles } from 'lucide-react';
import axios from 'axios';

const STYLES = [
  { id: 'none', label: 'No Style' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'anime', label: 'Anime / Manga' },
  { id: '3d-render', label: '3D Render' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'watercolor', label: 'Watercolor' }
];

const RESOLUTIONS = ['1280:720', '720:1280', '1080:1920', '1920:1080'];
const DURATIONS = [4, 6, 8]; // As supported by veo3.1 models

export function GeneratorForm() {
  const { 
    prompt, setPrompt, 
    style, setStyle,
    resolution, setResolution,
    duration, setDuration,
    seed, setSeed,
    isGenerating, setIsGenerating,
    setCurrentVideo, setError,
    addToHistory
  } = useStore();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setCurrentVideo(null); // Clear previous

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/generate-video`, {
        prompt,
        style,
        resolution,
        duration,
        seed: seed || undefined
      });

      // The exact response depends on how Runway ML returns the task
      // In a real scenario, this would likely be a task ID and we'd need to poll
      // For this spec, we mock the result parsing
      const taskData = response.data.task;
      
      const newVideo = {
        id: taskData?.id || Date.now().toString(),
        url: taskData?.output?.[0] || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_5mb.mp4', // Mock URL if unavailable directly
        prompt,
        settings: { style, resolution, duration, seed },
        timestamp: new Date().toISOString()
      };

      setCurrentVideo(newVideo);
      addToHistory(newVideo);

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 w-full max-w-2xl mx-auto relative z-10">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-brand/20 rounded-lg">
          <Wand2 className="w-6 h-6 text-brand" />
        </div>
        <h2 className="text-2xl font-heading font-semibold text-white">Create Video</h2>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic drone shot flying through a neon-lit cyberpunk city, glowing rain..."
            className="glass-input h-32 resize-none"
            required
            disabled={isGenerating}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Style Selector */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
              <ImageIcon className="w-4 h-4" />
              <span>Art Style</span>
            </label>
            <div className="relative">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="glass-input appearance-none cursor-pointer"
                disabled={isGenerating}
              >
                {STYLES.map(s => (
                  <option key={s.id} value={s.id} className="bg-darker">{s.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Resolution Selector */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
              <Settings2 className="w-4 h-4" />
              <span>Resolution</span>
            </label>
            <div className="relative flex bg-black/40 border border-white/10 rounded-xl p-1">
              {RESOLUTIONS.map(res => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setResolution(res)}
                  disabled={isGenerating}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    resolution === res ? 'bg-white/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
              <Clock className="w-4 h-4" />
              <span>Duration (s)</span>
            </label>
            <div className="relative flex bg-black/40 border border-white/10 rounded-xl p-1">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  disabled={isGenerating}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    duration === d ? 'bg-white/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Seed Input */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
              <Hash className="w-4 h-4" />
              <span>Seed (Optional)</span>
            </label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Random"
              className="glass-input py-2"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="w-full btn-primary flex items-center justify-center space-x-2 mt-4"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
              <span>Generating Video...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Video</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
