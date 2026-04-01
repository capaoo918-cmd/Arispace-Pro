import React, { useState, useEffect } from 'react';
import { useArispaceStore } from '../../store/useArispaceStore';
import { integrationService } from '../../services/integrationService';
import { toPng } from 'html-to-image';
import { ResultModal } from './ResultModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Trash2, 
  Layers, 
  Zap, 
  ShieldCheck,
  Loader2,
  Maximize,
  History,
  Sparkles
} from 'lucide-react';

export const LayersPanel: React.FC = () => {
  const { 
    workspaceItems, 
    allConcepts, 
    removeWorkspaceItem, 
    bringToFrontWorkspaceItem, 
    clearWorkspace, 
    backgroundImage,
    promptHistory,
    addPromptToHistory,
    isHDMode,
    setHDMode
  } = useArispaceStore();
  
  const [magicPrompt, setMagicPrompt] = useState('');
  const [selectedMood, setSelectedMood] = useState('Nórdico Sereno');
  const [lightLevel, setLightLevel] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Arquitecto AI analizando el espacio...');

  const sortedItems = [...workspaceItems].sort((a, b) => b.zIndex - a.zIndex);

  // Animación de mensajes del loader
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      const messages = [
        "Arquitecto AI analizando el espacio...",
        "Calculando texturas de alta fidelidad...",
        "Refinando iluminación arquitectónica...",
        "Sintetizando renders 4K...",
        "Ajustando perspectiva volumétrica...",
        "Finalizando post-producción Arispace..."
      ];
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoaderMessage(messages[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleMagicIntegration = async () => {
    if (!magicPrompt.trim()) return;
    
    setIsGenerating(true);
    // Guardar en historial
    addPromptToHistory(magicPrompt);

    try {
      const canvasRoot = document.getElementById('design-canvas-root');
      if (!canvasRoot) throw new Error("Canvas not found");

      const dataUrl = await toPng(canvasRoot, { cacheBust: true, pixelRatio: 1 });
      
      const moodDict: Record<string, string> = {
        'Nórdico Sereno': 'natural light, minimal decor, light wood, clean airy atmosphere',
        'Brutalismo Industrial': 'raw concrete, exposed pipes, dramatic dark shadows, steel accents',
        'Lujo Contemporáneo': 'gold accents, black marble, warm ambient lighting, velvet textures',
        'Biofílico (Naturaleza)': 'indoor plants, organic curves, green tones, sunlight rays, nature integration'
      };

      const lightDict: Record<number, string> = {
        0: 'early morning light, cool dawn tones, soft diffuse shadows',
        1: 'bright harsh noon sunlight, sharp high-contrast shadows, vivid',
        2: 'golden hour, warm sunset lighting, long dramatic shadows, orange ambient',
        3: 'night time, dark interior, cinematic artificial warm lighting, rim lights'
      };

      const finalPrompt = `Estilo ${selectedMood}. Iluminación: ${lightDict[lightLevel]}. Instrucción: ${magicPrompt}. Mood: ${moodDict[selectedMood]}.`;
      
      const newImageBase64 = await integrationService.integrateWorkspace(
        dataUrl, 
        finalPrompt, 
        workspaceItems, 
        allConcepts, 
        !!backgroundImage,
        isHDMode
      );
      setFinalResult(newImageBase64);
    } catch (err) {
      console.error(err);
      alert("Error en la integración. Revisa la consola.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <aside className="h-full bg-white border-l border-gray-100 p-6 overflow-y-auto flex flex-col font-sans relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        
        {/* Loader Profesional */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="relative mb-8">
                <Loader2 size={48} className="text-emerald-500 animate-spin" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"
                />
              </div>
              <motion.p 
                key={loaderMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm font-bold text-gray-800 tracking-tight"
              >
                {loaderMessage}
              </motion.p>
              <div className="mt-8 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: [-200, 200] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pb-4 border-b border-gray-50 flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-gray-400" />
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">Capas</h3>
          </div>
          {sortedItems.length > 0 && (
            <button 
              onClick={() => clearWorkspace()}
              className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-all active:scale-90"
              title="Limpiar Workspace"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar">
          {sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300 opacity-50">
              <Layers size={32} strokeWidth={1} className="mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Sin elementos</p>
            </div>
          ) : (
            sortedItems.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="group flex flex-col gap-2 bg-white border border-gray-100 p-3 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-inner border border-gray-50 bg-gray-100">
                    <img src={item.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[11px] font-bold text-gray-700">Elemento AI</span>
                    <span className="text-[9px] text-gray-400 font-mono uppercase tracking-tighter">Z-INDEX: {item.zIndex}</span>
                  </div>
                </div>
                <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => bringToFrontWorkspaceItem(item.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-all"
                    title="Traer al frente"
                  >
                    <Maximize size={14} className="rotate-45" />
                  </button>
                  <button 
                    onClick={() => removeWorkspaceItem(item.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                    title="Eliminar"
                  >
                    <Zap size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* AI MAGIC SECTION */}
        <div className="pt-6 border-t border-gray-50 mt-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Post-Producción AI</h4>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase">HD Mode</span>
              <button 
                onClick={() => setHDMode(!isHDMode)}
                className={`w-8 h-4 rounded-full transition-colors relative ${isHDMode ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <motion.div 
                  animate={{ x: isHDMode ? 16 : 2 }}
                  className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Atmósfera</label>
              <select 
                value={selectedMood} 
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              >
                <option>Nórdico Sereno</option>
                <option>Brutalismo Industrial</option>
                <option>Lujo Contemporáneo</option>
                <option>Biofílico (Naturaleza)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between px-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Iluminación</label>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {lightLevel === 0 ? 'Aurora' : lightLevel === 1 ? 'Cenital' : lightLevel === 2 ? 'Sunset' : 'Nocturno'}
                </span>
              </div>
              <input 
                type="range" min="0" max="3" step="1"
                value={lightLevel}
                onChange={(e) => setLightLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <div className="flex justify-between items-center px-1">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Intención de Diseño</label>
               <button 
                 onClick={() => setShowHistory(!showHistory)}
                 className={`p-1 rounded-md transition-colors ${showHistory ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                 title="Historial de Prompts"
               >
                 <History size={14} />
               </button>
            </div>

            <AnimatePresence>
              {showHistory && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 z-50 max-h-48 overflow-y-auto"
                >
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Recientes</p>
                  {promptHistory.length === 0 ? (
                    <p className="text-[10px] text-gray-300 italic px-2 py-4 text-center">Sin historial aún</p>
                  ) : (
                    promptHistory.map((h, i) => (
                      <button 
                        key={i}
                        onClick={() => { setMagicPrompt(h); setShowHistory(false); }}
                        className="w-full text-left p-2 hover:bg-emerald-50 rounded-lg text-[11px] text-gray-600 transition-colors truncate border-b border-gray-50 last:border-0"
                      >
                        {h}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <textarea 
              value={magicPrompt}
              onChange={(e) => setMagicPrompt(e.target.value)}
              className="w-full h-28 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm resize-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder:text-gray-300"
              placeholder="Ej: Mezcla los materiales con la luz de la ventana..."
            />
          </div>

          <button 
            disabled={isGenerating || !magicPrompt.trim() || sortedItems.length === 0}
            onClick={handleMagicIntegration}
            className="group btn-premium w-full py-4 bg-[#1F2937] hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
          >
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm">Dame tu idea...</span>
          </button>
        </div>
      </aside>

      {finalResult && (
        <ResultModal 
          finalImageUrl={finalResult} 
          beforeImageUrl={backgroundImage}
          onClose={() => setFinalResult(null)} 
        />
      )}
    </>
  );
};

