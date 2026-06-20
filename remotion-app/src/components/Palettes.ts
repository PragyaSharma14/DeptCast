export type PaletteConfig = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
};

export const Palettes: Record<string, PaletteConfig> = {
  HR_Palette: {
    primary: "#3b82f6", // Blue
    secondary: "#93c5fd", // Light blue
    background: "#f0fdf4", // Light mint
    text: "#1e293b", // Dark slate
    accent: "#10b981" // Emerald
  },
  Marketing_Palette: {
    primary: "#f43f5e", // Rose
    secondary: "#fbbf24", // Amber
    background: "#fff1f2", // Light rose
    text: "#0f172a", // Slate
    accent: "#8b5cf6" // Violet
  },
  IT_Palette: {
    primary: "#0ea5e9", // Sky
    secondary: "#38bdf8", // Lighter sky
    background: "#0f172a", // Dark mode
    text: "#f8fafc", // White
    accent: "#2dd4bf" // Teal
  },
  Default: {
    primary: "#64748b",
    secondary: "#cbd5e1",
    background: "#ffffff",
    text: "#0f172a",
    accent: "#3b82f6"
  }
};

export const getPalette = (name?: string): PaletteConfig => {
  return Palettes[name || "Default"] || Palettes.Default;
};
