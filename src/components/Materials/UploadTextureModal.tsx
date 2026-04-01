import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArispaceStore } from '../../store/useArispaceStore';

interface Props {
  onClose: () => void;
}

export const UploadTextureModal: React.FC<Props> = ({ onClose }) => {
  const { addSavedMaterial, materialFolders } = useArispaceStore();
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Suelos');
  const [folderId, setFolderId] = useState('');
  
  const categories = ['Suelos', 'Paredes', 'Telas'];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const handleSave = () => {
    if (!imagePreview || !name.trim()) return;
    
    addSavedMaterial({
      name,
      imageUrl: imagePreview,
      lrv: 'N/A', 
      notes: 'Subido por usuario',
      category: folderId ? 'Carpeta' : category,
      folderId: folderId || undefined
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl relative flex flex-col gap-6"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black transition-colors"
          >
            <X size={24} />
          </button>

          <div>
            <h3 className="text-2xl font-black text-gray-800">Añadir Textura</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Incorpora materiales al Vault</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-2xl gap-2">
            <button 
              onClick={() => setTab('upload')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all ${tab === 'upload' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <UploadCloud size={16} /> Subir Archivo
            </button>
            <button 
              onClick={() => setTab('url')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all ${tab === 'url' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <LinkIcon size={16} /> Pegar URL
            </button>
          </div>

          {!imagePreview ? (
            <div className="h-48 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50 transition-colors hover:border-emerald-400 overflow-hidden cursor-pointer">
              {tab === 'upload' ? (
                <div {...getRootProps()} className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <input {...getInputProps()} />
                  <UploadCloud size={40} className={`mb-3 ${isDragActive ? 'text-emerald-500' : 'text-gray-300'}`} />
                  <p className="font-bold text-gray-700">Arrastra una imagen aquí</p>
                  <p className="text-xs text-gray-400 font-bold uppercase mt-1">o haz clic para explorar</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    onChange={(e) => setImagePreview(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-4 text-center">Pega una URL directa a la imagen para previsualizarla.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-6">
              <div className="w-32 h-32 rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-gray-50 relative group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setImagePreview(null)}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs uppercase"
                >
                  Cambiar
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
                   <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Mármol Arabescato" className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Carpeta de Destino</label>
                  <select 
                      value={folderId ? `folder-${folderId}` : category}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('folder-')) {
                          setFolderId(val.replace('folder-', ''));
                        } else {
                          setCategory(val);
                          setFolderId('');
                        }
                      }}
                      className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      {materialFolders.map(f => <option key={f.id} value={`folder-${f.id}`}>📂 {f.name}</option>)}
                    </select>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-6 border-t border-gray-50">
            <button 
              onClick={handleSave}
              disabled={!imagePreview || !name.trim()}
              className="w-full py-4 bg-[#1F2937] hover:bg-black disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <CheckCircle size={18} />
              Añadir a Biblioteca
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
