import React from 'react';
import { motion } from 'framer-motion';
import { useArispaceStore } from '../store/useArispaceStore';
import { Layers, Droplets, Hexagon, Sparkles } from 'lucide-react';

export const MoodboardView: React.FC = () => {
  const { colorPalette, currentImageUrl } = useArispaceStore();

  const safePalette = colorPalette?.length > 0 ? colorPalette : ['#E8E6E1', '#5C4033', '#2C3E50', '#95A5A6', '#D5B895'];
  const safeImage = currentImageUrl || 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1920&q=80';

  return (
    <div className="flex h-full w-full gap-6 p-6">
      {/* 75% Canvas Left/Center */}
      <div 
        className="relative flex-grow h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40 bg-white/30 backdrop-blur-sm"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #3741511A 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-white/50 z-10">
          <Layers size={18} className="text-[#374151]" strokeWidth={2.5} />
          <span className="text-xs font-bold text-[#374151] tracking-[0.2em] uppercase">Interactive Canvas</span>
        </div>

        {/* Draggable Swatches */}
        {safePalette.map((hex, index) => (
          <motion.div
            key={`swatch-${index}`}
            drag
            dragMomentum={false}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.1, zIndex: 50 }}
            className="absolute rounded-full shadow-lg cursor-grab active:cursor-grabbing border-[3px] border-white/90 flex flex-col items-center justify-center gap-2 group"
            style={{ 
              backgroundColor: hex,
              width: "100px",
              height: "100px",
              top: `${15 + (index * 12)}%`,
              left: `${10 + (index * 5)}%`,
              zIndex: 10 + index
            }}
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full absolute -bottom-10 shadow-sm border border-white/50 whitespace-nowrap">
              <span className="text-[10px] uppercase font-bold text-[#374151] tracking-wider">{hex}</span>
            </div>
            <span className="text-[9px] uppercase font-extrabold text-white/50 tracking-widest pointer-events-none drop-shadow-md text-center max-w-[80%] leading-tight">
              BASE TEXTURE
            </span>
          </motion.div>
        ))}

        {/* Draggable Generated Image (Polaroid Card) */}
        <motion.div
          drag
          dragMomentum={false}
          whileHover={{ scale: 1.02 }}
          whileDrag={{ scale: 1.05, zIndex: 60, rotate: 2 }}
          initial={{ rotate: -2 }}
          className="absolute top-1/4 left-1/3 bg-white/90 backdrop-blur-md p-3 pb-12 rounded-[1.5rem] shadow-2xl cursor-grab active:cursor-grabbing border border-white/60 pointer-events-auto"
          style={{ width: "380px", zIndex: 20 }}
        >
          <div className="w-full h-[280px] rounded-[1rem] overflow-hidden bg-black/5 shadow-inner">
             <img src={safeImage} alt="Generated Concept" className="w-full h-full object-cover pointer-events-none" />
          </div>
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-[#374151] pointer-events-none">
             <span className="text-xs font-bold tracking-widest uppercase">Base Concept Alpha</span>
             <Sparkles size={14} className="text-[#10B981]" />
          </div>
        </motion.div>
      </div>

      {/* 25% Cohesion Monitor Sidebar */}
      <div className="w-1/4 min-w-[320px] h-full bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-8 flex flex-col gap-8 border border-white/50">
        
        <div className="flex flex-col gap-1">
          <h2 className="text-[#1F2937] font-extrabold text-lg tracking-tight uppercase">Cohesion Monitor</h2>
          <p className="text-xs font-medium text-[#4B5563] tracking-wide">Real-time aesthetic balance analysis</p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex justify-between text-[10px] font-bold text-[#374151] tracking-widest uppercase">
            <span>Base Texture</span>
            <span>70%</span>
          </div>
          <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden flex shadow-inner">
            <div className="h-full bg-[#10B981] transition-all duration-1000 ease-out" style={{ width: '70%' }} />
            <div className="h-full bg-[#8B5CF6] transition-all duration-1000 ease-out border-l border-white/60" style={{ width: '30%' }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-[#4B5563] tracking-widest uppercase text-right">
            <span>Dynamic Contrast</span>
          </div>
        </div>

        {/* Light & Data - Palette List */}
        <div className="flex flex-col gap-4 mt-6 flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <Droplets size={16} className="text-[#374151]" strokeWidth={2.5} />
            <h3 className="text-xs font-bold text-[#374151] tracking-widest uppercase">Light & Data</h3>
          </div>
          
          <div className="flex flex-col gap-4 overflow-y-auto pr-2">
            {safePalette.map((hex, index) => (
              <div key={`list-${index}`} className="flex items-center justify-between bg-white/40 p-3 rounded-2xl border border-white/50 hover:bg-white/60 transition-colors cursor-default group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full shadow-inner border border-black/10 group-hover:scale-110 transition-transform" style={{ backgroundColor: hex }} />
                  <span className="text-sm font-bold text-[#374151] tracking-wider uppercase">{hex}</span>
                </div>
                <Hexagon size={16} className="text-[#374151]/30 group-hover:text-[var(--color-primary)] transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* AI State Suggestion Card */}
        <div className="mt-auto bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <Sparkles size={16} className="text-emerald-600" fill="currentColor" />
            <h4 className="text-xs font-extrabold text-emerald-800 tracking-widest uppercase">AI State: Ideating</h4>
          </div>
          <p className="text-sm font-medium text-emerald-800/80 leading-relaxed italic relative z-10">
            "System suggests adding organic fiber textures to achieve target cohesion and soften the brutalist geometry."
          </p>
        </div>

      </div>
    </div>
  );
};
