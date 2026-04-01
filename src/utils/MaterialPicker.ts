export interface MaterialInfo {
  hex: string;
  name: string;
  material: string;
  complementary: string;
}

const colorToMaterialMap = [
  { hex: '#8B4513', name: 'Marrón Oscuro', material: 'Madera de Nogal / Roble Oscuro', complementary: '#D3D3D3 (Gris Claro)' },
  { hex: '#D2B48C', name: 'Beige Cálido', material: 'Madera de Haya / Fibras Naturales', complementary: '#4F4F4F (Gris Carbón)' },
  { hex: '#F5F5DC', name: 'Crema', material: 'Mármol Calacatta / Tela Lino', complementary: '#2F4F4F (Verde Pizarra)' },
  { hex: '#808080', name: 'Gris Medio', material: 'Microcemento / Acero Pulido', complementary: '#CD853F (Marrón Cobre)' },
  { hex: '#2F4F4F', name: 'Gris Pizarra', material: 'Pizarra Natural / Aluminio Anodizado', complementary: '#F5DEB3 (Trigo)' },
  { hex: '#111111', name: 'Negro Intenso', material: 'Acero Lacado / Cuero Negro', complementary: '#FFFFFF (Blanco Puro)' },
  { hex: '#FFFFFF', name: 'Blanco', material: 'Pintura Epóxica / Yeso', complementary: '#111111 (Negro Intenso)' },
  { hex: '#B22222', name: 'Rojo Ladrillo', material: 'Ladrillo Visto / Terracota', complementary: '#5F9EA0 (Azul Cadete)' },
  { hex: '#4682B4', name: 'Azul Acero', material: 'Terciopelo Azul / Laca', complementary: '#D2691E (Naranja Tostado)' },
  { hex: '#2E8B57', name: 'Verde Pino', material: 'Vegetación Biofílica / Tela Esmeralda', complementary: '#FFF8DC (Seda Perlada)' },
];

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

const getColorDistance = (color1: {r: number, g: number, b: number}, color2: {r: number, g: number, b: number}) => {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
};

export const MaterialPicker = {
  analyzePixel: async (imageUrl: string, xPercent: number, yPercent: number): Promise<MaterialInfo> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      // Fallback para blobs y strings de base64 generados localmente
      img.src = imageUrl;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Canvas context not supported");

        ctx.drawImage(img, 0, 0);
        
        // Calcular pixel exacto en base al % de offsetWidth/Height del click relativo
        const targetX = Math.floor(img.width * xPercent);
        const targetY = Math.floor(img.height * yPercent);
        
        let pixelData;
        try {
          pixelData = ctx.getImageData(targetX, targetY, 1, 1).data;
        } catch (e) {
          return reject("CORS error getting pixel data");
        }

        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];
        const a = pixelData[3];
        
        let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        if (a === 0) hex = "#FFFFFF"; // Fallback transparente = blanco
        
        const targetRgb = { r, g, b };
        
        let closestMatch = colorToMaterialMap[0];
        let minDistance = Infinity;

        // Búsqueda heurística euclidiana en el cubo RGB
        for (const map of colorToMaterialMap) {
          const mapRgb = hexToRgb(map.hex);
          const distance = getColorDistance(targetRgb, mapRgb);
          if (distance < minDistance) {
            minDistance = distance;
            closestMatch = map;
          }
        }
        
        resolve({
          hex,
          name: closestMatch.name,
          material: closestMatch.material,
          complementary: closestMatch.complementary
        });
      };
      
      img.onerror = () => reject("Failed to load image for material analysis");
    });
  }
};
