import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // Auth State
      user: null,
      token: null,
      activeOrg: null,
      
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setActiveOrg: (org) => set({ activeOrg: org }),
      logout: () => set({ user: null, token: null, activeOrg: null }),

      // Form State
      prompt: '',
      setPrompt: (prompt) => set({ prompt }),
      
      style: 'none',
      setStyle: (style) => set({ style }),
      
      resolution: '1280:720',
      setResolution: (resolution) => set({ resolution }),
      
      duration: 4,
      setDuration: (duration) => set({ duration }),
      
      seed: '',
      setSeed: (seed) => set({ seed }),

      // App State
      isGenerating: false,
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      
      currentVideo: null,
      setCurrentVideo: (video) => set({ currentVideo: video }),
      
      error: null,
      setError: (error) => set({ error }),

      // History
      history: [],
      addToHistory: (item) => set((state) => ({ 
        history: [item, ...state.history].slice(0, 50) // Keep last 50
      })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'video-gen-storage',
      partialize: (state) => ({ 
        history: state.history,
        token: state.token,
        user: state.user,
        activeOrg: state.activeOrg
      }), // Persist auth and history
    }
  )
);
