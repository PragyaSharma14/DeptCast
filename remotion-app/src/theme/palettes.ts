export type Palette = {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textMuted: string;
  accent: string;
  fontFamily: string;
};

export const getPaletteForVibe = (visualVibe: string): Palette => {
  switch (visualVibe) {
    case 'Futuristic AI World':
      return {
        background: '#09090b',
        surface: '#18181b',
        primary: '#06b6d4', // Cyan
        secondary: '#8b5cf6', // Purple
        text: '#ffffff',
        textMuted: '#a1a1aa',
        accent: '#ec4899', // Pink
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
      };
    case 'Minimalistic Premium':
      return {
        background: '#ffffff',
        surface: '#f4f4f5',
        primary: '#18181b', // Almost black
        secondary: '#52525b', // Grey
        text: '#09090b',
        textMuted: '#71717a',
        accent: '#3b82f6', // Blue
        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
      };
    case 'Luxury Cinematic':
      return {
        background: '#0a0a0a',
        surface: '#171717',
        primary: '#d4af37', // Gold
        secondary: '#8c7322', // Dark Gold
        text: '#fafafa',
        textMuted: '#a3a3a3',
        accent: '#b91c1c', // Deep Red
        fontFamily: '"Playfair Display", "Georgia", serif',
      };
    case 'Hollywood Commercial':
      return {
        background: '#111827',
        surface: '#1f2937',
        primary: '#3b82f6',
        secondary: '#10b981',
        text: '#f9fafb',
        textMuted: '#9ca3af',
        accent: '#f59e0b',
        fontFamily: '"Montserrat", "Inter", sans-serif',
      };
    default:
      // Default / Generic Corporate
      return {
        background: '#f8fafc',
        surface: '#ffffff',
        primary: '#4f46e5', // Indigo
        secondary: '#0ea5e9', // Sky blue
        text: '#0f172a',
        textMuted: '#64748b',
        accent: '#10b981', // Emerald
        fontFamily: '"Inter", "system-ui", sans-serif',
      };
  }
};
