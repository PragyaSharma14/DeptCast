import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { getPalette } from "./Palettes";

export const AnimatedBarChart: React.FC<{ title?: string, data: number[], labels?: string[], palette?: string }> = ({ title, data, labels, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = getPalette(palette);
  
  const progress = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const maxVal = Math.max(...data, 1);
  
  return (
    <div style={{ 
      flex: 1,
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center', 
      backgroundColor: colors.background,
      width: "100%",
      height: "100%",
      padding: "80px",
      boxSizing: "border-box"
    }}>
      {title && (
        <h1 style={{ 
          color: colors.text, 
          fontSize: "64px", 
          fontFamily: "Inter, sans-serif", 
          marginBottom: "60px",
          opacity: progress
        }}>
          {title}
        </h1>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '600px', gap: '40px', width: '80%', borderBottom: `4px solid ${colors.text}` }}>
        {data.map((val, i) => {
          const heightPercent = (val / maxVal) * 100 * progress;
          const label = labels && labels[i] ? labels[i] : `Item ${i+1}`;
          
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{
                color: colors.text,
                fontSize: "32px",
                fontWeight: "bold",
                fontFamily: "Inter, sans-serif",
                marginBottom: "10px",
                opacity: progress
              }}>
                {Math.round(val * progress)}
              </div>
              <div style={{
                width: '100%',
                height: `${heightPercent}%`,
                backgroundColor: colors.primary,
                borderRadius: '16px 16px 0 0',
                boxShadow: "0px 10px 20px rgba(0,0,0,0.1)"
              }}></div>
              <div style={{
                marginTop: "20px",
                color: colors.text,
                fontSize: "24px",
                fontFamily: "Inter, sans-serif",
                textAlign: "center"
              }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
