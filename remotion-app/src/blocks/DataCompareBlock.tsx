import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useTheme } from '../theme/ThemeContext';

export const DataCompareBlock: React.FC<{
  title: string;
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}> = ({ title, data, maxValue }) => {
  const { palette, animator } = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: animator,
  });

  const titleOpacity = interpolate(progress, [0, 1], [0, 1]);
  const titleY = interpolate(progress, [0, 1], [-50, 0]);

  const maxDataValue = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '100px',
      backgroundColor: palette.background,
    }}>
      <h2 style={{
        fontSize: '64px',
        color: palette.text,
        fontWeight: 800,
        marginBottom: '80px',
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        textAlign: 'center'
      }}>
        {title}
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        flex: 1,
        justifyContent: 'center'
      }}>
        {data.map((item, index) => {
          // Stagger the animation of each bar
          const barProgress = spring({
            frame: Math.max(0, frame - index * 5), // stagger by 5 frames
            fps,
            config: animator,
          });

          const widthPercent = (item.value / maxDataValue) * 100 * barProgress;
          const barColor = item.color || (index % 2 === 0 ? palette.primary : palette.secondary);

          return (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              width: '100%'
            }}>
              <div style={{ 
                width: '300px', 
                textAlign: 'right', 
                fontSize: '36px', 
                color: palette.text,
                fontWeight: 600,
                opacity: barProgress
              }}>
                {item.label}
              </div>
              
              <div style={{ flex: 1, backgroundColor: palette.surface, height: '80px', borderRadius: '40px', overflow: 'hidden' }}>
                <div style={{
                  width: `${widthPercent}%`,
                  height: '100%',
                  backgroundColor: barColor,
                  borderRadius: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '30px',
                  boxShadow: `0 0 20px ${barColor}40`
                }}>
                  <span style={{
                    color: '#ffffff',
                    fontSize: '36px',
                    fontWeight: 800,
                    opacity: barProgress
                  }}>
                    {Math.round(item.value * barProgress)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
