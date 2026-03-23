import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq();

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

    const cleanJson = resultString.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Scene Generator Error with Groq/Llama:", error);
    throw error;
  }
};
