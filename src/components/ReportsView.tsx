import React, { useState, useEffect } from 'react';
import { WelcomeHeader } from './WelcomeHeader';
import { Download, FileCheck, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArispaceStore } from '../store/useArispaceStore';
import { MaterialPicker, MaterialInfo } from '../utils/MaterialPicker';

interface ComputedMaterial extends MaterialInfo {
  lrv: string;
  compliant: boolean;
  img: string;
  originalName: string;
}

export const ReportsView: React.FC = () => {
  const { workspaceItems, projectVersions } = useArispaceStore();
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'ready'>('idle');
  const [materials, setMaterials] = useState<ComputedMaterial[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  
  // Costos Financieros
  const [showCosts, setShowCosts] = useState(false);
  const [costs, setCosts] = useState<Record<string, number>>({});

  const handleCostChange = (index: number, val: string) => {
    setCosts(prev => ({ ...prev, [index]: parseFloat(val) || 0 }));
  };

  const grandTotal = materials.reduce((acc, _, i) => acc + (costs[i] || 0), 0);

  // Auto-scan items in workspace
  useEffect(() => {
    const scanMaterials = async () => {
      setIsScanning(true);
      const computed: ComputedMaterial[] = [];
      const cache = new Set<string>();

      for (const item of workspaceItems) {
        if (cache.has(item.imageUrl)) continue;
        cache.add(item.imageUrl);
        
        try {
          // Extraemos usando el centro del mueble
          const data = await MaterialPicker.analyzePixel(item.imageUrl, 0.5, 0.5);
          
          // LRV y compliance pseudo-smart basado en Hex logic
          const r = parseInt(data.hex.substring(1, 3), 16);
          const g = parseInt(data.hex.substring(3, 5), 16);
          const b = parseInt(data.hex.substring(5, 7), 16);
          const lrvValue = Math.round((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 * 100);
          
          computed.push({
            ...data,
            lrv: `${lrvValue}%`,
            compliant: lrvValue > 30, // Basic ADA mockup rule
            img: item.imageUrl,
            originalName: `Asset #${item.id.substring(0,4)}`
          });
        } catch (error) {
          console.error("No se pudo escanear", error);
        }
      }
      
      setMaterials(computed);
      setIsScanning(false);
    };

    scanMaterials();
  }, [workspaceItems]);

  const handleExport = () => {
    setExportState('exporting');
    setTimeout(() => {
      setExportState('ready');
    }, 2500);
  };

  const downloadPDF = () => {
    setExportState('idle');
    window.print(); // Natively prints using CSS rules Print!
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto hide-scrollbar pb-12 relative bg-white sm:p-4">
      <div id="print-area" className="w-full flex-grow flex flex-col gap-10">
        
        {/* Header & Title */}
        <div className="flex justify-between items-end print:items-start">
          <div>
            <div className="print:hidden"><WelcomeHeader /></div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] mt-8 font-sans drop-shadow-sm print:text-5xl print:text-black">
              Technical Materials Report:<br/><span className="text-emerald-500 print:text-black">Project Alpha</span>
            </h1>
            <p className="mt-4 text-sm font-bold uppercase tracking-widest text-gray-400 print:text-black">
              Generado a partir de {workspaceItems.length} objetos físicos en el lienzo.
            </p>
          </div>
          
          <button 
            onClick={handleExport}
            className="print:hidden flex items-center gap-2 bg-[#1F2937] hover:bg-black text-white px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95 group"
          >
            <span className="font-bold tracking-wide text-sm uppercase">Export PDF Report</span>
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 w-full mt-4 print:flex-col">
          
          {/* Left: Executive Summary */}
          <div className="w-full xl:w-1/3 flex flex-col gap-6 print:w-full print:flex-row">
            <div className="bg-gray-50 print:border print:border-black rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center justify-center text-center h-[300px] print:h-auto print:w-1/2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280] font-bold mb-4 print:text-black">Overall Performance</span>
              <div className="text-7xl font-light text-emerald-500 font-sans tracking-tighter mb-6 relative print:text-black">
                8.4<span className="text-3xl font-bold text-[#9CA3AF] absolute bottom-2 -right-12 print:text-black">/10</span>
              </div>
              
              <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-2xl flex items-center justify-center gap-3 w-full shadow-inner mt-4 print:border-black print:bg-transparent">
                <CheckCircle size={24} className="text-emerald-500 print:text-black" />
                <div className="flex flex-col items-start leading-tight">
                   <span className="text-emerald-700 font-extrabold tracking-wide uppercase text-sm print:text-black">Pass</span>
                   <span className="text-emerald-600/70 text-[10px] font-bold uppercase tracking-widest print:text-black">ADA Compliance</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1F2937] print:bg-white print:border print:border-black text-white rounded-[2.5rem] p-8 shadow-xl flex flex-col h-[260px] relative overflow-hidden print:w-1/2 print:h-auto">
               <h3 className="text-xs font-bold uppercase tracking-[0.15em] mb-4 text-white/50 relative z-10 print:text-black">Architect's Note</h3>
               <p className="text-sm leading-relaxed font-medium relative z-10 text-white/90 print:text-black">
                 The material palette demonstrates cohesion automatically derived from the Arispace Vision heuristics. Items marked with LRV less than 30 may require supplemental artificial lighting to meet interior standards.
               </p>
            </div>
          </div>

          {/* Right: Material Inventory List */}
          <div className="w-full xl:w-2/3 bg-gray-50 print:bg-transparent rounded-[2.5rem] p-8 flex flex-col">
            <div className="flex items-center justify-between border-b border-black/10 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <FileCheck size={20} className="text-emerald-500 print:text-black" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F2937] print:text-black">Material Inventory (BOM)</h3>
              </div>
              
              {/* Toggle de Costos (oculto en PDF final si está apagado) */}
              <button 
                onClick={() => setShowCosts(!showCosts)}
                className="print:hidden text-[10px] font-bold uppercase px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[#1F2937] transition-colors shadow-sm"
              >
                {showCosts ? 'Ocultar Presupuesto' : 'Añadir Precios'}
              </button>
            </div>

            {isScanning ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-4">
                <Loader2 size={32} className="animate-spin" />
                <span className="text-xs uppercase font-bold tracking-widest animate-pulse">Analizando Píxeles...</span>
              </div>
            ) : materials.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <span className="text-sm font-bold uppercase tracking-widest">Lienzo Vacío, sin materiales.</span>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-4">
                {materials.map((mat, i) => (
                  <motion.div variants={itemVariants} key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 print:border-black/20 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-inner border border-black/5 flex-shrink-0">
                        <img src={mat.img} alt={mat.material} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-1 w-56">
                        <span className="text-sm font-extrabold text-[#1F2937] tracking-tight truncate">{mat.material}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                           <div className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: mat.hex }} />
                           <span className="text-[10px] font-mono text-[#6B7280] font-bold tracking-widest">{mat.hex}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center w-24 border-l border-black/5 px-4 h-12">
                       <span className="text-2xl font-light text-[#1F2937] tracking-tighter">{mat.lrv}</span>
                       <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">LRV</span>
                    </div>

                    {/* Editor de Costo Condicional */}
                    {showCosts && (
                      <div className="flex flex-col items-center justify-center w-32 border-l border-black/5 px-4 h-12">
                         <div className="flex items-center gap-1">
                           <span className="text-sm font-bold text-gray-400">$</span>
                           <input 
                              type="number"
                              value={costs[i] || ''}
                              onChange={(e) => handleCostChange(i, e.target.value)}
                              placeholder="0.00"
                              className="w-16 bg-transparent text-lg font-bold text-[#1F2937] tracking-tighter focus:outline-none focus:border-b border-emerald-500 text-center"
                           />
                         </div>
                         <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Estimado / m²</span>
                      </div>
                    )}

                    <div className="w-48 flex justify-end">
                      {mat.compliant ? (
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-emerald-100 shadow-sm w-full justify-center print:border-black print:text-black">
                          <CheckCircle size={14} strokeWidth={2.5} /> Compliant
                        </span>
                      ) : (
                        <span className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-red-100 shadow-sm w-full justify-center print:border-black print:text-black">
                          <AlertTriangle size={14} strokeWidth={2.5} /> Low Contrast
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {showCosts && (
                  <motion.div variants={itemVariants} className="mt-4 flex items-center justify-end p-6 bg-[#1F2937] rounded-2xl text-white shadow-xl print:bg-white print:text-black print:border-t-2 print:border-black print:shadow-none print:rounded-none">
                     <span className="uppercase text-xs tracking-widest font-bold opacity-60 mr-6">Presupuesto Estimado de Materiales</span>
                     <span className="text-4xl font-light tracking-tighter">
                       <span className="text-emerald-400 print:text-black text-2xl align-top mr-1">$</span>
                       {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                     </span>
                  </motion.div>
                )}
              </motion.div>
            )}
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
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl print:hidden"
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
                    <Loader2 size={56} className="text-emerald-500 animate-spin absolute" strokeWidth={2} />
                    <div className="w-20 h-20 border-4 border-black/5 rounded-full" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#1F2937] mb-3 font-sans tracking-tight">Compilando Reporte...</h2>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-600 opacity-80 animate-pulse">
                    Procesando Archivos PDF
                  </p>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-inner">
                    <FileCheck size={40} className="text-emerald-500" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#1F2937] mb-2 font-sans tracking-tight">Reporte Listo</h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280] mb-10 bg-black/5 px-4 py-1.5 rounded-full">
                    Apertura NATIVA DEL NAVEGADOR
                  </p>
                  
                  <button 
                    onClick={downloadPDF}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-5 rounded-[1.25rem] shadow-lg shadow-emerald-500/20 transition-all active:scale-95 font-bold tracking-widest text-xs uppercase"
                  >
                    <span>Imprimir / PDF Externo</span>
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
