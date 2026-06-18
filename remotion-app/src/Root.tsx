import React from "react";
import { Composition } from "remotion";
import { DynamicComposition } from "./DynamicComposition";

// A fallback dummy AST
const defaultProps = {
  durationInFrames: 300, // 10 seconds at 30 fps
  ast: {
    type: "sequence",
    children: [
      {
        type: "scene",
        durationInFrames: 150,
        layout: {
          type: "center",
          backgroundColor: "#111111",
          children: [
            { type: "text", text: "Generative UI in Remotion", color: "#ffffff", fontSize: "80px", animation: "fade-in" }
          ]
        }
      },
      {
        type: "scene",
        durationInFrames: 150,
        layout: {
          type: "split",
          backgroundColor: "#222222",
          left: { type: "text", text: "Data Visualization", color: "#60a5fa", fontSize: "60px" },
          right: { type: "chart", data: [10, 20, 30, 40] }
        }
      }
    ]
  }
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicVideo"
        component={DynamicComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};
