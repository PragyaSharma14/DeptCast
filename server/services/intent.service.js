import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq();

export const analyzeIntent = async (userPrompt) => {
  const systemInstruction = `You are an expert AI Video Producer. 
Analyze the user's prompt and extract the following:
- domain: categorized as strictly one of (marketing, it, finance, education, creator, general).
- goal: what the user is trying to achieve (e.g. sell, explain, teach, entertain).
- tone: the overall vibe (e.g. professional, cinematic, casual, emotional).
Respond ONLY with a valid JSON object without any markdown wrapping. Exact format: {"domain": "...", "goal": "...", "tone": "..."}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "system",
          "content": systemInstruction
        },
        {
          "role": "user",
          "content": userPrompt
        }
      ],
      "model": "meta-llama/llama-4-scout-17b-16e-instruct",
      "temperature": 1,
      "max_completion_tokens": 1024,
      "top_p": 1,
      "stream": true,
      "stop": null
    });

    let resultString = '';
    for await (const chunk of chatCompletion) {
      resultString += chunk.choices[0]?.delta?.content || '';
    }
    
    // Clean up potential markdown formatting in case LLM prepends '```json'
    const cleanJson = resultString.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Intent Analyzer Error with Groq/Llama:", error);
    // fallback intent
    return { domain: "general", goal: "inform", tone: "neutral" };
  }
};
