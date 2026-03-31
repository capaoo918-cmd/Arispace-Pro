import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { WelcomeHeader } from './WelcomeHeader';
import { useArispaceStore } from '../store/useArispaceStore';
import { aiService } from '../services/aiService';

export const IcebreakerView: React.FC = () => {
  const { aestheticScore, colorPalette, conceptDescription, currentImageUrl, setConceptData } = useArispaceStore();
  const [localPrompt, setLocalPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  // Safe Rendering Variables
  const safeScore = aestheticScore ?? 0.00;
  const isAnalyzed = safeScore > 0;

  const displayScore = isAnalyzed ? safeScore.toFixed(2) : '0.84';
  const orderWidth = isAnalyzed ? `${Math.min(100, safeScore * 105)}%` : '78%';
  const complexityWidth = isAnalyzed ? `${Math.min(100, safeScore * 95)}%` : '89%';

  const handleEvolve = async () => {
    if (!localPrompt?.trim()) return;

    setLoading(true);
    setApiError(false);

    try {
      const result = await aiService.generateConcept(localPrompt);
      // Safe state injection
      setConceptData(
        localPrompt,
        result?.score ?? 0.85,
        result?.palette ?? [],
        result?.description ?? "Undefined Atmosphere",
        result?.imageUrl ?? ''
      );
    } catch (err) {
      setApiError(true);
      setTimeout(() => setApiError(false), 5000); // Se oculta elegantemente tras 5s
    } finally {
      setLoading(false);
      setLocalPrompt('');
    }
  };

  const iterations = [
    {
      title: "Monolithic Brutalism",
      desc: "Emphasizes raw concrete textures with sharp, imposing geometrical scales.",
      img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      score: "0.82"
    },
    {
      title: "Bio-Organic Fluidity",
      desc: "Integrates curved boundaries and natural light wells mimicking organic growth.",
      img: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=80",
      score: "0.91"
    },
    {
      title: "Ethereal Glass Grid",
      desc: "Maximizes transparency with a rigid steel lattice, blurring indoor and outdoor.",
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      score: "0.87"
    }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto hide-scrollbar pb-12">
      <div className="w-full flex-grow flex flex-col gap-10">

        {/* Header & Title */}
        <div>
          <WelcomeHeader />
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] mt-8 font-sans drop-shadow-sm">
            The Icebreaker
          </h1>
        </div>

        {/* Top Section: Metrics + Hero Visuals */}
        <div className="flex flex-col xl:flex-row gap-8 w-full relative z-10">

          {/* Left Panel: Advanced Aesthetic Metrics */}
          <div className="w-full xl:w-1/3 flex flex-col gap-8 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 shadow-sm border border-white/50 h-full">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[#374151]/50 font-bold mb-2">
                Aesthetic Score
              </span>
              <span className="text-7xl font-light tracking-tighter text-[var(--color-primary)] font-sans">
                M={displayScore}
              </span>
            </div>

            <div className="flex flex-col gap-6 mt-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-xs font-bold text-[#374151]">
                  <span className="tracking-widest uppercase">Orden (O)</span>
                  <span>{isAnalyzed ? (safeScore * 0.85).toFixed(2) : '0.78'}</span>
                </div>
                <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] transition-all duration-1000 ease-out rounded-full" style={{ width: orderWidth }} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-xs font-bold text-[#374151]">
                  <span className="tracking-widest uppercase">Complejidad (C)</span>
                  <span>{isAnalyzed ? (safeScore * 0.95).toFixed(2) : '0.89'}</span>
                </div>
                <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B5CF6] transition-all duration-1000 ease-out rounded-full" style={{ width: complexityWidth }} />
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-black/5 pt-6 flex flex-col gap-4">
              <p className="text-sm font-medium text-[#4B5563] italic leading-relaxed">
                {isAnalyzed
                  ? conceptDescription
                  : "The relationship between Order and Complexity suggests a highly legible yet intriguingly complex spatial arrangement, optimizing cognitive engagement while maintaining serenity."}
              </p>

              {/* Intelligent Color Palette Injection con Optional Chaining restrictivo */}
              {isAnalyzed && (colorPalette?.length ?? 0) > 0 && (
                <div className="flex gap-2 mt-2">
                  {colorPalette?.map((hex, i) => (
                    <div
                      key={`palette-${i}`}
                      className="w-10 h-10 rounded-full shadow-md border-2 border-white/50 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: hex ?? '#000000' }}
                      title={hex ?? 'Unknown Color'}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Hero Image Viewer & Input */}
          <div className="w-full xl:w-2/3 flex flex-col relative bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-white/50 min-h-[600px] overflow-hidden">

            {/* Main Canvas */}
            <div className="absolute inset-0 bottom-[120px] p-6">
              <div className="w-full h-full rounded-[2rem] overflow-hidden relative bg-white/40 border border-white/50 flex items-center justify-center shadow-inner group">
                {currentImageUrl ? (
                  <>
                      <img
                        key={currentImageUrl}
                        src={currentImageUrl}
                        alt="Hero Concept"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#374151]">Aesthetic Score:</span>
                      <span className="text-xs font-extrabold text-[var(--color-primary)]">{displayScore}</span>
                    </div>
                  </>
                ) : (
                  <ImageIcon size={64} className="text-[#374151]/10" strokeWidth={1} />
                )}

                {loading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-10 transition-opacity gap-4">
                    <Loader2 size={48} className="text-[var(--color-primary)] animate-spin" strokeWidth={2} />
                    <span className="text-xs font-bold tracking-[0.2em] text-[#374151]/50 uppercase">Thinking...</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Error Toast Overlay */}
            {apiError && (
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 bg-red-500/10 backdrop-blur-md border border-red-500/30 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <AlertCircle size={18} className="text-red-500" strokeWidth={2.5} />
                <span className="text-xs font-bold text-red-600 tracking-widest uppercase">AI API Error</span>
              </div>
            )}

            {/* Input Field Bottom */}
            <div className="absolute bottom-6 left-6 right-6 z-20">
              <div className="flex gap-4 items-center bg-white/70 backdrop-blur-xl p-3 rounded-[2rem] shadow-sm border border-white/60">
                <input
                  type="text"
                  value={localPrompt}
                  onChange={(e) => setLocalPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEvolve()}
                  placeholder="Describe the atmosphere, material weight, or structural mood..."
                  className="flex-grow bg-white/50 border border-white/40 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-[#374151] placeholder:text-[#374151]/40 shadow-inner transition-all hover:bg-white/70"
                />
                <button
                  onClick={handleEvolve}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all text-white font-bold rounded-2xl px-8 py-4 shadow-sm min-w-[190px]"
                >
                  <span className="text-sm tracking-wide">{loading ? 'Thinking...' : 'Evolve Concept ✨'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Derived Stylistic Iterations Grid */}
        <div className="flex flex-col gap-6 w-full relative z-10 pt-4 cursor-default">
          <div className="flex items-center gap-4 border-b border-black/5 pb-4">
            <h3 className="text-lg font-bold text-[#1F2937] tracking-tight">Derived Stylistic Iterations</h3>
            {isAnalyzed && <span className="text-[10px] uppercase tracking-widest bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold px-3 py-1 rounded-full text-center">3 Variations</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {iterations.map((iter, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-md rounded-[2rem] p-4 shadow-sm border border-white/50 flex flex-col gap-4 group hover:shadow-lg transition-all cursor-pointer">
                <div className="w-full h-48 rounded-2xl overflow-hidden relative shadow-inner bg-black/5">
                  {isAnalyzed ? (
                    <>
                      <img src={iter.img} alt={iter.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-white/50 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#374151]">Score:</span>
                        <span className="text-[10px] font-extrabold text-[var(--color-primary)]">{iter.score}</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-[#374151]/10" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="px-2 pb-2 flex flex-col gap-1">
                  <h4 className="font-bold text-[#1F2937] text-sm flex items-center gap-2 tracking-tight">
                    {iter.title}
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 text-[var(--color-primary)]" />
                  </h4>
                  <p className="text-xs text-[#4B5563] leading-relaxed font-medium">
                    {iter.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
