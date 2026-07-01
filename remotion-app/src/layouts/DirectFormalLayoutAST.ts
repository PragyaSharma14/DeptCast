export const DirectFormalLayoutAST = (visualVibe: string, audienceEmotion: string, avatarId: string) => ({
  type: "sequence",
  visualVibe,
  audienceEmotion,
  children: [
    {
      type: "scene",
      durationInFrames: 120, // 4 seconds
      layout: {
        type: "avatar_message",
        title: "Quarterly Review",
        message: "Hello team, let's look at our impressive growth figures for this year.",
        avatarId
      }
    },
    {
      type: "scene",
      durationInFrames: 150, // 5 seconds
      layout: {
        type: "data_compare",
        title: "Revenue Growth (Millions)",
        data: [
          { label: "2023", value: 12.5 },
          { label: "2024", value: 18.2 },
          { label: "2025", value: 24.8, color: "#10b981" } // Emerald green
        ],
        maxValue: 30
      }
    }
  ]
});
