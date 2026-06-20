import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { getPalette } from "./Palettes";

export const LowerThird: React.FC<{ title: string, subtitle?: string, palette?: string }> = ({ title, subtitle, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = getPalette(palette);

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const xOffset = interpolate(slideIn, [0, 1], [-800, 0]);

  return (
    <div style={{
      position: "absolute",
      bottom: "100px",
      left: "100px",
      display: "flex",
      flexDirection: "column",
      transform: `translateX(${xOffset}px)`,
      opacity: slideIn,
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        backgroundColor: colors.primary,
        padding: "20px 60px",
        borderRadius: "16px 16px 16px 0",
        color: "white",
        fontSize: "64px",
        fontWeight: "900",
        boxShadow: "0px 20px 40px rgba(0,0,0,0.15)"
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          backgroundColor: "white",
          padding: "15px 50px",
          borderRadius: "0 0 16px 16px",
          color: colors.text,
          fontSize: "40px",
          fontWeight: "600",
          boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
          width: "fit-content"
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
