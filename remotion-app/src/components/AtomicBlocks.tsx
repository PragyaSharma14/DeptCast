import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { KineticTitle } from "./KineticTitle";
import { BentoBoxGrid } from "./BentoBoxGrid";
import { AnimatedBarChart } from "./AnimatedBarChart";
import { LowerThird } from "./LowerThird";
import { AvatarMessageBlock } from "../blocks/AvatarMessageBlock";
import { DataCompareBlock } from "../blocks/DataCompareBlock";
import { QuoteHighlightBlock } from "../blocks/QuoteHighlightBlock";

const AnimatedText: React.FC<{ node: any }> = ({ node }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  
  const yOffset = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  return (
    <div style={{
      opacity,
      transform: `translateY(${50 - yOffset * 50}px)`,
      color: node.color || "white",
      fontSize: node.fontSize || "40px",
      fontWeight: "bold",
      fontFamily: "sans-serif",
      textAlign: "center"
    }}>
      {node.text}
    </div>
  );
};

const SimpleChart: React.FC<{ data: number[] }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = spring({ frame, fps, config: { damping: 14 } });
  
  const maxVal = Math.max(...data, 1);
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: '400px', gap: '20px' }}>
      {data.map((val, i) => {
        const heightPercent = (val / maxVal) * 100 * progress;
        return (
          <div key={i} style={{
            width: '80px',
            height: `${heightPercent}%`,
            backgroundColor: '#3b82f6',
            borderRadius: '10px 10px 0 0',
            display: 'flex',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            paddingTop: '10px'
          }}>
            {Math.round(val * progress)}
          </div>
        );
      })}
    </div>
  );
}

export const AtomicBlocks: React.FC<{ layout: any }> = ({ layout }) => {
  if (!layout) return null;

  // New Input-Driven Blocks
  if (layout.type === "avatar_message") {
    return <AvatarMessageBlock title={layout.title} message={layout.message} avatarId={layout.avatarId} />;
  }
  if (layout.type === "data_compare") {
    return <DataCompareBlock title={layout.title} data={layout.data} maxValue={layout.maxValue} />;
  }
  if (layout.type === "quote_highlight") {
    return <QuoteHighlightBlock quote={layout.quote} author={layout.author} />;
  }

  // Legacy layout handlers
  if (layout.type === "center") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: layout.backgroundColor || "transparent" }}>
        {layout.children?.map((child: any, i: number) => (
          <AtomicBlocks key={i} layout={child} />
        ))}
      </div>
    );
  }

  if (layout.type === "split") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "row", width: "100%", height: "100%", backgroundColor: layout.backgroundColor || "transparent" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
          <AtomicBlocks layout={layout.left} />
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
          <AtomicBlocks layout={layout.right} />
        </div>
      </div>
    );
  }

  if (layout.type === "text") {
    return <AnimatedText node={layout} />;
  }
  
  if (layout.type === "chart") {
    return <SimpleChart data={layout.data || []} />;
  }

  // Premium Component handlers
  if (layout.type === "kinetic_title") {
    return <KineticTitle text={layout.text} palette={layout.palette} />;
  }

  if (layout.type === "bento") {
    return <BentoBoxGrid data={layout.data} palette={layout.palette} />;
  }

  if (layout.type === "bar_chart") {
    return <AnimatedBarChart title={layout.title} data={layout.data} labels={layout.labels} palette={layout.palette} />;
  }

  if (layout.type === "lower_third") {
    return (
      <AbsoluteFill>
        <LowerThird title={layout.title} subtitle={layout.subtitle} palette={layout.palette} />
      </AbsoluteFill>
    );
  }

  return null;
};
