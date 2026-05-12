import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const generateScenes = async (userPrompt, intent, template) => {
  const systemInstruction = `You are an expert AI Video Director.
Based on the user's prompt, their intent, and the provided video template structure, generate a scene-by-scene breakdown.

Intent Goal: ${intent.goal}
Intent Tone: ${intent.tone}
Template Structure: ${template.structure.join(' -> ')}

For each scene requested by the template structure, provide a detailed visual description. 
Respond ONLY with a valid JSON array of objects without markdown.
Exact format required: 
[
  {
    "sceneNumber": 1,
    "description": "visual description of the scene..."
  }
]`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [{
          parts: [{ text: userPrompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let resultString = data.candidates[0].content.parts[0].text;

    const cleanJson = resultString.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Scene Generator Error with Gemini:", error);
    throw error;
  }
};
