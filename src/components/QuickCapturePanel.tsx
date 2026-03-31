import React, { useState } from 'react';
import { UploadCloud, FileText, ChevronRight, ChevronLeft, Save, Sparkles } from 'lucide-react';
import { useAutosave } from '../hooks/useAutosave';

export const QuickCapturePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ideaText, setIdeaText] = useState('');

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 -translate-y-1/2 transition-all duration-500 z-50 bg-white/60 backdrop-blur-md p-3 rounded-l-2xl shadow-luxury border-y border-l border-white/50 hover:bg-white flex flex-col items-center gap-2 text-[var(--color-primary)] group shadow-sm opacity-90 hover:opacity-100 ${isOpen ? 'right-[320px]' : 'right-0'}`}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Floating Glass Panel */}
      <div 
        className={`fixed top-0 right-0 h-screen w-[320px] bg-white/60 backdrop-blur-xl shadow-2xl border-l border-white/50 transition-transform duration-500 z-40 flex flex-col p-8 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <h3 className="text-lg font-bold text-[#1F2937] mb-8 flex items-center justify-between border-b border-black/5 pb-4">
          <span>Quick Capture</span>
          <Sparkles size={16} className="text-[var(--color-accent)]" />
        </h3>

        {/* Note Taking Area */}
        <div className="flex-1 flex flex-col gap-4">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#374151]/50">Emergent Ideas</label>
          <textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="Write down a sudden inspirational thought..."
            className="flex-grow w-full bg-white/50 border border-white/50 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] resize-none text-[#374151] placeholder:text-[#374151]/40 transition-shadow shadow-inner"
          />

          <div className="flex flex-col gap-3 mt-6">
            <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-white hover:bg-white/80 active:scale-95 transition-all text-[#374151] border border-white/80 font-bold rounded-xl shadow-sm group text-sm">
              <Save size={16} className="group-hover:scale-110 transition-transform text-[var(--color-primary)]" />
              <span>Guardar Idea</span>
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--color-accent)] hover:brightness-105 active:scale-95 transition-all text-white font-bold rounded-xl shadow-md group text-sm">
              <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
              <span>Generar con IA</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
