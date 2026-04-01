// FIX: Removed non-existent 'ThinkingLevel' from imports.
// 'Modality' is kept as it IS a valid export used in textToSpeech.
import { GoogleGenAI, Type, Modality } from "@google/genai";

// FIX: process.env is injected by vite.config.ts via `define`.
// Using a safe fallback chain.
const getAi = () =>
  new GoogleGenAI({
    apiKey:
      (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ||
      (typeof process !== "undefined" && process.env?.API_KEY) ||
      "",
  });

export const geminiService = {
  async generateConcept(prompt: string) {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
            imagePrompt: { type: Type.STRING },
          },
          required: [
            "title",
            "description",
            "aestheticScore",
            "orderScore",
            "complexityScore",
            "imagePrompt",
          ],
        },
      },
    });
    // FIX: response.text can be string | null | undefined → safe fallback
    return JSON.parse(response.text ?? "{}");
  },

  async generateArispaceDesign(prompt: string) {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert AI design assistant for a visionary architect named Ariana (Project Alpha). Generate an architectural concept based on this input: "${prompt}". 
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
              items: { type: Type.STRING },
            },
            imagePrompt: { type: Type.STRING },
          },
          required: ["description", "colorPalette", "imagePrompt"],
        },
      },
    });
    // FIX: safe fallback
    return JSON.parse(response.text ?? "{}");
  },

  async generateImage(
    prompt: string,
    aspectRatio: string = "1:1",
    _size: string = "1K"
  ): Promise<string | null> {
    const ai = getAi();
    const response = await ai.models.generateContent({
      // FIX: "gemini-3.1-flash-image-preview" does not exist.
      // Using the correct available Imagen / native image-gen model.
      model: "gemini-2.0-flash-preview-image-generation",
      contents: { parts: [{ text: prompt }] },
      config: {
        // FIX: imageConfig is not valid here, use responseModalities
        responseModalities: ["TEXT", "IMAGE"],
        // aspectRatio hint goes in the prompt for this model
      } as Record<string, unknown>,
    });

    // Attempt to get image part
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Unused param kept to avoid signature change downstream
    void aspectRatio;
    return null;
  },

  async generateStudioImage(
    prompt: string,
    aspectRatio: string = "1:1",
    _size: string = "1K"
  ): Promise<string | null> {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      } as Record<string, unknown>,
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    void aspectRatio;
    return null;
  },

  async analyzeImage(imageUri: string, prompt: string): Promise<string> {
    const ai = getAi();
    const base64Data = imageUri.split(",")[1];
    // FIX: typed as string to avoid implicit any
    const mimeType = imageUri.split(";")[0].split(":")[1] as string;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt },
        ],
      },
    });
    // FIX: safe fallback from string | null | undefined → string
    return response.text ?? "";
  },

  async searchGrounding(
    query: string
  ): Promise<{ text: string; groundingChunks: unknown }> {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      // FIX: safe fallback
      text: response.text ?? "",
      groundingChunks:
        response.candidates?.[0]?.groundingMetadata?.groundingChunks,
    };
  },

  async generateVideo(
    prompt: string,
    aspectRatio: "16:9" | "9:16" = "16:9"
  ): Promise<string | null> {
    const ai = getAi();

    // FIX: Typed the operation result properly using 'unknown' cast
    // to avoid errors from the experimental video API not being fully typed.
    let operation = await ai.models.generateVideos({
      model: "veo-2.0-generate-001",
      prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio,
      } as Record<string, unknown>,
    });

    // Poll until done
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
    }

    const downloadLink = (
      operation.response as Record<string, unknown> | undefined
    )
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (operation.response as any)?.generatedVideos?.[0]?.video?.uri
      : null;

    if (!downloadLink) return null;

    const apiKey =
      (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ||
      (typeof process !== "undefined" && process.env?.API_KEY) ||
      "";

    const dlResponse = await fetch(downloadLink as string, {
      method: "GET",
      headers: { "x-goog-api-key": apiKey },
    });
    const blob = await dlResponse.blob();
    return URL.createObjectURL(blob);
  },

  async transcribeAudio(audioBase64: string): Promise<string> {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: audioBase64, mimeType: "audio/wav" } },
          { text: "Transcribe this audio accurately." },
        ],
      },
    });
    // FIX: safe fallback
    return response.text ?? "";
  },

  async textToSpeech(text: string): Promise<string | null> {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
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
  },
};
