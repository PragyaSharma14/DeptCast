import React, { createContext, useContext } from 'react';
import { Palette, getPaletteForVibe } from './palettes';
import { AnimatorConfig, getAnimatorForEmotion } from './animators';

type Theme = {
  palette: Palette;
  animator: AnimatorConfig;
  vibe: string;
  emotion: string;
};

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{
  visualVibe: string;
  audienceEmotion: string;
  children: React.ReactNode;
}> = ({ visualVibe, audienceEmotion, children }) => {
  const theme: Theme = {
    palette: getPaletteForVibe(visualVibe),
    animator: getAnimatorForEmotion(audienceEmotion),
    vibe: visualVibe,
    emotion: audienceEmotion,
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ fontFamily: theme.palette.fontFamily, width: '100%', height: '100%' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
