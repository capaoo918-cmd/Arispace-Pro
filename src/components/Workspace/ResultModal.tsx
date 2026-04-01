import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, X, Maximize2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ResultModalProps {
  finalImageUrl: string;
  beforeImageUrl: string | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ finalImageUrl, beforeImageUrl, onClose }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = finalImageUrl;
    link.download = `arispace-premium-render-${Date.now()}.png`;
    link.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#0F172A]/90 backdrop-blur-md"
    >
      <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden border border-white/20">
        
        {/* Header de Presentación */}
        <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none">Render Final Arispace</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Virtual Staging Engine v1.0</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-gray-200 rounded-full transition-all text-gray-400 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Studio Comparison Area */}
        <div className="flex-1 p-8 bg-gray-100/30 overflow-hidden">
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            className="w-full h-full relative rounded-[2rem] overflow-hidden shadow-2xl cursor-col-resize select-none bg-black group"
          >
            {/* Antes (Original o Placeholder si no hay fondo) */}
            <div className="absolute inset-0">
              {beforeImageUrl ? (
                <img src={beforeImageUrl} alt="Original" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500">
                  <ImageIcon size={48} className="mb-4 opacity-20" />
                  <span className="text-xs font-bold uppercase tracking-widest">Sin Fondo Original</span>
                </div>
              )}
              <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                Propuesta Inicial / Collage
              </div>
            </div>

            {/* Después (Render AI) */}
            <div 
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img src={finalImageUrl} alt="Integrated Render" className="w-full h-full object-contain" />
              <div className="absolute top-6 right-6 px-4 py-2 bg-emerald-500/80 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-lg">
                ✨ Arispace AI Render (Final)
              </div>
            </div>

            {/* Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white/80 backdrop-blur-sm z-50 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl border-4 border-emerald-500 flex items-center justify-center group-hover:scale-125 transition-transform">
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-3 bg-gray-300 rounded-full" />
                  <div className="w-0.5 h-3 bg-gray-300 rounded-full" />
                  <div className="w-0.5 h-3 bg-gray-300 rounded-full" />
                </div>
              </div>
            </div>

            {/* Hint contextual */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <span className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Maximize2 size={12} /> Desliza para comparar
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-8 flex items-center justify-between bg-white border-t border-gray-100">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resultado Optomizado</span>
              <div className="flex gap-3">
                 <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                   <Sparkles size={14} /> 4K Resolution
                 </span>
                 <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                   Photorealistic 2.0
                 </span>
              </div>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all active:scale-95 border border-gray-200"
              >
                Volver al Diseño
              </button>
              <button 
                onClick={handleDownload}
                className="px-10 py-3 bg-[#1F2937] hover:bg-black text-white font-bold rounded-2xl transition-all shadow-xl shadow-gray-200 flex items-center gap-2 hover:scale-105 active:scale-95 group"
              >
                <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                Descargar Portafolio
              </button>
           </div>
        </div>

      </div>
    </motion.div>
  );
};

