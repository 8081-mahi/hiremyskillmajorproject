import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES } from "../types";

// In a real production app, this would be proxied through a backend.
// For this frontend-only demo, we use the key from env directly.
// Ensure your build tool injects process.env.API_KEY.

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  analyzeRequest: async (userQuery: string): Promise<{ category: string; reason: string; estimatedPrice: number }> => {
    if (!apiKey) {
      console.warn("No API Key provided for Gemini.");
      return { category: 'Other', reason: 'AI service unavailable', estimatedPrice: 50 };
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `User request: "${userQuery}". 
        Available categories: ${CATEGORIES.join(', ')}.
        Determine the most suitable category for this request.
        Estimate a fair hourly price (number only) for this work.
        Provide a very short reason.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, enum: [...CATEGORIES, 'Other'] },
              reason: { type: Type.STRING },
              estimatedPrice: { type: Type.NUMBER }
            },
            required: ["category", "reason", "estimatedPrice"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from Gemini");
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Error:", error);
      return { category: 'Other', reason: 'Could not analyze request.', estimatedPrice: 0 };
    }
  }
};