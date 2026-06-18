import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig, spring, useCurrentFrame, interpolate } from "remotion";
import { AtomicBlocks } from "./components/AtomicBlocks";

export const DynamicComposition: React.FC<{ ast: any }> = ({ ast }) => {
  const { fps } = useVideoConfig();

  if (!ast || ast.type !== "sequence") {
    return <AbsoluteFill style={{ backgroundColor: "red", color: "white" }}>Invalid AST</AbsoluteFill>;
  }

  let cumulativeFrames = 0;

  return (
    <AbsoluteFill>
      {ast.children.map((scene: any, i: number) => {
        const startFrame = cumulativeFrames;
        const durationInFrames = scene.durationInFrames || 90; // default 3s
        cumulativeFrames += durationInFrames;

        return (
          <Sequence key={i} from={startFrame} durationInFrames={durationInFrames}>
            <AbsoluteFill style={{ backgroundColor: scene.layout.backgroundColor || "#000" }}>
              <AtomicBlocks layout={scene.layout} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
