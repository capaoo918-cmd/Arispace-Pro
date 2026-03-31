export const aiService = {
  generateConcept: async (prompt: string): Promise<{ score: number, palette: string[], description: string, imageUrl: string }> => {
    // Simulación de proceso (2 segundos) de UX "Thinking..."
    await new Promise(resolve => setTimeout(resolve, 2000));

    const enhancedPrompt = `${prompt}, high-end architectural interior, luxury furniture, photorealistic, 8k, soft shadows`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    
    // Serverless Edge Proxy Route (Bypasses ANY AdBlocker/Client Firewall completely)
    const dynamicImageUrl = `/api/generate/${encodedPrompt}?width=1280&height=720&nologo=true`;

    return {
      score: 0.96, // Score alto para motivar a Ariana
      palette: ['#000000', '#2D3748', '#A0AEC0', '#E2E8F0', '#FFFFFF'], // Paleta elegante por defecto
      description: "Atmósfera sintetizada con enfoque en texturas orgánicas y contraste volumétrico.",
      imageUrl: dynamicImageUrl
    };
  }
};
