import { extractColorsFromImage } from '../utils/colorExtractor';

// Helper: Fetch con timeout y AbortController
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 45000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

export const aiService = {
  generateConcept: async (prompt: string): Promise<{ score: number, palette: string[], description: string, imageUrl: string }> => {
    const MAX_RETRIES = 2;

    const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!hfApiKey) throw new Error("Missing Hugging Face API key in environment variables");

    const enrichPrompt = (userPrompt: string) => {
      const isObject = /silla|mesa|sof|lampara|cuadro|planta|mueble|objeto|chair|table|lamp|plant|furniture|object/i.test(userPrompt);
      if (isObject) {
        return `Single isolated furniture object, ${userPrompt}, high contrast, sharp edges, distinct borders, studio lighting, pure white background, 8k resolution, centered.`;
      }
      const prePrompt = `Expert Interior Design Render: ${userPrompt}`;
      const technicalSuffix = ", high contrast, sharp edges, distinct borders, architectural photography, shot on 35mm lens, f/1.8, highly detailed textures, realistic materials (wood, stone, fabric), photorealistic, 8k resolution, cinematic lighting.";
      return prePrompt + technicalSuffix;
    };

    const enhancedPrompt = enrichPrompt(prompt);
    const isAislarAsset = /silla|mesa|sof|lampara|cuadro|planta|mueble|objeto|chair|table|lamp|plant|furniture|object/i.test(prompt);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetchWithTimeout(
          "/api/hf/models/black-forest-labs/FLUX.1-schnell",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${hfApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: enhancedPrompt }),
          },
          50000
        );

        // Modelo cargando en HF (cold start) → esperar y reintentar
        if (response.status === 503) {
          if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, (attempt + 1) * 20000));
            continue;
          }
          throw new Error("El modelo de IA está iniciando. Intenta de nuevo en 30 segundos.");
        }

        if (!response.ok) throw new Error(`HF API Error: ${response.status}`);

        const blob = await response.blob();

        const imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('FileReader returned non-string result'));
          };
          reader.onerror = () => reject(new Error('FileReader failed to read image blob'));
          reader.readAsDataURL(blob);
        });

        const dynamicPalette = await extractColorsFromImage(imageUrl, 5);

        return {
          score: 0.98,
          palette: dynamicPalette,
          description: isAislarAsset ? "Activo sólido de alta fidelidad sobre fondo blanco." : "Espacio conceptual de alto contraste.",
          imageUrl: imageUrl,
        };
      } catch (error) {
        if (attempt === MAX_RETRIES) throw error;
      }
    }

    throw new Error("No se pudo generar el concepto después de varios intentos.");
  },

  upscaleImage: async (imageBlob: Blob): Promise<Blob> => {
    try {
      const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      if (!hfApiKey) throw new Error("Missing HF API Key");

      const response = await fetchWithTimeout(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-x4-upscaler",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfApiKey}`,
            "Content-Type": "image/png",
          },
          body: imageBlob,
        },
        60000
      );

      if (!response.ok) return imageBlob;

      return await response.blob();
    } catch (error) {
      // En caso de fallo de upscaling, devolver el original sin romper el flujo
      return imageBlob;
    }
  },

  askCreativeAssistant: async (message: string, context: string): Promise<string> => {
    const FALLBACK = "La arquitectura es un lienzo vivo.";
    try {
      const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      if (!hfApiKey) return FALLBACK;

      const MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

      const prompt = `<s>[INST] Eres el Asistente Creativo de Arispace, un experto en diseño de interiores y arquitectura de alta gama. Responde brevemente (máximo 2 oraciones), en español de forma inspiradora y profesional. 
Contexto del lienzo actual del usuario: ${context}
Pregunta del usuario: ${message} [/INST]`;

      const response = await fetchWithTimeout(
        `https://api-inference.huggingface.co/models/${MODEL}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 100, return_full_text: false, temperature: 0.7 },
          }),
        },
        30000
      );

      // BLINDAJE: Validar status antes de parsear JSON
      if (!response.ok) return FALLBACK;

      const result = await response.json();

      // BLINDAJE: Validar estructura de respuesta
      if (!Array.isArray(result) || !result[0]?.generated_text) return FALLBACK;

      return result[0].generated_text.trim();
    } catch (error) {
      return "Mi enlace neural está oscilando, pero recuerda: arriésgate con las texturas.";
    }
  },

  generateExpertPrompt: async (idea: string): Promise<string> => {
    const FALLBACK = `${idea}, architectural concept, volumetric lighting, 35mm wide angle, high contrast, sharp edges, distinct borders, 8k.`;
    try {
      const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      if (!hfApiKey) throw new Error("Missing Hugging Face API key");

      const MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

      const systemPrompt = `Eres el Ingeniero de Prompts Senior en Arquitectura de Arispace. Tu misión es transformar la idea básica del usuario en un prompt técnico MAESTRO.
      El prompt resultante DEBE ser en inglés y contener SIEMPRE:
      - Iluminación: Volumetric lighting, soft shadows, chiaroscuro.
      - Óptica: 35mm wide angle lens, f/8, high resolution.
      - Materiales: Hormigón visto, coralina, maderas preciosas, mármol.
      - Refuerzo Visual: high contrast, sharp edges, distinct borders.
      Responde ÚNICAMENTE con el prompt enriquecido en una sola pieza de texto.`;

      const prompt = `<s>[INST] ${systemPrompt} \n Idea del usuario: "${idea}" [/INST]`;

      const response = await fetchWithTimeout(
        `https://api-inference.huggingface.co/models/${MODEL}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 250, return_full_text: false, temperature: 0.1 },
          }),
        },
        40000
      );

      // BLINDAJE: Validar status y estructura antes de usar
      if (!response.ok) return FALLBACK;

      const result = await response.json();
      if (!Array.isArray(result) || !result[0]?.generated_text) return FALLBACK;

      const rawText = result[0].generated_text;
      const safetySuffix = ", high contrast, sharp edges, distinct borders";
      const finalPrompt = rawText.includes("high contrast") ? rawText : rawText + safetySuffix;

      return finalPrompt.trim().replace(/^"|"$/g, '');
    } catch (error) {
      return FALLBACK;
    }
  }
};
