import React, { useState } from 'react';
import { Sparkles, Copy, Check, Loader2, Wand2, AlertCircle } from 'lucide-react';
import { aiService } from '../services/aiService';
import { motion, AnimatePresence } from 'framer-motion';

export const PromptArchitect: React.FC = () => {
  const [userIdea, setUserIdea] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!userIdea.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await aiService.generateExpertPrompt(userIdea);
      setGeneratedPrompt(result);
      setHasGeneratedOnce(true);
    } catch (err) {
      setError('La IA está un poco ocupada. Intenta de nuevo en un momento.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/50">
      <div className="flex items-center gap-3 border-b border-black/5 pb-4">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <Wand2 size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1F2937]">Arquitecto de Prompts</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ingeniería Técnica v1.0</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
          Idea del Cliente / Concepto Base
        </label>
        <textarea
          value={userIdea}
          onChange={(e) => setUserIdea(e.target.value)}
          placeholder="Ej: Villa brutalista frente al mar, materiales crudos..."
          className="w-full h-32 bg-white/40 border border-white/60 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-[#374151] placeholder:text-[#374151]/30 shadow-inner"
        />
        
        <button
          onClick={handleGenerate}
          disabled={loading || !userIdea.trim()}
          className="w-full py-4 bg-[#1F2937] hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} className="text-emerald-400" />
          )}
          <span className="text-xs uppercase tracking-widest">
            {loading ? 'Procesando...' : hasGeneratedOnce ? '🔄 Generar otro Prompt' : '✨ Generar Prompt Maestro'}
          </span>
        </button>
      </div>

      {/* Error State — visible y suave */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-amber-50/80 border border-amber-200 rounded-2xl px-4 py-3"
          >
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-amber-700 leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {generatedPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 mt-2"
          >
            <div className="flex items-center justify-between ml-1">
               <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Resultado Masterizado
              </label>
              {copied && (
                <motion.span 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1"
                >
                  <Check size={10} /> Copiado al Portapapeles
                </motion.span>
              )}
            </div>
            
            <div className="relative group">
              <textarea
                readOnly
                value={generatedPrompt}
                className="w-full h-40 bg-emerald-50/30 border border-emerald-500/20 rounded-2xl p-5 text-[13px] font-mono leading-relaxed text-gray-700 focus:outline-none cursor-default custom-scrollbar"
              />
              <button
                onClick={handleCopy}
                className="absolute top-4 right-4 p-3 bg-white hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 rounded-xl shadow-md border border-gray-100 transition-all active:scale-90"
                title="Copiar prompt"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!generatedPrompt && !error && (
        <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-12">
            <Sparkles size={48} className="mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-center">IA Esperando Instrucciones</p>
        </div>
      )}
    </div>
  );
};
