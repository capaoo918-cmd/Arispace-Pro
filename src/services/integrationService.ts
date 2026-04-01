import { aiService } from './aiService';

export const integrationService = {
  integrateWorkspace: async (_base64Image: string, userPrompt: string, workspaceItems: any[], allConcepts: any[], hasBackground: boolean, isHD: boolean = true): Promise<string> => {
    try {
      const hfApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      if (!hfApiKey) {
        throw new Error("Missing Hugging Face API key in environment variables");
      }

      // 3. Inteligencia de Mezcla: Detección de Texturas
      const activeTextures = workspaceItems
        .map(item => allConcepts.find(c => c.id === item.assetId))
        .filter(c => c?.type === 'texture')
        .map(c => c?.prompt.replace('Textura: ', ''));

      let textureNote = "";
      if (activeTextures.length > 0) {
        textureNote = `. Aplica la textura de ${Array.from(new Set(activeTextures)).join(', ')} detectada en el collage a las superficies correspondientes.`;
      }

      // Nueva Lógica de Virtual Staging (Fase 10)
      let basePrompt = `Master integration of elements: ${userPrompt}${textureNote}. Maintain spatial consistency, realistic shadows, and seamless blending of objects. Architectural photographic style, 8k, Octane.`;
      
      if (hasBackground) {
        basePrompt = `Professional Virtual Staging: Use the provided background photo as the definitive architectural structure. Photorealistically integrate the furniture and materials placed on top. Respect the perspective, lighting, and shadows of the original room. Style: ${userPrompt}${textureNote}`;
      }

      // Construcción del Integrador Estrícto (Prompt Adherence)
      const enhancedIntegrationPrompt = basePrompt;

      const payload = {
        inputs: enhancedIntegrationPrompt,
        parameters: {
          guidance_scale: 12.0,
          num_inference_steps: 12
        }
      };

      const response = await fetch(
        "/api/hf/models/black-forest-labs/FLUX.1-schnell",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`Integration API Error: ${response.status} - ${response.statusText}`);
      }

      let blob = await response.blob();

      // --- Fase 12: Upscaling HD ---
      if (isHD) {
        console.log("Integración completada. Iniciando fase de refinamiento HD...");
        blob = await aiService.upscaleImage(blob);
      }
      
      const newImageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return newImageUrl;

    } catch (error) {
      console.error("Failed to integrate workspace:", error);
      throw error;
    }
  }
};
