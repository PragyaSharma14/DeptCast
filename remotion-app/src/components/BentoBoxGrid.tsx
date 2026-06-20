import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { getPalette } from "./Palettes";

export const BentoBoxGrid: React.FC<{ data: string[] | any[], palette?: string }> = ({ data, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = getPalette(palette);

  // Normalize data to array of strings for simplicity if objects are passed
  const items = data.map(item => typeof item === "string" ? item : item.title || item.label || JSON.stringify(item));

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      gap: "40px",
      padding: "80px",
      backgroundColor: colors.background,
      width: "100%",
      height: "100%",
      boxSizing: "border-box"
    }}>
      {items.map((item, index) => {
        const delay = index * 10;
        const boxSpring = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 100 },
        });

        const scale = interpolate(boxSpring, [0, 1], [0.8, 1]);
        const opacity = interpolate(boxSpring, [0, 1], [0, 1]);

        return (
          <div key={index} style={{
            transform: `scale(${scale})`,
            opacity,
            backgroundColor: "white",
            border: `2px solid ${colors.secondary}`,
            borderRadius: "32px",
            padding: "40px",
            boxShadow: "0px 20px 40px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            flex: items.length <= 3 ? "1 1 30%" : "1 1 40%",
            minHeight: "250px",
            fontSize: "48px",
            fontWeight: "700",
            color: colors.text,
            fontFamily: "Inter, sans-serif"
          }}>
            {item}
          </div>
        );
      })}
    </div>
  );
};
