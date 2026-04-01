import React, { useState } from 'react';
import { HelpCircle, Maximize2, Trash2, Droplet, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ShortcutHint: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { icon: <Move size={14} />, label: "Mover", desc: "Arrastrar con el ratón" },
    { icon: <Maximize2 size={14} />, label: "Escalar", desc: "Tiradores azules" },
    { icon: <Trash2 size={14} />, label: "Borrar", desc: "Teclado [Supr] o Menú" },
    { icon: <Droplet size={14} />, label: "Multiply", desc: "Ocultar fondo blanco" },
  ];

  return (
    <div 
      className="fixed bottom-8 right-8 z-[1000]"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 right-0 w-64 bg-[#1F2937]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl shadow-indigo-500/20 mb-2"
          >
            <div className="flex flex-col gap-4">
              <div className="border-b border-white/10 pb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Arispace Master Controls</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="p-2 bg-white/10 rounded-xl text-white group-hover:bg-indigo-500 group-hover:scale-110 transition-all">
                      {s.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white tracking-wide">{s.label}</span>
                      <span className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 bg-[#1F2937] hover:bg-black text-white rounded-full flex items-center justify-center shadow-xl border border-white/10 transition-colors group relative"
      >
        <HelpCircle size={20} className="group-hover:text-emerald-400 transition-colors" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
      </motion.button>
    </div>
  );
};
