import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { AtomicBlocks } from "./components/AtomicBlocks";
import { ThemeProvider } from "./theme/ThemeContext";

export const DynamicComposition: React.FC<{ ast: any }> = ({ ast }) => {
  if (!ast || ast.type !== "sequence") {
    return <AbsoluteFill style={{ backgroundColor: "red", color: "white" }}>Invalid AST</AbsoluteFill>;
  }

  const visualVibe = ast.visualVibe || "Minimalistic Premium";
  const audienceEmotion = ast.audienceEmotion || "Trust";

  let cumulativeFrames = 0;

  return (
    <ThemeProvider visualVibe={visualVibe} audienceEmotion={audienceEmotion}>
      <AbsoluteFill>
        {ast.children.map((scene: any, i: number) => {
          const startFrame = cumulativeFrames;
          const durationInFrames = scene.durationInFrames || 90; // default 3s
          cumulativeFrames += durationInFrames;

          return (
            <Sequence key={i} from={startFrame} durationInFrames={durationInFrames}>
              <AbsoluteFill>
                <AtomicBlocks layout={scene.layout} />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </ThemeProvider>
  );
};
