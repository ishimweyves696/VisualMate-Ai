import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Subject, GradeLevel, Language, VisualStyle, AspectRatio } from "../types";

function getAI() {
  const apiKey = (process.env as any).API_KEY || (process.env as any).GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = JSON.stringify(error).toLowerCase();
    const errorMessage = (error.message || "").toLowerCase();
    const isRetryable = 
      errorMessage.includes('500') || 
      errorMessage.includes('xhr') || 
      errorMessage.includes('rpc failed') ||
      errorMessage.includes('service unavailable') ||
      errorMessage.includes('deadline exceeded') ||
      errorMessage.includes('quota') ||
      errorStr.includes('rpc failed') ||
      errorStr.includes('500');

    if (retries > 0 && isRetryable) {
      console.warn(`Retrying API call due to transient error... Attempts left: ${retries}`);
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function analyzeTopic(
  topic: string,
  subject: Subject,
  gradeLevel: GradeLevel,
  language: Language
): Promise<AnalysisResult> {
  return withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following topic for an educational visual:
      Topic: ${topic}
      Subject: ${subject}
      Grade Level: ${gradeLevel}
      Language: ${language}
      
      Provide a structured breakdown including:
      1. A title and brief description.
      2. A list of key nodes/labels (id, label, type, description). Types: input, process, output, concept, event.
      3. A list of edges defining relationships between nodes (from, to, label).
      4. Optional notes for curriculum alignment or tips.
      5. A highly descriptive, professional prompt for an image generator (like DALL-E or Midjourney) to create a high-quality, scientifically accurate, and aesthetically pleasing educational visual. 
         - The prompt should describe a clean, detailed diagram or infographic.
         - For scientific topics, strongly encourage multi-panel layouts (e.g., showing both a macro view and a microscopic cross-section).
         - Mention cross-section views, anatomical structures, or macro-to-micro perspectives where appropriate.
         - Specify clear, legible labels with thin pointer lines.
         - Include relevant chemical formulas, mathematical equations, or technical notations if applicable.
         - Aim for a style similar to high-end scientific journals or educational textbooks (e.g., National Geographic, Scientific American).
         - Use a soft neutral or white background for maximum clarity.
      6. A short, helpful, calm, and intelligent commentary (1-2 sentences) explaining the structure of the visual to the user. Avoid robotic phrasing.
      7. Context feedback: Analyze if the topic is 'vague', 'complex', 'simple', or 'optimal' and provide a short message (e.g., if vague, suggest refinement).
      
      The imagePrompt should be in English. All other text (title, labels, descriptions, edge labels, commentary, context feedback message) must be in ${language}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["input", "process", "output", "concept", "event"] },
                  description: { type: Type.STRING },
                },
                required: ["id", "label", "type", "description"],
              },
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  from: { type: Type.STRING },
                  to: { type: Type.STRING },
                  label: { type: Type.STRING },
                },
                required: ["from", "to"],
              },
            },
            notes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            imagePrompt: { type: Type.STRING },
            commentary: { type: Type.STRING },
            contextFeedback: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["vague", "complex", "simple", "optimal"] },
                message: { type: Type.STRING },
              },
              required: ["type", "message"],
            },
          },
          required: ["title", "description", "nodes", "edges", "imagePrompt", "commentary"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("Invalid response format from AI");
    }
  });
}

export async function generateVisualImage(
  data: AnalysisResult, 
  style: VisualStyle, 
  aspectRatio: AspectRatio = '16:9'
): Promise<string> {
  return withRetry(async () => {
    const ai = getAI();
    
    // Use the imagePrompt generated by the analysis, but wrap it with quality constraints
    const fullPrompt = `Create a professional, high-quality educational visual based on this description:
${data.imagePrompt}

Style: ${style} (Educational Infographic/Scientific Diagram)
Aspect Ratio: ${aspectRatio}

Technical Requirements:
- Clean, modern, and highly legible aesthetic.
- Use a soft neutral or white background for maximum clarity.
- Ensure all labels are crisp and connected to their subjects with thin, clear pointer lines.
- If applicable, include detailed cross-sections or multi-layered views.
- Include relevant technical notations, formulas, or equations in a professional font.
- No distorted text, no messy artifacts.
- High scientific accuracy and professional textbook quality.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    const candidates = response.candidates || [];
    if (candidates.length === 0) throw new Error("No candidates returned from image generation");

    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");
  });
}
