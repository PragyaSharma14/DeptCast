import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";
import { getPalette } from "./Palettes";

export const KineticTitle: React.FC<{ text: string, palette?: string }> = ({ text, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = getPalette(palette);

  const words = text.split(" ");

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      width: "100%",
      height: "100%",
    }}>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px",
        padding: "0 100px",
      }}>
        {words.map((word, index) => {
          const delay = index * 5;
          const wordSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12, mass: 0.5 },
          });

          const yOffset = interpolate(wordSpring, [0, 1], [100, 0]);
          const opacity = interpolate(wordSpring, [0, 1], [0, 1]);

          return (
            <span key={index} style={{
              transform: `translateY(${yOffset}px)`,
              opacity,
              color: index % 2 === 0 ? colors.text : colors.primary,
              fontSize: "120px",
              fontWeight: "900",
              fontFamily: "Inter, sans-serif",
              textShadow: `0px 4px 10px rgba(0,0,0,0.05)`
            }}>
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
