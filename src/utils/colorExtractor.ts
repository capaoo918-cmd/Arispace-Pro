export const extractColorsFromImage = (imageUrl: string, colorCount: number = 5): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Requerido para evitar el bloqueo del canvas
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(['#000000', '#2D3748', '#A0AEC0', '#E2E8F0', '#FFFFFF']);
      }

      // Escalar la imagen a un tamaño máximo de 100x100 para un muestreo rápido sin congelar la UI
      const MAX_SIZE = 100;
      let { width, height } = img;
      
      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = Math.max(1, Math.floor(width));
      canvas.height = Math.max(1, Math.floor(height));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {
        console.error("Error al obtener datos de píxeles (posible bloqueo CORS):", e);
        return resolve(['#000000', '#2D3748', '#A0AEC0', '#E2E8F0', '#FFFFFF']);
      }

      const data = imageData.data;
      const colorMap = new Map<string, number>();
      
      // Agrupación de colores (Color Quantization muy básico para performance)
      // Agrupamos colores que sean casi iguales en bloques controlados por 'step'
      const step = 32; 
      for (let i = 0; i < data.length; i += 4) {
        // Ignoramos píxeles altamente transparentes
        const a = data[i + 3];
        if (a < 128) continue; 
        
        const r = Math.round(data[i] / step) * step;
        const g = Math.round(data[i + 1] / step) * step;
        const b = Math.round(data[i + 2] / step) * step;

        const cr = Math.min(255, r);
        const cg = Math.min(255, g);
        const cb = Math.min(255, b);
        
        const hex = "#" + (1 << 24 | cr << 16 | cg << 8 | cb).toString(16).slice(1).toUpperCase();
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }

      // Ordenar colores por frecuencia (los más dominantes primero)
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      // Devolver exactamente la cantidad solicitada
      const result = sortedColors.slice(0, colorCount);
      while (result.length < colorCount) {
        result.push('#FFFFFF'); // Rellenar en caso extremo
      }
      
      resolve(result);
    };
    
    img.onerror = () => {
      console.warn("Error cargando imagen para extraer paleta de colores. Usando fallback.");
      resolve(['#000000', '#2D3748', '#A0AEC0', '#E2E8F0', '#FFFFFF']);
    };

    img.src = imageUrl;
  });
};
