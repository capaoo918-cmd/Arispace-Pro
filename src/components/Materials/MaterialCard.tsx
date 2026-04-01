import React, { useState } from 'react';
import { Send, CheckCircle2, FlaskConical } from 'lucide-react';
import { useArispaceStore, SavedMaterial } from '../../store/useArispaceStore';

export const MaterialCard: React.FC<{ material: SavedMaterial }> = ({ material }) => {
  const { addTextureToWorkspace } = useArispaceStore();
  const [showToast, setShowToast] = useState(false);

  const handleSendToWorkspace = () => {
    addTextureToWorkspace(material);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-4 shadow-sm border border-white/50 flex flex-col gap-4 overflow-hidden relative group">
      {/* Toast Animado Flotante */}
      <div 
        className={`absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 z-50 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      >
        <CheckCircle2 size={14} /> En el Lienzo
      </div>

      <div 
        className="w-full h-48 rounded-[1.5rem] bg-gray-100 bg-cover bg-center shadow-inner relative"
        style={{ backgroundImage: `url(${material.imageUrl})` }}
      >
          <div className="absolute top-3 left-3 flex gap-2">
            <div className="bg-white/90 backdrop-blur-md rounded-full px-3 py-1 shadow-sm border border-white/50">
               <span className="text-[10px] font-bold text-[#1F2937] uppercase tracking-wider">{material.lrv} LRV</span>
            </div>
            <div className="bg-emerald-500/90 backdrop-blur-md rounded-full px-3 py-1 shadow-sm border border-emerald-500/20">
               <span className="text-[10px] font-black text-white uppercase tracking-wider">{material.category}</span>
            </div>
          </div>
      </div>
      
      <div className="flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-800">{material.name}</h3>
        <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1 flex-1">{material.notes}</p>
        
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100/50">
          <button 
             onClick={handleSendToWorkspace}
             className="flex-1 bg-[#1F2937] hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-sm"
          >
             <Send size={14} /> Mandar al Lienzo
          </button>
          <button className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
             <FlaskConical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
