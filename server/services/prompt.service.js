export const buildCinematicPrompt = (sceneDescription, intent, template) => {
  // Combine scene description with tone and style hints to create a rich prompt for video generation APIs
  const basePrompt = sceneDescription;
  const toneHint = intent.tone ? `Tone: ${intent.tone}.` : "";
  const styleHint = template.styleHints ? `Cinematic Style: ${template.styleHints}.` : "High quality, highly detailed.";
  
  // Clean up and construct final prompt
  const finalPrompt = `${basePrompt} ${toneHint} ${styleHint}`.trim();
  
  return finalPrompt;
};
