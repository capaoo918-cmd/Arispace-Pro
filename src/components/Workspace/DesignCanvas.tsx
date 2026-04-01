import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useArispaceStore } from '../../store/useArispaceStore';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { MaterialPicker, MaterialInfo } from '../../utils/MaterialPicker';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Layers, X, Camera, Lock, Unlock } from 'lucide-react';

// --- Sonido Sutil (Pop de interfaz, liviano) ---
const playSnapSound = () => {
  try {
    const audio = new Audio("data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquq");
    audio.volume = 0.2;
    audio.play().catch(() => {});
  } catch (e) {}
};

interface CanvasItemProps {
  item: any;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  isInspectorMode: boolean;
  onMaterialPick: (data: MaterialInfo | null, x: number, y: number) => void;
}

// OPTIMIZACIÓN: React.memo para evitar re-renders en cascada al mover un solo objeto.
// Solo se re-renderiza si cambian propiedades relevantes del item.
const CanvasItem = React.memo<CanvasItemProps>(
  ({ item, isSelected, onSelect, isInspectorMode, onMaterialPick }) => {
    const { updateItemDimensions } = useArispaceStore();
    
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: `canvas-item-${item.id}`,
      data: { type: 'canvas-item', ...item },
      disabled: isInspectorMode,
    });

    const [localSize, setLocalSize] = useState({ w: item.width || 250, h: item.height || 250 });
    const [localRot, setLocalRot] = useState(item.rotation || 0);

    const sizeRef = useRef(localSize);
    const rotRef = useRef(localRot);

    useEffect(() => {
      sizeRef.current = localSize;
      rotRef.current = localRot;
    }, [localSize, localRot]);

    // Sync desde el store si se carga una versión guardada
    useEffect(() => {
      setLocalSize({ w: item.width || 250, h: item.height || 250 });
      setLocalRot(item.rotation || 0);
    }, [item.width, item.height, item.rotation]);

    const x = item.x + (transform?.x || 0);
    const y = item.y + (transform?.y || 0);

    // BLINDAJE: AbortController para limpiar listeners automáticamente al desmontar
    const handlePointerDownAction = useCallback((e: React.PointerEvent, action: 'resize' | 'rotate') => {
      e.stopPropagation();
      if (isInspectorMode) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const startW = sizeRef.current.w;
      const startH = sizeRef.current.h;

      const rect = (e.target as HTMLElement).closest('.canvas-item-container')?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // AbortController limpia ambos listeners automáticamente
      const controller = new AbortController();
      const { signal } = controller;

      const onPointerMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();
        if (action === 'resize') {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          setLocalSize({ w: Math.max(50, startW + deltaX), h: Math.max(50, startH + deltaY) });
        } else if (action === 'rotate') {
          const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
          setLocalRot((angle + 90) % 360);
        }
      };

      const onPointerUp = () => {
        // Persistir en el store y limpiar AMBOS listeners con un solo abort()
        updateItemDimensions(item.id, sizeRef.current.w, sizeRef.current.h, rotRef.current);
        controller.abort();
      };

      window.addEventListener('pointermove', onPointerMove, { signal });
      window.addEventListener('pointerup', onPointerUp, { signal, once: true });
    }, [isInspectorMode, item.id, updateItemDimensions]);

    const handleInspectClick = useCallback(async (e: React.PointerEvent) => {
      if (!isInspectorMode) {
        onSelect(item.id);
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      onMaterialPick(null, e.clientX, e.clientY); // Estado de carga

      const rect = e.currentTarget.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const py = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      try {
        const data = await MaterialPicker.analyzePixel(item.imageUrl, px, py);
        onMaterialPick(data, e.clientX, e.clientY);
      } catch {
        // Error de análisis silenciado en producción
      }
    }, [isInspectorMode, item.id, item.imageUrl, onSelect, onMaterialPick]);

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        ref={setNodeRef}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          zIndex: isDragging ? 99999 : item.zIndex,
          width: localSize.w,
          height: localSize.h,
          transform: `rotate(${localRot}deg)`,
          transformOrigin: 'center center',
        }}
        className={`canvas-item-container ${isInspectorMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing outline-none'}`}
      >
        <div
          {...(!isInspectorMode ? listeners : {})}
          {...attributes}
          onPointerDown={handleInspectClick}
          className={`w-full h-full relative group transition-all duration-300
            ${isSelected && !isInspectorMode ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:ring-1 hover:ring-gray-300'}
            ${isDragging ? 'ring-4 ring-indigo-500 shadow-2xl scale-[1.02] opacity-90' : ''}`}
        >
          {/* OPTIMIZACIÓN: mix-blend-mode aplicado directamente en <img>,
              no en el contenedor div, para evitar forced reflows en Safari/Firefox */}
          <img
            src={item.imageUrl}
            alt="Item del Lienzo"
            className="w-full h-full object-contain pointer-events-none rounded-sm"
            style={{ mixBlendMode: item.blendMode === 'multiply' ? 'multiply' : 'normal' }}
          />

          {isSelected && !isInspectorMode && (
            <>
              {/* Resize Handle (esquina inferior derecha) */}
              <div
                onPointerDown={(e) => handlePointerDownAction(e, 'resize')}
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-50"
              />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize shadow-md z-50" />
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize shadow-md z-50" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize shadow-md z-50" />

              {/* Rotation Handle (parte superior central) */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-50">
                <div
                  onPointerDown={(e) => handlePointerDownAction(e, 'rotate')}
                  className="w-4 h-4 bg-amber-400 border-2 border-white rounded-full cursor-grab active:cursor-grabbing shadow-md hover:scale-125 transition-transform"
                />
                <div className="w-px h-4 bg-blue-500/50" />
              </div>

              {/* Blend Mode Toggle */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-100 animate-in fade-in zoom-in duration-300 z-[60]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextMode = item.blendMode === 'multiply' ? 'normal' : 'multiply';
                    useArispaceStore.getState().updateItemBlendMode(item.id, nextMode);
                  }}
                  className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-colors ${item.blendMode === 'multiply' ? 'text-emerald-600' : 'text-gray-400'}`}
                >
                  <Droplet size={11} className={item.blendMode === 'multiply' ? 'fill-emerald-500' : ''} />
                  {item.blendMode === 'multiply' ? 'Multiply ON' : 'Normal'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  },
  // Función de comparación: solo re-renderizar si cambió algo relevante
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.item.x === next.item.x &&
    prev.item.y === next.item.y &&
    prev.item.width === next.item.width &&
    prev.item.height === next.item.height &&
    prev.item.rotation === next.item.rotation &&
    prev.item.blendMode === next.item.blendMode &&
    prev.item.imageUrl === next.item.imageUrl &&
    prev.isSelected === next.isSelected &&
    prev.isInspectorMode === next.isInspectorMode
);

CanvasItem.displayName = 'CanvasItem';

export const DesignCanvas: React.FC = () => {
  const {
    workspaceItems,
    isInspectorMode,
    toggleInspectorMode,
    savedMaterials,
    addTextureToWorkspace,
    backgroundImage,
    isBackgroundLocked,
    layerOpacity,
    setBackgroundImage,
    toggleBackgroundLock,
    setLayerOpacity,
  } = useArispaceStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setNodeRef } = useDroppable({ id: 'design-canvas-droppable' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectorData, setInspectorData] = useState<{ data: MaterialInfo | null; x: number; y: number } | null>(null);
  const [showMiniExplorer, setShowMiniExplorer] = useState(false);

  // Sonido al agregar nuevo item al canvas
  const prevItemsLength = React.useRef(workspaceItems.length);
  React.useEffect(() => {
    if (workspaceItems.length > prevItemsLength.current) {
      playSnapSound();
    }
    prevItemsLength.current = workspaceItems.length;
  }, [workspaceItems.length]);

  const handleCanvasClick = () => {
    setSelectedId(null);
    if (isInspectorMode) setInspectorData(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBackgroundImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <main
      id="design-canvas-root"
      ref={setNodeRef}
      onPointerDown={handleCanvasClick}
      className={`relative flex-1 h-[700px] w-full overflow-hidden droppable-zone
        ${isInspectorMode ? 'bg-[#e2e8f0]' : 'bg-[#f8fafc]'}`}
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '-10px -10px',
      }}
    >
      {/* Controles superiores del canvas */}
      <div className="absolute top-4 left-4 z-[999] flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); toggleInspectorMode(); setInspectorData(null); setSelectedId(null); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-colors
            ${isInspectorMode ? 'bg-blue-500 text-white border-blue-600 shadow-inner' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
        >
          <Droplet size={14} /> Inspector de Materiales
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setShowMiniExplorer(true); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border-gray-200 transition-colors"
        >
          <Layers size={14} /> Muestras de Tela
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700 transition-colors"
        >
          <Camera size={14} />
          {backgroundImage ? 'Cambiar Espacio' : 'Cargar Foto del Espacio'}
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>

      {/* Capa de fondo del espacio */}
      {backgroundImage && (
        <div
          className={`absolute inset-0 z-0 pointer-events-none ${isBackgroundLocked ? 'pointer-events-none' : ''}`}
          style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        />
      )}

      {/* Controles de opacidad y bloqueo de fondo */}
      {backgroundImage && (
        <div className="absolute top-20 left-4 z-[999] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-4 min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Estudio de Fondo</span>
            <button
              onClick={(e) => { e.stopPropagation(); toggleBackgroundLock(); }}
              className={`p-1.5 rounded-lg transition-colors ${isBackgroundLocked ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
              title={isBackgroundLocked ? 'Fondo Bloqueado' : 'Fondo Móvil'}
            >
              {isBackgroundLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase text-gray-400">Opacidad Mobiliario</span>
              <span className="text-[10px] font-mono font-bold text-gray-800">{Math.round(layerOpacity * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.01" value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Marca de agua Arispace */}
      <div className="absolute bottom-6 right-6 z-[900] pointer-events-none opacity-[0.15] flex flex-col items-end select-none mix-blend-multiply drop-shadow-sm">
        <h1 className="text-5xl font-extrabold tracking-tighter text-[#1F2937] leading-none">A R I S P A C E</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-12 h-[1px] bg-[#1F2937]" />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#1F2937]">Arch Suite</span>
        </div>
      </div>

      {/* Capa de items del workspace */}
      <div className="relative z-10 w-full h-full" style={{ opacity: layerOpacity }}>
        {workspaceItems.map(item => (
          <CanvasItem
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onSelect={setSelectedId}
            isInspectorMode={isInspectorMode}
            onMaterialPick={(data, x, y) => setInspectorData({ data, x, y })}
          />
        ))}
      </div>

      {workspaceItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none">
          <p className="font-bold text-xl uppercase tracking-widest bg-white/50 px-6 py-2 rounded-xl backdrop-blur-sm border border-gray-100">
            Lienzo Vacío (Grilla Activa)
          </p>
        </div>
      )}

      {/* Mini Explorador de Texturas */}
      <AnimatePresence>
        {showMiniExplorer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm pointer-events-auto"
            onClick={() => setShowMiniExplorer(false)}
          >
            <div
              className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Layers size={20} /></div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">Explorador de Texturas</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Tus materiales guardados</p>
                  </div>
                </div>
                <button onClick={() => setShowMiniExplorer(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
                {savedMaterials.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-sm text-gray-400 italic">No hay materiales guardados en el laboratorio.</p>
                  </div>
                ) : (
                  savedMaterials.map(mat => (
                    <div
                      key={mat.id}
                      onClick={() => { addTextureToWorkspace(mat); setShowMiniExplorer(false); }}
                      className="group cursor-pointer flex flex-col gap-2"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-transform group-hover:scale-105 group-active:scale-95">
                        <img src={mat.imageUrl} alt={mat.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-center text-gray-600 tracking-wider group-hover:text-emerald-600 transition-colors">{mat.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inspector Tooltip */}
      {isInspectorMode && inspectorData && (
        <div
          className="fixed z-[100000] bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl p-4 rounded-2xl flex flex-col gap-3 min-w-[200px] pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
          style={{ left: inspectorData.x, top: inspectorData.y }}
        >
          {inspectorData.data ? (
            <>
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <div className="w-8 h-8 rounded-full shadow-inner border border-gray-200" style={{ backgroundColor: inspectorData.data.hex }} />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Pixel Detectado</span>
                  <span className="font-mono text-sm font-bold text-gray-800">{inspectorData.data.hex}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-blue-500">Material Predominante</span>
                <span className="text-sm font-bold text-gray-700">{inspectorData.data.material}</span>
              </div>
              <div className="flex flex-col gap-1 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-emerald-600">Sugerencia de Combinación</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: inspectorData.data.complementary.split(' ')[0] }} />
                  <span className="text-xs font-bold text-gray-600">{inspectorData.data.complementary}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-2 animate-pulse text-xs font-bold text-gray-500">
              Analizando fotones...
            </div>
          )}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45" />
        </div>
      )}
    </main>
  );
};
