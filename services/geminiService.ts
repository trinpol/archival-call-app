import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize the client with the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const SOP_CONTEXT = `
CONTEXT:
You are the Quality Assurance Lead for "Archival Designs" (also managing "Garrell Associates" and "Standard Homes"). 
The sales agent is named "Paulo". 

SOP SUMMARY:
1. **Core Goal**: Route plan changes to the online "Modification Request form" for a free estimate in 1-3 business days. Do NOT take detailed modification notes over the phone.
2. **Email Capture**: MUST use NATO phonetic alphabet (Alpha, Bravo, Charlie...) to verify spelling. Must confirm domain (e.g., @gmail.com).
3. **Greetings**:
   - "Thanks for calling Archival Designs, this is Paulo. Are you calling about a specific plan, or exploring options?" (Or swap brand name depending on context).
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
      description: "A list of roughly 15-20 data points representing engagement/sentiment over the duration of the call.",
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Format MM:SS" },
          seconds: { type: Type.NUMBER, description: "Time in absolute seconds" },
          score: { type: Type.NUMBER, description: "Sentiment score from 0 to 100" },
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
          description: "Specific things Paulo did well based on SOP.",
        },
        missedOpportunities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Specific SOP violations or missed cues.",
        },
        summary: {
            type: Type.STRING,
            description: "A brief executive summary identifying Brand, Plan Number, and outcome."
        }
      },
      required: ["strengths", "missedOpportunities", "summary"],
    },
  },
  required: ["transcript", "sentiment", "coaching"],
};

export const analyzeAudio = async (file: File): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }

  try {
    const base64Data = await fileToGenerativePart(file);

    // Using gemini-3-flash-preview as per the updated guidelines for basic/general tasks
    const modelId = "gemini-3-flash-preview"; 
    
    const prompt = `
      ${SOP_CONTEXT}

      Analyze the attached audio file of a sales call between the agent (Paulo) and a Customer.
      
      Perform the following tasks:
      1. Generate a diarized transcript.
      2. Analyze the sentiment/engagement of the Customer throughout the call.
      3. Create a coaching card evaluating Paulo STRICTLY against the provided SOP rules.
      
      Return the data strictly in JSON format matching the provided schema.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: file.type, data: base64Data } },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("The AI returned an empty response.");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing audio with Gemini:", error);
    throw error;
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
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      reject(new Error("Failed to read the audio file."));
    };
    reader.readAsDataURL(file);
  });
};