import React, { useState } from 'react';
import { Save, Sparkles, Trash2, Clock, Plus, X, Loader2 } from 'lucide-react';
import { useArispaceStore } from '../store/useArispaceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';

export const QuickCapturePanel: React.FC = () => {
  const { savedThoughts, addThought, deleteThought, addAssetToWorkspace } = useArispaceStore();
  const [ideaText, setIdeaText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tempAiResult, setTempAiResult] = useState<{ imageUrl: string, prompt: string } | null>(null);

  const handleSaveThought = () => {
    if (!ideaText.trim()) return;
    addThought(ideaText);
    setIdeaText('');
    // Simple toast effect could be added here
  };

  const handleAiGenerate = async () => {
    if (!ideaText.trim()) return;
    setIsGenerating(true);
    try {
      const result = await aiService.generateConcept(ideaText);
      setTempAiResult({ imageUrl: result.imageUrl, prompt: ideaText });
    } catch (err) {
      console.error(err);
      alert("Error al generar idea rápida.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addToCanvas = () => {
    if (!tempAiResult) return;
    addAssetToWorkspace({
      id: Date.now().toString(),
      assetId: 'quick-capture-' + Date.now(),
      imageUrl: tempAiResult.imageUrl,
      x: 100,
      y: 100,
      zIndex: 100,
      width: 200,
      height: 200,
      rotation: 0
    });
    setTempAiResult(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Sparkles size={18} className="text-emerald-500" />
           <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">Quick Capture</h3>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner">
        <textarea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder="Escribe una idea emergente..."
          className="w-full h-24 bg-transparent text-sm resize-none focus:outline-none placeholder:text-gray-400 font-medium leading-relaxed"
        />
        <div className="flex gap-2 mt-4">
          <button 
            onClick={handleSaveThought}
            disabled={!ideaText.trim()}
            className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-bold rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save size={14} className="text-emerald-500" />
            Guardar Idea
          </button>
          <button 
            onClick={handleAiGenerate}
            disabled={!ideaText.trim() || isGenerating}
            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generar IA
          </button>
        </div>
      </div>

      {/* Historial de Ideas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={12} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ideas Guardadas</span>
        </div>
        
        <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
          {savedThoughts.length === 0 ? (
            <p className="text-[11px] text-gray-300 italic py-4 text-center">No hay notas rápidas aún.</p>
          ) : (
            savedThoughts.map((thought) => (
              <motion.div 
                layout
                key={thought.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group p-3 bg-white border border-gray-50 rounded-xl hover:border-emerald-100 hover:shadow-md transition-all relative overflow-hidden"
              >
                <p className="text-[11px] text-gray-600 leading-relaxed pr-6">{thought.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-bold text-gray-300 flex items-center gap-1">
                    <Clock size={8} /> {thought.timestamp}
                  </span>
                  <button 
                    onClick={() => deleteThought(thought.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* AI Quick Preview Modal */}
      <AnimatePresence>
        {tempAiResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setTempAiResult(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-black rounded-full backdrop-blur-md z-10 transition-all"
              >
                <X size={20} />
              </button>

              <div className="w-full aspect-square bg-gray-100">
                <img src={tempAiResult.imageUrl} alt="AI Result" className="w-full h-full object-cover" />
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resultado de Idea</span>
                </div>
                <p className="text-sm font-bold text-gray-800 leading-snug mb-8">"{tempAiResult.prompt}"</p>
                
                <button 
                  onClick={addToCanvas}
                  className="w-full py-4 bg-[#1F2937] hover:bg-black text-white font-bold rounded-2xl transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-95"
                >
                  <Plus size={18} />
                  Añadir al Lienzo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

