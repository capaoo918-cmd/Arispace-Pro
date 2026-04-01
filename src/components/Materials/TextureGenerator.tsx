import React, { useState } from 'react';
import { Sparkles, ZoomIn, Box, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { useArispaceStore } from '../../store/useArispaceStore';
import { ImageLightbox } from '../ImageLightbox';

export const TextureGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{ id: string, url: string, loading: boolean }[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const { addSavedMaterial } = useArispaceStore();

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const initialSlots = Array.from({ length: 4 }).map((_, i) => ({ id: `gen-${Date.now()}-${i}`, url: '', loading: true }));
    setResults(initialSlots);

    const variants = [
      '',
      ', soft ambient lighting',
      ', distinct pattern scale, natural light',
      ', macro photography focus, high contrast'
    ];

    try {
      await Promise.allSettled(
        variants.map(async (variant, index) => {
          const finalPrompt = `Seamless high quality architectural texture of ${prompt}${variant}. Photorealistic, 8k, flat lighting, perfectly straight on. No background, only the material itself.`;
          try {
            const url = await geminiService.generateStudioImage(finalPrompt, "1:1");
            if (url) {
              setResults(prev => prev.map((item, i) => i === index ? { ...item, url, loading: false } : item));
            } else {
              setResults(prev => prev.map((item, i) => i === index ? { ...item, loading: false } : item));
            }
          } catch (err) {
            setResults(prev => prev.map((item, i) => i === index ? { ...item, loading: false } : item));
          }
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateSingle = async (index: number) => {
    setResults(prev => prev.map((item, i) => i === index ? { ...item, loading: true, url: '' } : item));
    const finalPrompt = `Seamless high quality architectural texture of ${prompt}, completely different variation. Photorealistic, 8k, flat lighting. No background.`;
    try {
      const url = await geminiService.generateStudioImage(finalPrompt, "1:1");
      if (url) {
        setResults(prev => prev.map((item, i) => i === index ? { ...item, url, loading: false } : item));
      } else {
        setResults(prev => prev.map((item, i) => i === index ? { ...item, loading: false } : item));
      }
    } catch {
      setResults(prev => prev.map((item, i) => i === index ? { ...item, loading: false } : item));
    }
  };

  const handleSave = (url: string) => {
    addSavedMaterial({
      name: `AI: ${prompt.slice(0, 15)}...`,
      imageUrl: url,
      lrv: 'N/A',
      notes: `Prompt: ${prompt}`,
      category: 'Uncategorized'
    });
    // Simulating a toast Notification
    const btn = document.activeElement as HTMLElement;
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = '¡Guardado!';
      btn.classList.add('bg-emerald-500', 'text-white');
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove('bg-emerald-500', 'text-white');
      }, 2000);
    }
  };

  return (
    <div className="w-full bg-white/60 backdrop-blur-md p-8 rounded-[3rem] shadow-luxury border border-white/50 flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-xl font-black text-[#1F2937]">Generador de Materiales AI</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">4 variaciones simultáneas</p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="flex gap-4">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Pisos exteriores lujosos y relajados de piedra caliza hueca"
          className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner"
        />
        <button 
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="bg-[#1F2937] hover:bg-black disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-gray-200 transition-all active:scale-95"
        >
          {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
          Generar
        </button>
      </form>

      {/* Grid Horizontal de Resultados */}
      {results.length > 0 && (
        <div className="flex gap-4 overflow-x-auto hide-scrollbar py-4 px-2 snap-x">
          {results.map((res, idx) => (
            <div key={res.id} className="min-w-[280px] w-[280px] aspect-square rounded-[2rem] bg-gray-50 border border-gray-100 shadow-md relative group overflow-hidden snap-center flex-shrink-0">
              {res.loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-100 animate-pulse">
                  <RefreshCw size={24} className="text-indigo-400 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Tejiendo {idx+1}...</span>
                </div>
              ) : res.url ? (
                <>
                  <img src={res.url} alt={`Gen ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 gap-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setLightboxImage(res.url)}
                        className="flex-1 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-white/20"
                      >
                        <ZoomIn size={14} /> Zoom
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleSave(res.url);
                        }}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Box size={14} /> Guardar
                      </button>
                    </div>
                    <button 
                      onClick={() => regenerateSingle(idx)}
                      className="w-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white py-2 rounded-xl text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2 transition-colors border border-white/10"
                    >
                      <RefreshCw size={12} /> Generar otra
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-50 text-red-500">
                  <ImageIcon size={24} className="opacity-50" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Error al generar</span>
                  <button onClick={() => regenerateSingle(idx)} className="text-xs font-bold underline mt-2">Reintentar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ImageLightbox isOpen={!!lightboxImage} imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
};
