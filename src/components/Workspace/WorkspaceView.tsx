import React from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { AssetSidebar } from './AssetSidebar';
import { DesignCanvas } from './DesignCanvas';
import { LayersPanel } from './LayersPanel';
import { QuickCapturePanel } from '../QuickCapturePanel';
import { useArispaceStore } from '../../store/useArispaceStore';
import { v4 as uuidv4 } from 'uuid';
import { Camera, Maximize, Minimize, LayoutTemplate } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { CreativeAssistant } from '../CreativeAssistant';
import { ShortcutHint } from './ShortcutHint';

export const WorkspaceView: React.FC = () => {
  const { addAssetToWorkspace, updateItemPosition, workspaceItems, saveCurrentVersion } = useArispaceStore();
  
  const [isSaving, setIsSaving] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isPresenting, setIsPresenting] = React.useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    if (String(active.id).startsWith('canvas-item-')) {
      const data = active.data.current;
      if (data && data.type === 'canvas-item') {
        const dropX = data.x + delta.x;
        const dropY = data.y + delta.y;
        updateItemPosition(data.id, dropX, dropY);
      }
      return;
    }
    
    if (!over) return;
    
    if (String(active.id).startsWith('sidebar-asset-') && over.id === 'design-canvas-droppable') {
      const data = active.data.current;
      if (!data) return;

      const translated = active.rect.current.translated;
      if (translated) {
        const canvasRect = document.getElementById('design-canvas-root')?.getBoundingClientRect();
        
        let dropX = 100;
        let dropY = 100;

        if (canvasRect) {
           dropX = translated.left - canvasRect.left;
           dropY = translated.top - canvasRect.top;
        }

        const maxZ = workspaceItems.reduce((max, item) => Math.max(max, item.zIndex), 0);
        addAssetToWorkspace({
          id: uuidv4(),
          assetId: data.assetId,
          imageUrl: data.imageUrl,
          x: Math.max(0, dropX), 
          y: Math.max(0, dropY),
          zIndex: maxZ + 1,
          width: 250,
          height: 250,
          rotation: 0,
          blendMode: 'normal'
        });
      }
    }
  };

  const handleSnapshot = async () => {
    const name = window.prompt("Nombre de esta versión de diseño:");
    if (!name) return;
    setIsSaving(true);
    try {
      const root = document.getElementById('design-canvas-root');
      if (root) {
        const dataUrl = await toPng(root, { cacheBust: true, pixelRatio: 1 });
        saveCurrentVersion(name, dataUrl);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <motion.div 
        animate={{ backgroundColor: isFullscreen ? '#0F172A' : '#ffffff' }}
        className="grid grid-cols-[auto_1fr_auto] gap-0 h-screen w-full overflow-hidden relative transition-colors duration-700"
      >
        <AnimatePresence>
          {!isFullscreen && !isPresenting && (
            <motion.div 
              initial={{ width: 0, opacity: 0, x: -100 }}
              animate={{ width: 280, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="h-full overflow-hidden border-r border-gray-100 bg-white relative z-[60] shadow-xl"
            >
              <AssetSidebar />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isFullscreen && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-2 border-r border-gray-100 pr-4 mr-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Arispace Studio</span>
            </div>

            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2 bg-gray-50 text-[#1F2937] hover:bg-white px-4 py-2 rounded-xl shadow-sm font-bold text-[10px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border border-gray-100"
            >
              <Maximize size={14} className="text-blue-500" />
              <span>Modo Cine</span>
            </button>

            <button 
              onClick={() => setIsPresenting(!isPresenting)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm font-bold text-[10px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border
                ${isPresenting ? 'bg-[#1F2937] text-white border-transparent' : 'bg-gray-50 text-[#1F2937] hover:bg-white border-gray-100'}`}
            >
              <LayoutTemplate size={14} className={isPresenting ? 'text-emerald-400' : 'text-indigo-500'} />
              <span>{isPresenting ? 'Salir Zen' : 'Modo Zen'}</span>
            </button>

            <button 
              onClick={() => window.location.hash = 'reports'}
              className="flex items-center gap-2 bg-gray-50 text-[#1F2937] hover:bg-white px-4 py-2 rounded-xl shadow-sm font-bold text-[10px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border border-gray-100"
            >
              📋 Reporte
            </button>
            
            <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>

            <button 
              onClick={handleSnapshot}
              disabled={isSaving || workspaceItems.length === 0}
              className="flex items-center gap-2 bg-[#1F2937] hover:bg-black text-white px-6 py-2 rounded-xl shadow-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 hover:scale-105 active:scale-95 border border-white/10"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando...
                </span>
              ) : (
                <><Camera size={14} className="text-emerald-400" /> Exportar Snapshot</>
              )}
            </button>
          </div>
        )}

        {isFullscreen && (
           <button 
            onClick={() => setIsFullscreen(false)}
            className="fixed top-8 right-8 z-[200] bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-full transition-all border border-white/20 shadow-2xl group"
          >
            <Minimize size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        )}

        <DesignCanvas />
        <CreativeAssistant />

        <AnimatePresence>
          {!isFullscreen && !isPresenting && (
            <motion.div 
              initial={{ width: 0, opacity: 0, x: 100 }}
              animate={{ width: 320, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 100 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="h-full overflow-hidden border-l border-gray-100 bg-white flex flex-col p-4 gap-6 custom-scrollbar overflow-y-auto relative z-[60] shadow-xl"
            >
              <LayersPanel />
              <div className="border-t border-gray-50 pt-6">
                 <QuickCapturePanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ShortcutHint />
      </motion.div>
    </DndContext>
  );
};
