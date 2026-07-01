import React from "react";
import { Composition } from "remotion";
import { DynamicComposition } from "./DynamicComposition";
import { PASLayoutAST } from "./layouts/PASLayoutAST";
import { DirectFormalLayoutAST } from "./layouts/DirectFormalLayoutAST";

const calculateMetadata = ({ props }: { props: { ast: any } }) => {
  let totalDuration = 0;
  if (props.ast && props.ast.children) {
    for (const child of props.ast.children) {
      totalDuration += (child.durationInFrames || 90);
    }
  }
  return {
    durationInFrames: totalDuration > 0 ? totalDuration : 300,
    props
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Preview-PAS-Futuristic-Urgency"
        component={DynamicComposition}
        calculateMetadata={calculateMetadata}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ ast: PASLayoutAST("Futuristic AI World", "Urgency", "girl") }}
      />
      <Composition
        id="Preview-PAS-Minimalist-Trust"
        component={DynamicComposition}
        calculateMetadata={calculateMetadata}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ ast: PASLayoutAST("Minimalistic Premium", "Trust", "boy") }}
      />
      <Composition
        id="Preview-DirectFormal-Luxury"
        component={DynamicComposition}
        calculateMetadata={calculateMetadata}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ ast: DirectFormalLayoutAST("Luxury Cinematic", "Pride", "girl") }}
      />
      <Composition
        id="Preview-DirectFormal-Hollywood"
        component={DynamicComposition}
        calculateMetadata={calculateMetadata}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ ast: DirectFormalLayoutAST("Hollywood Commercial", "Excitement", "boy") }}
      />
    </>
  );
};
