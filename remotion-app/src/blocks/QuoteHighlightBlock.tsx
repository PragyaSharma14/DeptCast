import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useTheme } from '../theme/ThemeContext';

export const QuoteHighlightBlock: React.FC<{
  quote: string;
  author: string;
}> = ({ quote, author }) => {
  const { palette, animator } = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: animator,
  });

  const cardOpacity = interpolate(progress, [0, 1], [0, 1]);
  const cardTranslateY = interpolate(progress, [0, 1], [100, 0]);

  // Typewriter effect for quote
  const charactersToShow = Math.floor(interpolate(frame, [15, 60], [0, quote.length], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }));
  const visibleQuote = quote.substring(0, charactersToShow);

  const authorOpacity = interpolate(frame, [60, 75], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
      padding: '100px'
    }}>
      <div style={{
        width: '80%',
        backgroundColor: palette.surface,
        borderRadius: '32px',
        padding: '80px',
        position: 'relative',
        opacity: cardOpacity,
        transform: `translateY(${cardTranslateY}px)`,
        boxShadow: `0 40px 80px rgba(0,0,0,0.1)`,
        border: `1px solid ${palette.textMuted}30`,
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        {/* Giant Quote Mark */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '80px',
          fontSize: '180px',
          color: palette.primary,
          opacity: 0.4,
          fontFamily: 'serif',
          lineHeight: 1
        }}>
          "
        </div>

        <h1 style={{
          fontSize: '64px',
          color: palette.text,
          fontWeight: 700,
          lineHeight: 1.3,
          margin: 0,
          zIndex: 1
        }}>
          {visibleQuote}
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          opacity: authorOpacity
        }}>
          <div style={{ width: '40px', height: '4px', backgroundColor: palette.accent }} />
          <span style={{ fontSize: '32px', color: palette.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '4px' }}>
            {author}
          </span>
        </div>
      </div>
    </div>
  );
};
