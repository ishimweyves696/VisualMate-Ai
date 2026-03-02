import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Subject, GradeLevel, Language, VisualStyle, AspectRatio } from "../types";

let aiInstance: any = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    try {
      aiInstance = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error("Error initializing GoogleGenAI:", error);
      throw error;
    }
  }
  return aiInstance;
}

export async function analyzeTopic(
  topic: string,
  subject: Subject,
  gradeLevel: GradeLevel,
  language: Language
): Promise<AnalysisResult> {
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
    5. A highly descriptive prompt for an image generator to create a high-quality educational visual (diagram or illustration) for this topic. 
    6. A short, helpful, calm, and intelligent commentary (1-2 sentences) explaining the structure of the visual to the user. Avoid robotic phrasing.
    7. Context feedback: Analyze if the topic is 'vague', 'complex', 'simple', or 'optimal' and provide a short message (e.g., if vague, suggest refinement).
    
    The imagePrompt should be in English. All other text (title, labels, descriptions, edge labels, commentary, context feedback message) must be in ${language}.`,
    config: {
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

  return JSON.parse(response.text || "{}");
}

export async function generateVisualImage(
  data: AnalysisResult, 
  style: VisualStyle, 
  aspectRatio: AspectRatio = '16:9'
): Promise<string> {
  const ai = getAI();
  const jsonString = JSON.stringify({
    title: data.title,
    nodes: data.nodes,
    edges: data.edges,
    notes: data.notes
  }, null, 2);

  const fullPrompt = `Create a professional educational diagram using the structured JSON below.

Aspect Ratio: ${aspectRatio}
Resolution: 1024x1024

Design must:
- Fit the exact aspect ratio.
- Use balanced margins.
- Avoid cutting off content.
- Maintain hierarchy and clean spacing.
- Ensure text readability at 100% zoom.
- Be suitable for classroom and print use.

Background: clean white or soft neutral.
Typography: professional sans-serif.
Arrows: clear directional flow.
No distortion.
No artistic noise.
Human-designed textbook style.

Structured Data:
${jsonString}`;
  
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

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
}
