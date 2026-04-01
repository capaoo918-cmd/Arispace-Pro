import React, { useState, useEffect } from 'react';
import { WelcomeHeader } from './WelcomeHeader';
import { Download, FileCheck, AlertTriangle, CheckCircle, Loader2, Calendar, Clock, Plus, Trash2, Circle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArispaceStore } from '../store/useArispaceStore';
import { MaterialPicker, MaterialInfo } from '../utils/MaterialPicker';
import { aiService } from '../services/aiService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ComputedMaterial extends MaterialInfo {
  lrv: string;
  compliant: boolean;
  img: string;
  originalName: string;
  notes: string;
}

export const ReportsView: React.FC = () => {
  const { workspaceItems, savedMaterials, agendaTasks, addAgendaTask, toggleAgendaTask, deleteAgendaTask } = useArispaceStore();
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'ready'>('idle');
  const [materials, setMaterials] = useState<ComputedMaterial[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  
  // Agenda states
  const [newTask, setNewTask] = useState({ title: '', deadline: '', time: '' });

  // Auto-scan items in workspace and fetch AI descriptions intelligently
  useEffect(() => {
    let active = true;
    const scanMaterials = async () => {
      setIsScanning(true);
      const computed: ComputedMaterial[] = [];
      const cache = new Set<string>();

      for (const item of workspaceItems) {
        if (cache.has(item.imageUrl)) continue;
        cache.add(item.imageUrl);
        
        try {
          const data = await MaterialPicker.analyzePixel(item.imageUrl, 0.5, 0.5);
          
          const r = parseInt(data.hex.substring(1, 3), 16);
          const g = parseInt(data.hex.substring(3, 5), 16);
          const b = parseInt(data.hex.substring(5, 7), 16);
          const lrvValue = Math.round((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 * 100);
          
          const savedMatch = savedMaterials.find(m => m.imageUrl === item.imageUrl);
          let name = savedMatch ? savedMatch.name : `Asset #${item.id.substring(0,4)}`;
          let note = savedMatch?.notes || '';

          // Si es un material nuevo sin notas, usa IA
          if (!note && active) {
             const aiDesc = await aiService.askCreativeAssistant(`You are an architect context-engine. Describe this hex color material in 1 highly technical architecture sentence. HEX: ${data.hex}`, 'BOM Sync');
             note = aiDesc.replace(/["']/g, '');
          }

          computed.push({
            ...data,
            lrv: `${lrvValue}%`,
            compliant: lrvValue > 30,
            img: item.imageUrl,
            originalName: name,
            notes: note
          });
        } catch (error) {
          console.error("No se pudo escanear", error);
        }
      }
      
      if (active) {
        setMaterials(computed);
        setIsScanning(false);
      }
    };

    scanMaterials();
    return () => { active = false; };
  }, [workspaceItems, savedMaterials]);

  const handleExport = async () => {
    setExportState('exporting');
    
    // Defer para permitir que el loader se fije
    await new Promise(r => setTimeout(r, 500));
    
    try {
      const element = document.getElementById('print-area');
      if (!element) throw new Error("Print area not found");

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Project_Alpha_Technical_Report.pdf');
      
      setExportState('ready');
      setTimeout(() => setExportState('idle'), 3000);
    } catch(err) {
      console.error(err);
      setExportState('idle');
      alert("Error al exportar PDF. Verifica que las imágenes permiten CORS.");
    }
  };

  const addActionTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.deadline) return;
    addAgendaTask(newTask);
    setNewTask({ title: '', deadline: '', time: '' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto hide-scrollbar pb-12 relative bg-white sm:p-4">
      <div id="print-area" className="w-full flex-grow flex flex-col gap-10">
        
        {/* Header & Title */}
        <div className="flex justify-between items-end print:items-start border-b border-gray-100 pb-8">
          <div>
            <div data-html2canvas-ignore><WelcomeHeader /></div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] mt-8 font-sans drop-shadow-sm">
              Project <span className="text-emerald-500">Alpha</span>
            </h1>
            <p className="mt-4 text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Sparkles size={16} /> Technical Consolidation & Roadmap
            </p>
          </div>
          
          <button 
            data-html2canvas-ignore
            onClick={handleExport}
            className="flex items-center gap-3 bg-[#1F2937] hover:bg-black text-white px-8 py-4 rounded-2xl shadow-xl shadow-gray-200 font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group"
          >
            <span>Export PDF</span>
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 w-full print:flex-row print:gap-4">
          
          {/* LEFT: Project Timeline & Deadlines */}
          <div className="w-full xl:w-2/5 flex flex-col gap-6 print:w-1/2">
            <div className="bg-indigo-50/50 rounded-[2.5rem] p-8 border border-indigo-100 shadow-sm flex flex-col h-full">
               <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-md">
                   <Calendar size={22} />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-[#1F2937] tracking-tight">Project Agenda</h3>
                   <span className="text-[10px] uppercase font-black text-indigo-400 tracking-widest">Global Deadlines</span>
                 </div>
               </div>

               {/* Add Task Form (Ignored in PDF) */}
               <form data-html2canvas-ignore onSubmit={addActionTask} className="flex flex-col gap-3 mb-8 bg-white p-4 rounded-[1.5rem] shadow-sm border border-indigo-50">
                 <input 
                   type="text" 
                   value={newTask.title} 
                   onChange={e => setNewTask({...newTask, title: e.target.value})}
                   placeholder="Añadir pendiente gerencial..." 
                   className="bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-gray-300 px-2"
                 />
                 <div className="flex gap-2 items-center">
                   <div className="flex-1 flex gap-2 items-center bg-gray-50 px-3 py-2 rounded-xl text-xs font-bold text-gray-600">
                     <Calendar size={14} className="opacity-50" />
                     <input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} className="bg-transparent outline-none w-full" required />
                   </div>
                   <div className="flex-1 flex gap-2 items-center bg-gray-50 px-3 py-2 rounded-xl text-xs font-bold text-gray-600">
                     <Clock size={14} className="opacity-50" />
                     <input type="time" value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} className="bg-transparent outline-none w-full" />
                   </div>
                   <button type="submit" disabled={!newTask.title || !newTask.deadline} className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md">
                     <Plus size={16} strokeWidth={3} />
                   </button>
                 </div>
               </form>

               {/* Task List */}
               <div className="flex flex-col gap-3 flex-grow overflow-y-auto hide-scrollbar">
                 {agendaTasks.length === 0 ? (
                   <p className="text-center text-sm font-bold text-indigo-300 italic py-10">Agenda en blanco.</p>
                 ) : (
                   agendaTasks.map(task => (
                     <div key={task.id} className={`flex items-start gap-3 p-4 rounded-2xl transition-all border ${task.completed ? 'bg-indigo-500/5 border-transparent opacity-60' : 'bg-white border-indigo-100 shadow-sm'}`}>
                       <button data-html2canvas-ignore onClick={() => toggleAgendaTask(task.id)} className={`mt-1 flex-shrink-0 transition-colors ${task.completed ? 'text-indigo-400' : 'text-gray-300 hover:text-indigo-400'}`}>
                         {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                       </button>
                       <div className="flex-1 flex flex-col gap-1">
                         <span className={`text-sm font-bold ${task.completed ? 'line-through text-gray-400' : 'text-[#1F2937]'}`}>{task.title}</span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80">
                           {task.deadline && format(parseISO(task.deadline), "dd MMM yyyy", { locale: es })} 
                           {task.time && ` a las ${task.time}`}
                         </span>
                       </div>
                       <button data-html2canvas-ignore onClick={() => deleteAgendaTask(task.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100">
                         <Trash2 size={16} />
                       </button>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>

          {/* RIGHT: Material Inventory List (BOM) */}
          <div className="w-full xl:w-3/5 flex flex-col gap-6 print:w-1/2">
            <div className="bg-gray-50 rounded-[2.5rem] p-8 flex flex-col h-full print:bg-white print:border print:border-gray-100">
              <div className="flex items-center justify-between border-b border-black/10 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#1F2937] text-white rounded-2xl shadow-md">
                    <FileCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937] tracking-tight">Material Inventory (BOM)</h3>
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Active Workspace Extraction</span>
                  </div>
                </div>
              </div>

              {isScanning ? (
                <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
                  <Loader2 size={32} className="animate-spin" />
                  <span className="text-xs uppercase font-bold tracking-widest animate-pulse">Indexando Componentes & Consultando IA...</span>
                </div>
              ) : materials.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                  <span className="text-sm font-bold uppercase tracking-widest">Sin materiales extraídos.</span>
                </div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-4">
                  {materials.map((mat, i) => (
                    <motion.div variants={itemVariants} key={i} className="flex flex-col p-5 bg-white border border-gray-100 rounded-3xl hover:bg-white/80 transition-all shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-[1rem] overflow-hidden shadow-inner flex-shrink-0">
                            <img src={mat.img} alt={mat.originalName} className="w-full h-full object-cover" crossOrigin="anonymous" />
                          </div>
                          <div className="flex flex-col gap-1 w-48">
                            <span className="text-sm font-extrabold text-[#1F2937] tracking-tight truncate">{mat.originalName}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                               <div className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: mat.hex }} />
                               <span className="text-[10px] font-mono text-[#6B7280] font-bold tracking-widest uppercase">{mat.material}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center justify-center w-20 border-l border-black/5 px-4 h-12">
                             <span className="text-2xl font-light text-[#1F2937] tracking-tighter">{mat.lrv}</span>
                             <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">LRV</span>
                          </div>
                          <div className="w-32 flex justify-end">
                            {mat.compliant ? (
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100 shadow-sm w-full justify-center">
                                <CheckCircle size={12} strokeWidth={2.5} /> Compliant
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-red-100 shadow-sm w-full justify-center">
                                <AlertTriangle size={12} strokeWidth={2.5} /> Warning
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* AI Architect Note Integration */}
                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-start gap-3">
                         <div className="mt-0.5 text-indigo-400 bg-indigo-50 p-1.5 rounded-lg flex-shrink-0">
                            <Sparkles size={12} />
                         </div>
                         <p className="text-xs font-medium text-gray-500 leading-relaxed italic">{mat.notes}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
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
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/80 p-12 flex flex-col items-center justify-center text-center w-[500px]"
            >
              {exportState === 'exporting' ? (
                <>
                  <div className="relative flex items-center justify-center w-24 h-24 mb-10">
                    <Loader2 size={56} className="text-emerald-500 animate-spin absolute" strokeWidth={2} />
                    <div className="w-20 h-20 border-4 border-black/5 rounded-full" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#1F2937] mb-3 font-sans tracking-tight">Renderizando PDF...</h2>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-600 opacity-80 animate-pulse">
                    Fotografiando Vectores y Canvas
                  </p>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-inner">
                    <FileCheck size={40} className="text-emerald-500" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#1F2937] mb-2 font-sans tracking-tight">Reporte Descargado</h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280]">
                    Revisa tu carpeta de descargas
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
