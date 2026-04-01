import React, { useState } from 'react';
import { useArispaceStore } from '../../store/useArispaceStore';
import { useDraggable } from '@dnd-kit/core';
import { Plus, Image as ImageIcon, Layers, Link as LinkIcon } from 'lucide-react';

interface DraggableAssetProps {
  id: string;
  imageUrl: string;
}

const DraggableAsset: React.FC<DraggableAssetProps> = ({ id, imageUrl }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-asset-${id}`,
    data: { assetId: id, imageUrl }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 9999,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="w-full aspect-square bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-emerald-400 mx-auto transition-transform hover:scale-95"
    >
      <img src={imageUrl} alt="Asset" className="w-full h-full object-cover pointer-events-none" />
    </div>
  );
};

export const AssetSidebar: React.FC = () => {
  const { allConcepts, addExternalConcept } = useArispaceStore();
  const [activeTab, setActiveTab] = useState<'concepts' | 'textures'>('concepts');
  const [urlInput, setUrlInput] = useState('');

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim() && urlInput.startsWith('http')) {
      addExternalConcept(urlInput.trim());
      setUrlInput('');
      setActiveTab('concepts');
    }
  };

  return (
    <aside className="h-full bg-white border-r border-gray-100 p-4 pb-12 overflow-y-auto flex flex-col gap-4 relative z-20">
      <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 gap-1">
        <button 
          onClick={() => setActiveTab('concepts')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'concepts' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Layers size={14} /> Conceptos
        </button>
        <button 
          onClick={() => setActiveTab('textures')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'textures' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <ImageIcon size={14} /> Texturas
        </button>
      </div>

      {activeTab === 'concepts' && (
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <div className="relative flex-grow">
            <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="url" 
              placeholder="Pegar enlace de imagen..."
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
            />
          </div>
          <button type="submit" disabled={!urlInput.trim()} className="bg-[#1F2937] text-white p-2 rounded-xl hover:bg-black disabled:opacity-50 transition-colors">
            <Plus size={16} />
          </button>
        </form>
      )}

      <div className="flex-grow overflow-y-auto pb-8 hide-scrollbar">
        {activeTab === 'concepts' ? (
          <div className="grid grid-cols-2 gap-3">
            {allConcepts.filter(c => !c.type || c.type === 'image').length === 0 ? (
              <div className="col-span-2 text-center text-xs text-gray-400 italic mt-4">Librería vacía</div>
            ) : (
              allConcepts.filter(c => !c.type || c.type === 'image').map(concept => (
                <DraggableAsset key={concept.id} id={concept.id} imageUrl={concept.imageUrl} />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {allConcepts.filter(c => c.type === 'texture').length === 0 ? (
              <div className="col-span-2 text-center text-xs text-gray-400 italic mt-4">No hay texturas guardadas</div>
            ) : (
              allConcepts.filter(c => c.type === 'texture').map(tex => (
                <div key={tex.id} className="group relative">
                   <DraggableAsset id={tex.id} imageUrl={tex.imageUrl} />
                   <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest text-[#1F2937] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                     {tex.prompt.replace('Textura: ', '')}
                   </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
