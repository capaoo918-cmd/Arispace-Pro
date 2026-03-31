import React, { useState } from 'react';
import { WelcomeHeader } from './WelcomeHeader';
import { Download, FileCheck, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ReportsView: React.FC = () => {
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'ready'>('idle');

  const handleExport = () => {
    setExportState('exporting');
    setTimeout(() => {
      setExportState('ready');
    }, 3500);
  };

  const downloadPDF = () => {
    setExportState('idle');
    // Mock download action for visual fidelity presentation
  };

  const materials = [
    { name: "Brushed Walnut", hex: "#5C4033", lrv: "18%", compliant: false, img: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=200&q=80" },
    { name: "Carrara Marble", hex: "#F2F2F2", lrv: "72%", compliant: true, img: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=200&q=80" },
    { name: "Oxidized Copper", hex: "#4A6B62", lrv: "24%", compliant: false, img: "https://images.unsplash.com/photo-1567360425618-1594206637d2?auto=format&fit=crop&w=200&q=80" },
    { name: "Ethereal Linen", hex: "#E8E6E1", lrv: "65%", compliant: true, img: "https://images.unsplash.com/photo-1584282855140-5a9d82e2c077?auto=format&fit=crop&w=200&q=80" },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto hide-scrollbar pb-12 relative">
      <div className="w-full flex-grow flex flex-col gap-10">
        
        {/* Header & Title */}
        <div className="flex justify-between items-end">
          <div>
            <WelcomeHeader />
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] mt-8 font-sans drop-shadow-sm">
              Technical Materials Report:<br/><span className="text-[var(--color-primary)]">Project Alpha</span>
            </h1>
          </div>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#1F2937] hover:bg-[#111827] text-white px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95 group"
          >
            <span className="font-bold tracking-wide text-sm uppercase">Export PDF Report</span>
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 w-full mt-4">
          
          {/* Left: Executive Summary */}
          <div className="w-full xl:w-1/3 flex flex-col gap-6">
            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/50 flex flex-col items-center justify-center text-center h-[300px]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280] font-bold mb-4">Overall Performance</span>
              <div className="text-7xl font-light text-[var(--color-primary)] font-sans tracking-tighter mb-6 relative">
                8.4<span className="text-3xl font-bold text-[#9CA3AF] absolute bottom-2 -right-12">/10</span>
              </div>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center justify-center gap-3 w-full shadow-inner mt-4">
                <CheckCircle size={24} className="text-emerald-500" />
                <div className="flex flex-col items-start leading-tight">
                   <span className="text-emerald-700 font-extrabold tracking-wide uppercase text-sm">Pass</span>
                   <span className="text-emerald-600/70 text-[10px] font-bold uppercase tracking-widest">ADA Compliance</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1F2937] text-white rounded-[2.5rem] p-8 shadow-xl flex flex-col h-[260px] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem]" />
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-accent)]/10 rounded-tr-[4rem]" />
               <h3 className="text-xs font-bold uppercase tracking-[0.15em] mb-4 text-white/50 relative z-10">Architect's Note</h3>
               <p className="text-sm leading-relaxed font-medium relative z-10 text-white/90">
                 The material palette demonstrates exceptional cohesion. However, primary transit corridors relying on Oxidized Copper and Brushed Walnut require supplemental wayfinding lighting to meet the minimum 30 LRV delta across transitions.
               </p>
            </div>
          </div>

          {/* Right: Material Inventory List */}
          <div className="w-full xl:w-2/3 bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-white/50 p-8 flex flex-col">
            <div className="flex items-center gap-3 border-b border-black/5 pb-6 mb-6">
              <FileCheck size={20} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F2937]">Material Inventory</h3>
            </div>

            <div className="flex flex-col gap-4">
              {materials.map((mat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/40 border border-white/50 rounded-2xl hover:bg-white/80 transition-all shadow-inner group cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-black/10 flex-shrink-0">
                      <img src={mat.img} alt={mat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col gap-1 w-48">
                      <span className="text-sm font-extrabold text-[#1F2937] tracking-tight">{mat.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                         <div className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/5" style={{ backgroundColor: mat.hex }} />
                         <span className="text-[10px] font-mono text-[#6B7280] font-bold tracking-widest">{mat.hex}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center w-24 border-x border-black/5 px-4 h-12">
                     <span className="text-2xl font-light text-[#1F2937] tracking-tighter">{mat.lrv}</span>
                     <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">LRV</span>
                  </div>

                  <div className="w-56 flex justify-end">
                    {mat.compliant ? (
                      <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-emerald-500/20 shadow-sm w-full justify-center">
                        <CheckCircle size={14} strokeWidth={2.5} /> ADA Compliant
                      </span>
                    ) : (
                      <span className="px-3.5 py-2 rounded-xl bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-red-500/20 shadow-sm w-full justify-center">
                        <AlertTriangle size={14} strokeWidth={2.5} /> Low Contrast Warning
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Export Modals Overlay */}
      <AnimatePresence>
        {exportState !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/80 p-12 flex flex-col items-center justify-center text-center w-[500px] h-[400px]"
            >
              {exportState === 'exporting' ? (
                <>
                  <div className="relative flex items-center justify-center w-24 h-24 mb-10">
                    <Loader2 size={56} className="text-[var(--color-primary)] animate-spin absolute" strokeWidth={2} />
                    <div className="w-20 h-20 border-4 border-black/5 rounded-full" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#1F2937] mb-3 font-sans tracking-tight">Exporting Project Alpha...</h2>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-primary)] opacity-80 animate-pulse">
                    Compiling Aesthetic Metrics
                  </p>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-inner">
                    <FileCheck size={40} className="text-emerald-500" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#1F2937] mb-2 font-sans tracking-tight">Report Ready</h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280] mb-10 bg-black/5 px-4 py-1.5 rounded-full">
                    File Size: <span className="text-[#1F2937]">2.4 MB</span>
                  </p>
                  
                  <button 
                    onClick={downloadPDF}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:brightness-110 text-white px-8 py-5 rounded-[1.25rem] shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95 font-bold tracking-widest text-xs uppercase"
                  >
                    <span>Download PDF</span>
                    <Download size={16} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
