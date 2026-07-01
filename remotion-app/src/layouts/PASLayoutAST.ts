export const PASLayoutAST = (visualVibe: string, audienceEmotion: string, avatarId: string) => ({
  type: "sequence",
  visualVibe,
  audienceEmotion,
  children: [
    {
      type: "scene",
      durationInFrames: 90, // 3 seconds
      layout: {
        type: "quote_highlight",
        quote: "Our engagement levels have dropped by 30% this quarter.",
        author: "The Problem"
      }
    },
    {
      type: "scene",
      durationInFrames: 120, // 4 seconds
      layout: {
        type: "data_compare",
        title: "Declining Engagement",
        data: [
          { label: "Q1", value: 85 },
          { label: "Q2", value: 72 },
          { label: "Q3", value: 45, color: "#ef4444" } // Red for agitation
        ],
        maxValue: 100
      }
    },
    {
      type: "scene",
      durationInFrames: 120, // 4 seconds
      layout: {
        type: "avatar_message",
        title: "The Solution",
        message: "We are introducing a new AI-driven workflow to boost productivity and morale!",
        avatarId
      }
    }
  ]
});
