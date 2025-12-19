import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const SOP_CONTEXT = `
CONTEXT:
You are the Quality Assurance Lead for "Archival Designs" (also managing "Garrell Associates" and "Standard Homes"). 
The sales agent is named "Paulo". 

SOP SUMMARY:
1. **Core Goal**: Route plan changes to the online "Modification Request form" for a free estimate in 1-3 business days. Do NOT take detailed modification notes over the phone.
2. **Email Capture**: MUST use NATO phonetic alphabet (Alpha, Bravo, Charlie...) to verify spelling. Must confirm domain (e.g., @gmail.com).
3. **Greetings**:
   - "Thanks for calling Archival Designs, this is Paulo. Are you calling about a specific plan, or exploring options?"
4. **Scenarios**:
   - **Discount**: Ask for prior order #/name.
   - **Downsize**: Direct to Mod Request form, ask for target sq footage.
   - **Re-buy**: Handle re-purchase + Mod link.
5. **Do Not**: Spend 20+ mins taking notes. Promise timelines without scope review. Switch brand identity mid-call.

EVALUATION CRITERIA:
- Did Paulo use the NATO alphabet for email?
- Did he avoid taking detailed notes and instead push the Mod Request form?
- Did he promise the correct SLA (1-3 business days)?
- Did he identify the correct brand (Archival, Garrell, or Standard)?
`;

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    transcript: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: { type: Type.STRING },
          text: { type: Type.STRING },
          timestamp: { type: Type.STRING, description: "Format MM:SS" },
        },
        required: ["speaker", "text", "timestamp"],
      },
    },
    sentiment: {
      type: Type.ARRAY,
      description: "Roughly 15-20 data points representing engagement over the duration.",
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Format MM:SS" },
          seconds: { type: Type.NUMBER },
          score: { type: Type.NUMBER, description: "0 to 100" },
        },
        required: ["time", "seconds", "score"],
      },
    },
    coaching: {
      type: Type.OBJECT,
      properties: {
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        missedOpportunities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        summary: {
            type: Type.STRING,
            description: "Executive summary identifying Brand, Plan, and outcome."
        }
      },
      required: ["strengths", "missedOpportunities", "summary"],
    },
  },
  required: ["transcript", "sentiment", "coaching"],
};

export const analyzeAudio = async (file: File): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please configure API_KEY in your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const base64Data = await fileToGenerativePart(file);
    const modelId = "gemini-3-flash-preview"; 
    
    const prompt = `
      ${SOP_CONTEXT}
      Analyze the audio of this sales call. 
      Identify the speakers (Paulo vs Customer).
      Evaluate Paulo strictly against the SOP.
      Provide engagement sentiment data.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("The AI returned an empty response.");

    return JSON.parse(text) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // Extract meaningful error message if possible
    const message = error?.message || "Unknown error occurred during analysis.";
    throw new Error(message);
  }
};

const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = (err) => reject(new Error("Failed to read audio file: " + err));
    reader.readAsDataURL(file);
  });
};