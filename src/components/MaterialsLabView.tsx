import React, { useState } from 'react';
import { WelcomeHeader } from './WelcomeHeader';
import { UploadCloud, Info, AlertTriangle, ShieldCheck, Box, Plus, ChevronDown, FolderPlus, X, Tag } from 'lucide-react';
import { useArispaceStore, SavedMaterial } from '../store/useArispaceStore';
import { MaterialCard } from './Materials/MaterialCard';
import { motion, AnimatePresence } from 'framer-motion';

export const MaterialsLabView: React.FC = () => {
  const { savedMaterials, materialFolders, addMaterialFolder } = useArispaceStore();
  const [cct, setCct] = useState<'2700K' | '4000K' | '6500K'>('4000K');
  
  // States for Modals and Folders
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [openSections, setOpenSections] = useState<string[]>(['Suelos', 'Paredes']);
  
  // States for Smart Save
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [materialToSave, setMaterialToSave] = useState<{imageUrl: string, lrv: string} | null>(null);
  const [saveMeta, setSaveMeta] = useState({ name: '', category: 'Suelos', folderId: '' });

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    addMaterialFolder(newFolderName);
    setNewFolderName('');
    setShowFolderModal(false);
  };

  const handleOpenSaveModal = () => {
    // Simulamos que capturamos la textura actual del simulador (Brushed Walnut por defecto en este mock)
    setMaterialToSave({
      imageUrl: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80',
      lrv: '18%'
    });
    setShowSaveModal(true);
  };

  const executeSmartSave = () => {
    if (!materialToSave || !saveMeta.name.trim()) return;
    
    const newId = 'mat-' + Date.now();
    useArispaceStore.setState((state) => ({
      savedMaterials: [
        ...state.savedMaterials,
        {
          id: newId,
          name: saveMeta.name,
          imageUrl: materialToSave.imageUrl,
          lrv: materialToSave.lrv,
          notes: 'Material guardado desde Lab Analysis',
          category: saveMeta.category,
          folderId: saveMeta.folderId || undefined
        }
      ]
    }));

    setShowSaveModal(false);
    setSaveMeta({ name: '', category: 'Suelos', folderId: '' });
  };

  const categories = ['Suelos', 'Paredes', 'Telas'];
  
  const AccordionSection: React.FC<{ title: string, materials: SavedMaterial[], id: string }> = ({ title, materials, id }) => {
    const isOpen = openSections.includes(id);
    return (
      <div className="mb-6 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/50 overflow-hidden shadow-sm">
        <button 
          onClick={() => toggleSection(id)}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/40 transition-colors"
        >
          <div className="flex items-center gap-4">
             <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                <Box size={18} />
             </div>
             <h3 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h3>
             <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{materials.length}</span>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
             <ChevronDown size={20} className="text-gray-400" />
          </motion.div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-8 pb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {materials.length === 0 ? (
                  <p className="col-span-full py-12 text-center text-gray-400 italic text-sm">Esta sección está vacía.</p>
                ) : (
                  materials.map(mat => (
                    <MaterialCard key={mat.id} material={mat} />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto hide-scrollbar pb-24 px-8">
      <div className="w-full flex-grow flex flex-col gap-10 max-w-7xl">
        
        {/* Header & Title */}
        <div className="relative pt-8">
          <WelcomeHeader />
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-6xl font-black tracking-tighter text-[#1F2937] mt-8 font-sans drop-shadow-sm">
                The Materials Lab
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mt-2 ml-1">Simulación física y banco de texturas pro</p>
            </div>
            
            <button 
              onClick={() => setShowFolderModal(true)}
              className="flex items-center gap-3 bg-[#1F2937] hover:bg-black text-white px-8 py-4 rounded-2xl shadow-xl shadow-gray-200 font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group"
            >
              <FolderPlus size={18} className="group-hover:rotate-12 transition-transform" />
              Nueva Carpeta
            </button>
          </div>

          {/* Environmental CCT Toggle */}
          <div className="mt-10 flex items-center bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-luxury border border-white/50 w-fit">
            {(['2700K', '4000K', '6500K'] as const).map((temp) => (
              <button
                key={temp}
                onClick={() => setCct(temp)}
                className={`px-8 py-3 rounded-[1.2rem] text-sm font-bold transition-all flex items-center gap-2 ${
                  cct === temp 
                    ? 'bg-white shadow-xl text-emerald-600' 
                    : 'text-[#4B5563] hover:bg-black/5'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${temp === '2700K' ? 'bg-orange-300' : temp === '4000K' ? 'bg-white border' : 'bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,1)]'}`} />
                {temp}
                <span className={`text-[10px] font-medium uppercase tracking-widest ${cct === temp ? 'opacity-80' : 'opacity-60'}`}>
                   {temp === '2700K' ? 'Warm' : temp === '4000K' ? 'Neutral' : 'Daylight'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Layout: Physical Sim */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full relative z-10">
          {/* Left Column: Base Material */}
          <div className="col-span-1 h-[600px] bg-white/60 backdrop-blur-md p-5 rounded-[3rem] shadow-luxury border border-white/50 flex flex-col">
            <div 
              className="w-full h-full rounded-[2.5rem] relative overflow-hidden shadow-2xl group"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: cct === '2700K' ? 'sepia(30%) hue-rotate(-10deg) saturate(120%)' : cct === '6500K' ? 'hue-rotate(10deg) saturate(90%) brightness(110%)' : 'none',
                transition: 'filter 0.8s ease-in-out'
              }}
            >
              <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md rounded-full px-6 py-2.5 shadow-xl border border-white/50">
                <span className="text-[10px] font-black text-[#1F2937] uppercase tracking-widest">Base Material: Brushed Walnut</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <span className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl font-sans">18%</span>
                <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] ml-3">LRV Score</span>
              </div>
            </div>
          </div>

          {/* Center Column: Dropzone & Contrast Result */}
          <div className="col-span-1 flex flex-col gap-8 h-[600px]">
            {/* Dropzone */}
            <div className="flex-1 bg-white/40 backdrop-blur-md rounded-[3rem] p-10 shadow-luxury border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-6 group cursor-pointer hover:bg-white/80 hover:border-emerald-500 transition-all">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl border border-gray-50">
                <UploadCloud size={40} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="text-center">
                 <span className="text-sm font-black text-gray-800 uppercase tracking-widest block">Drop for Physical Test</span>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-2 opacity-60">Analiza el impacto lumínico</span>
              </div>
            </div>

            {/* Contrast Result Panel */}
            <div className="h-56 bg-white/60 backdrop-blur-md rounded-[3rem] p-8 shadow-luxury border border-white/50 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex justify-between items-start z-10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Contrast Matrix</span>
                <div className="bg-red-500/10 text-red-600 px-4 py-2 rounded-full flex items-center gap-2 border border-red-500/20 shadow-sm animate-pulse">
                  <AlertTriangle size={14} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Low Delta Warning</span>
                </div>
              </div>
              <div className="z-10 mt-6">
                <span className="text-6xl font-black text-[#1F2937] tracking-tighter font-sans block mb-3">12.4 <span className="text-xl font-bold text-gray-400 tracking-normal ml-1">∆ LRV</span></span>
                <p className="text-[11px] text-red-900 leading-relaxed font-bold bg-white/40 p-4 rounded-2xl border border-red-100/50">
                  Compliance: El contraste cae bajo el límite ADA (30pt). Define bordes visuales con mayor intensidad.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Technical Metadata */}
          <div className="col-span-1 bg-white/90 backdrop-blur-md rounded-[3rem] p-10 shadow-luxury border border-white/20 h-[600px] flex flex-col">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
                <Info size={20} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1F2937]">Physical Analysis</h3>
            </div>
            
            <ul className="flex flex-col gap-8 flex-1">
              <li className="flex flex-col gap-1 border-b border-gray-50 pb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Dominant Chromaticity</span>
                <div className="flex items-center gap-4 mt-3">
                  <div className="w-12 h-12 rounded-2xl shadow-xl border-4 border-white bg-[#5C4033]"></div>
                  <span className="text-lg font-mono font-black text-[#374151]">#5C4033</span>
                </div>
              </li>
              <li className="flex flex-col gap-1 border-b border-gray-50 pb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Atomic Composition</span>
                <span className="text-sm font-bold text-gray-700 mt-2 leading-relaxed">FSC Certified Walnut (American), End-Grain, 5% Gloss Finish</span>
              </li>
            </ul>

            <button 
              onClick={handleOpenSaveModal}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-[1.5rem] shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Plus size={18} />
              Guardar en Vault
            </button>
          </div>
        </div>

        {/* --- Banco de Texturas Estructurado --- */}
        <div className="w-full relative z-10 pt-16 mt-8 border-t border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-2xl text-gray-900">
                 <Box size={28} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-[#1F2937] uppercase">Texture Vault</h2>
            </div>
          </div>
          
          {/* Categorías por Defecto */}
          {categories.map(cat => (
            <AccordionSection 
              key={cat} 
              id={cat}
              title={cat} 
              materials={savedMaterials.filter(m => m.category === cat)} 
            />
          ))}

          {/* Carpetas Personalizadas */}
          {materialFolders.map(folder => (
            <AccordionSection 
              key={folder.id} 
              id={folder.id}
              title={folder.name} 
              materials={savedMaterials.filter(m => m.folderId === folder.id)} 
            />
          ))}

          {/* Otros / Sin Categoría */}
          {savedMaterials.filter(m => !categories.includes(m.category) && !m.folderId).length > 0 && (
             <AccordionSection 
               id="unclassified"
               title="Otros Materiales" 
               materials={savedMaterials.filter(m => !categories.includes(m.category) && !m.folderId)} 
             />
          )}
        </div>
      </div>

      {/* Modal Nueva Carpeta */}
      <AnimatePresence>
        {showFolderModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowFolderModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
              <h3 className="text-2xl font-black text-gray-800 mb-2">Nueva Carpeta</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Organiza tu biblioteca de diseño</p>
              
              <div className="flex flex-col gap-6">
                <input 
                  autoFocus
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ej: Telas de Lino Premium"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
                <button 
                  onClick={handleCreateFolder}
                  className="w-full py-5 bg-[#1F2937] hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Plus size={18} />
                  Crear Carpeta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Guardado Inteligente */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 aspect-square bg-gray-100">
                <img src={materialToSave?.imageUrl} alt="Texture Preview" className="w-full h-full object-cover" />
              </div>

              <div className="w-full md:w-1/2 p-10 flex flex-col">
                <button 
                  onClick={() => setShowSaveModal(false)}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black transition-colors"
                >
                  <X size={24} />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <Tag size={16} className="text-emerald-500" />
                  <h3 className="text-xl font-black text-gray-800">Smart Save</h3>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Etiqueta tu nueva textura</p>

                <div className="flex flex-col gap-6 flex-1">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Material</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={saveMeta.name}
                      onChange={(e) => setSaveMeta({ ...saveMeta, name: e.target.value })}
                      placeholder="Ej: Mármol Arabescato..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría / Carpeta</label>
                    <select 
                      value={saveMeta.folderId ? `folder-${saveMeta.folderId}` : saveMeta.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('folder-')) {
                          setSaveMeta({ ...saveMeta, folderId: val.replace('folder-', ''), category: 'Carpeta' });
                        } else {
                          setSaveMeta({ ...saveMeta, category: val, folderId: '' });
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      {materialFolders.map(f => <option key={f.id} value={`folder-${f.id}`}>📂 {f.name}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={executeSmartSave}
                  disabled={!saveMeta.name.trim()}
                  className="w-full mt-10 py-5 bg-[#1F2937] hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  <Box size={18} />
                  Guardar en Biblioteca
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
