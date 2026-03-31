import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async generateConcept(prompt: string) {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate an architectural concept based on: ${prompt}. Return a JSON object with: title, description, aestheticScore (0-1), orderScore (0-10), complexityScore (0-10), and a detailed image generation prompt.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            aestheticScore: { type: Type.NUMBER },
            orderScore: { type: Type.NUMBER },
            complexityScore: { type: Type.NUMBER },
            imagePrompt: { type: Type.STRING }
          },
          required: ["title", "description", "aestheticScore", "orderScore", "complexityScore", "imagePrompt"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async generateArispaceDesign(prompt: string) {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert AI design assistant for a visionary architect named Yunikua (Project Alpha). Generate an architectural concept based on this input: "${prompt}". 
Return a JSON object with:
- description: A highly detailed technical description of the environment, structure, materials, and atmosphere. Keep it concise but professional.
- colorPalette: An array of 5 exact HEX colors that combine perfectly for this space.
- imagePrompt: A highly optimized, comma-separated prompt to generate a photorealistic, award-winning architectural visualization of this exact space.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            colorPalette: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            imagePrompt: { type: Type.STRING }
          },
          required: ["description", "colorPalette", "imagePrompt"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async generateImage(prompt: string, aspectRatio: string = "1:1", size: string = "1K") {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: size as any
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  async generateStudioImage(prompt: string, aspectRatio: string = "1:1", size: string = "1K") {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: size as any
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  async analyzeImage(imageUri: string, prompt: string) {
    const ai = getAi();
    const base64Data = imageUri.split(",")[1];
    const mimeType = imageUri.split(";")[0].split(":")[1];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      }
    });
    return response.text;
  },

  async searchGrounding(query: string) {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  },

  async generateVideo(prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
    const ai = getAi();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: { 'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY || "" },
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  async transcribeAudio(audioBase64: string) {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: audioBase64, mimeType: "audio/wav" } },
          { text: "Transcribe this audio accurately." }
        ]
      }
    });
    return response.text;
  },

  async textToSpeech(text: string) {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/wav" });
      return URL.createObjectURL(blob);
    }
    return null;
  }
};
