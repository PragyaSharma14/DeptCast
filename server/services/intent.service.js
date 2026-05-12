import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
export const analyzeIntent = async (userPrompt) => {
  const systemInstruction = `You are an expert AI Video Producer. 
Analyze the user's prompt and extract the following:
- domain: categorized as strictly one of (marketing, it, finance, education, creator, general).
- goal: what the user is trying to achieve (e.g. sell, explain, teach, entertain).
- tone: the overall vibe (e.g. professional, cinematic, casual, emotional).
Respond ONLY with a valid JSON object without any markdown wrapping. Exact format: {"domain": "...", "goal": "...", "tone": "..."}`;

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
    
    // Clean up potential markdown formatting in case LLM prepends '```json'
    const cleanJson = resultString.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Intent Analyzer Error with Gemini:", error);
    // fallback intent
    return { domain: "general", goal: "inform", tone: "neutral" };
  }
};
