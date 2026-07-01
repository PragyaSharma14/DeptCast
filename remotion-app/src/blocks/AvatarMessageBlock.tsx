import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion';
import { useTheme } from '../theme/ThemeContext';

export const AvatarMessageBlock: React.FC<{
  title: string;
  message: string;
  avatarId: string;
}> = ({ title, message, avatarId }) => {
  const { palette, animator } = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: animator,
  });

  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  // Determine image based on avatarId (boy/girl)
  const avatarUrl = avatarId === 'boy' 
    ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' // Mock avatar
    : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png'; // Mock avatar
    // In reality, this would use proper avatars or URL passed from JSON

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px',
      gap: '60px',
      backgroundColor: palette.background,
      opacity,
      transform: `scale(${scale})`
    }}>
      {/* Avatar Circle */}
      <div style={{
        width: '400px',
        height: '400px',
        borderRadius: '200px',
        backgroundColor: palette.surface,
        border: `8px solid ${palette.primary}`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 20px 40px ${palette.primary}40`,
      }}>
        <Img src={avatarUrl} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
      </div>

      {/* Message Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{
          fontSize: '72px',
          fontWeight: 800,
          color: palette.primary,
          margin: 0,
          lineHeight: 1.1
        }}>
          {title}
        </h2>
        <div style={{
          width: '100px',
          height: '8px',
          backgroundColor: palette.accent,
          borderRadius: '4px'
        }} />
        <p style={{
          fontSize: '40px',
          color: palette.text,
          margin: 0,
          lineHeight: 1.4,
          fontWeight: 500
        }}>
          {message}
        </p>
      </div>
    </div>
  );
};
