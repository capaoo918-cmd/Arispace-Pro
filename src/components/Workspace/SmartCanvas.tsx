import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { useArispaceStore, WorkspaceItem } from '../../store/useArispaceStore';
import { CanvasObject } from './CanvasObject';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, MousePointer2 } from 'lucide-react';
import Konva from 'konva';

export const SmartCanvas: React.FC = () => {
  const { 
    workspaceItems, 
    addAssetToWorkspace, 
    bringToFrontWorkspaceItem, 
    sendToBackWorkspaceItem,
    removeWorkspaceItem
  } = useArispaceStore();
  
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null);

  // Sync stage size with container
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle Zoom (Wheel)
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.05;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const limitedScale = Math.max(0.1, Math.min(5, newScale));

    setScale(limitedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    });
  };

  // Handle Drop from Sidebar
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage || !containerRef.current) return;

    // Get asset data from DnD transfer
    const draggingData = localStorage.getItem('arispace_dragging_asset');
    if (!draggingData) return;

    const { imageUrl, type } = JSON.parse(draggingData);
    
    // Register pointer position relative to stage
    stage.setPointersPositions(e);
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    // Convert screen coordinates to stage coordinates
    const stageScale = stage.scaleX();
    const dropX = (pointerPosition.x - stage.x()) / stageScale;
    const dropY = (pointerPosition.y - stage.y()) / stageScale;

    const maxZ = workspaceItems.reduce((max, item) => Math.max(max, item.zIndex), 0);
    
    addAssetToWorkspace({
      id: crypto.randomUUID(),
      assetId: 'external',
      imageUrl,
      x: dropX - 150, // Center relative to 300px default (0 logic in CanvasObject handles exact scaling)
      y: dropY - 150,
      zIndex: maxZ + 1,
      width: 0, // Signal for CanvasObject to auto-size
      height: 0,
      rotation: 0,
      isInExport: true,
      type: type || 'object'
    });
    
    localStorage.removeItem('arispace_dragging_asset');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleContextAction = (action: 'front' | 'back' | 'delete') => {
    if (!contextMenu) return;

    if (action === 'front') bringToFrontWorkspaceItem(contextMenu.id);
    if (action === 'back') sendToBackWorkspaceItem(contextMenu.id);
    if (action === 'delete') {
      removeWorkspaceItem(contextMenu.id);
      setSelectedId(null);
    }
    setContextMenu(null);
  };

  const handleStageMouseDown = (e: any) => {
    // Deselect if clicked on background
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      setContextMenu(null);
      return;
    }
    
    // Context Menu Handling
    if (e.evt.button === 2) { // Right Click
      e.evt.preventDefault();
      setContextMenu({ x: e.evt.clientX, y: e.evt.clientY, id: e.target.id() });
    }
  };

  return (
    <div 
      className="relative flex-1 h-full w-full bg-[#f8fafc] overflow-hidden" 
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        draggable={!selectedId} // Only pan stage if no object is selected
        onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
      >
        <Layer id="grid-layer">
           {/* Dynamic Grid */}
           <Rect 
             x={-position.x / scale - 5000} 
             y={-position.y / scale - 5000} 
             width={10000 / scale}
             height={10000 / scale}
             fillPriority="pattern"
             fillPatternImage={(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 40;
                canvas.height = 40;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.strokeStyle = '#cbd5e1';
                  ctx.lineWidth = 0.5;
                  ctx.strokeRect(0, 0, 40, 40);
                }
                return canvas as any;
             })()}
             listening={false}
           />
        </Layer>
        
        <Layer id="main-layer">
          {workspaceItems
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((item) => (
              <CanvasObject 
                key={item.id} 
                item={item} 
                isSelected={selectedId === item.id}
                onSelect={setSelectedId}
              />
            ))}
        </Layer>
      </Stage>

      {/* Modern Floating Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-xl px-6 py-3 rounded-full shadow-luxury border border-white/50 z-50">
        <div className="flex items-center gap-1 border-r border-slate-100 pr-4 mr-2">
           <MousePointer2 size={14} className="text-indigo-500" />
           <span className="text-[10px] font-black tracking-widest text-[#1F2937] uppercase">Canvas Pro v2.0</span>
        </div>
        
        <button onClick={() => setScale(s => Math.min(5, s * 1.1))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><ZoomIn size={18} /></button>
        <button onClick={() => setScale(s => Math.max(0.1, s / 1.1))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><ZoomOut size={18} /></button>
        <button 
          onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }} 
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 flex items-center gap-2"
        >
          <Maximize2 size={18} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Reset View</span>
        </button>
      </div>

      {/* Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[1000] bg-white border border-slate-100 shadow-2xl rounded-2xl py-2 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
             <button onClick={() => handleContextAction('front')} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Traer al frente</button>
             <button onClick={() => handleContextAction('back')} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Enviar atrás</button>
             <div className="h-px bg-slate-50 my-1 mx-2" />
             <button onClick={() => handleContextAction('delete')} className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">Eliminar Objeto</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
