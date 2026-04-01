import { useState, useEffect } from 'react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

import { 
  Settings, 
  AccountCircle, 
  Lightbulb, 
  Biotech, 
  Dashboard, 
  Inventory2, 
  Help, 
  Archive, 
  Add, 
  AutoAwesome,
  Download,
  IosShare,
  Search,
  Notifications,
  Warning,
  CheckCircle,
  Close,
  Palette,
  UploadFile,
  PanTool,
  AddPhotoAlternate,
  Mic,
  Volume2,
  Video,
  Image as ImageIcon,
  History,
  Send,
  ZoomIn,
  ZoomOut,
  Minus
} from './components/Icons';
import { cn } from './lib/utils';
import { View, Concept, Material, MoodboardItem } from './types';
import { geminiService } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

// --- Main App / Global Components ---
import { MainLayout } from './components/MainLayout';
import { IcebreakerView as NewIcebreakerView } from './components/IcebreakerView';
import { QuickCapturePanel } from './components/QuickCapturePanel';
import { WorkspaceView } from './components/Workspace/WorkspaceView';
import { MaterialsLabView as NewMaterialsLabView } from './components/MaterialsLabView';
import { ReportsView as NewReportsView } from './components/ReportsView';
import { SettingsView as NewSettingsView } from './components/SettingsView';
import { PinLockScreen } from './components/PinLockScreen';

// --- Components ---

const TopAppBar = ({ currentView, setView }: { currentView: View, setView: (v: View) => void }) => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-xl flex justify-end items-center px-12 py-6 w-full">
    <nav className="hidden md:flex items-center gap-10 font-sans tracking-[-0.04em] text-sm font-medium mr-12">
      <button 
        onClick={() => setView('icebreaker')}
        className={cn(
          "transition-all duration-300 ease-in-out pb-1",
          currentView === 'icebreaker' ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
        )}
      >
        Icebreaker
      </button>
      <button 
        onClick={() => setView('materials')}
        className={cn(
          "transition-all duration-300 ease-in-out pb-1",
          currentView === 'materials' ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
        )}
      >
        Materials
      </button>
      <button 
        onClick={() => setView('moodboard')}
        className={cn(
          "transition-all duration-300 ease-in-out pb-1",
          currentView === 'moodboard' ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
        )}
      >
        Moodboard
      </button>
      <button 
        onClick={() => setView('reports')}
        className={cn(
          "transition-all duration-300 ease-in-out pb-1",
          currentView === 'reports' ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
        )}
      >
        Reports
      </button>
    </nav>
    <div className="flex items-center gap-6">
      <button className="text-on-surface-variant hover:text-primary transition-colors">
        <Notifications size={20} />
      </button>
      <button className="text-on-surface-variant hover:text-primary transition-colors">
        <Settings size={20} />
      </button>
    </div>
  </header>
);

const SideNavBar = ({ currentView, setView }: { currentView: View, setView: (v: View) => void }) => (
  <aside className="fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-3xl flex flex-col p-8 border-r border-white/20 shadow-luxury z-40 overflow-y-auto hide-scrollbar">
    <div className="mb-12">
      <div className="text-2xl font-bold tracking-tighter text-primary font-headline mb-1">Arispace</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 font-bold">Design Studio</div>
    </div>

    <div className="mb-8">
      <button className="w-full py-4 px-6 bg-[#d1eac5] text-[#42573b] rounded-2xl text-sm font-bold mb-8 hover:bg-[#c3dcb7] transition-all shadow-sm flex items-center justify-center gap-3 group">
        <Add size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        <span>Generate Concept</span>
      </button>
      
      <nav className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40 font-bold mb-4 px-4">Menu</div>
        {[
          { id: 'icebreaker', label: 'Concept', icon: Lightbulb },
          { id: 'materials', label: 'Lab', icon: Biotech },
          { id: 'moodboard', label: 'Canvas', icon: Dashboard },
          { id: 'reports', label: 'Library', icon: Inventory2 },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
              currentView === item.id 
                ? "text-primary font-bold bg-white/60 shadow-sm" 
                : "text-on-surface-variant/70 hover:text-primary hover:bg-white/40"
            )}
          >
            <item.icon size={20} />
            <span className="text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>

    <div className="mt-auto pt-8 border-t border-white/20">
      <div className="flex items-center gap-4 px-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
             <img 
               src="https://picsum.photos/seed/yunikua/100/100" 
               alt="Yunikua" 
               className="w-full h-full object-cover" 
               referrerPolicy="no-referrer" 
             />
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-primary">Yunikua</div>
          <div className="text-[10px] text-on-surface-variant/60 font-medium">Pro Architect</div>
        </div>
      </div>
    </div>
  </aside>
);

// --- Views ---

const IcebreakerView = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleEvolve = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const result = await geminiService.generateConcept(prompt);
      const imageUrl = await geminiService.generateImage(result.imagePrompt);
      setConcept({ ...result, imageUrl });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!concept) return;
    setLoading(true);
    try {
      const url = await geminiService.generateVideo(concept.imagePrompt);
      setVideoUrl(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const result = await geminiService.analyzeImage(base64, "Analyze the architectural style and materials in this image.");
        setAnalysisResult(result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-4 space-y-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold font-headline tracking-[-0.04em] text-on-surface leading-[0.9]">
              The<br />Icebreaker
            </h1>
            <p className="text-on-surface-variant text-sm max-w-xs">
              Forging architectural clarity from the primordial fog of artificial intelligence.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-xl space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-secondary font-semibold mb-1">Aesthetic Score</h4>
                <div className="text-5xl font-light font-headline">M = {concept?.aestheticScore.toFixed(2) || '0.00'}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-on-surface-variant font-label">Birkhoff Formula</span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-label text-on-surface-variant">
                  <span>ORDEN (O)</span>
                  <span className="font-bold">{concept?.orderScore.toFixed(1) || '0.0'}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(concept?.orderScore || 0) * 10}%` }}
                    className="h-full bg-primary rounded-full" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-label text-on-surface-variant">
                  <span>COMPLEJIDAD (C)</span>
                  <span className="font-bold">{concept?.complexityScore.toFixed(1) || '0.0'}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(concept?.complexityScore || 0) * 10}%` }}
                    className="h-full bg-secondary-dim rounded-full" 
                  />
                </div>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-on-surface-variant/80 italic pt-4 border-t border-outline-variant/10">
              {concept?.description || "Describe your vision to begin the architectural analysis."}
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="relative group rounded-xl overflow-hidden shadow-2xl aspect-[16/10] bg-surface-container">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-cover"
              />
            ) : concept?.imageUrl ? (
              <img 
                src={concept.imageUrl} 
                alt="AI Generated Architectural Concept" 
                className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                {loading ? <AutoAwesome className="animate-spin" size={48} /> : <ImageIcon size={48} />}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            {concept && (
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={handleGenerateVideo}
                  disabled={loading}
                  className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest text-secondary uppercase shadow-sm hover:bg-white transition-all flex items-center gap-2"
                >
                  <Video size={14} />
                  {loading ? 'Processing...' : 'Generate Video'}
                </button>
                <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest text-secondary uppercase shadow-sm">
                  Aesthetic Score: {concept.aestheticScore.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="glass-panel p-2 rounded-full flex items-center shadow-lg border border-white/40 flex-grow">
              <div className="pl-6 flex-grow">
                <input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEvolve()}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-outline-variant font-label py-3" 
                  placeholder="Describe the atmosphere, material weight, or structural logic..." 
                  type="text"
                />
              </div>
              <button 
                onClick={handleEvolve}
                disabled={loading}
                className="bg-primary text-on-primary h-12 px-8 rounded-full font-semibold flex items-center gap-2 transition-all hover:bg-primary-dim active:scale-95 disabled:opacity-50"
              >
                <span className="text-sm">{loading ? 'Ideating...' : 'Evolve Concept'}</span>
                <AutoAwesome size={16} />
              </button>
            </div>
            
            <label className="cursor-pointer bg-white/40 backdrop-blur-md border border-white/40 h-16 w-16 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg">
              <input type="file" className="hidden" onChange={handleAnalyzeImage} accept="image/*" />
              {analyzing ? <AutoAwesome className="animate-spin" size={24} /> : <AddPhotoAlternate size={24} />}
            </label>
          </div>

          {analysisResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-xl text-sm leading-relaxed text-on-surface-variant"
            >
              <h4 className="font-bold text-on-surface mb-2 flex items-center gap-2">
                <Biotech size={16} />
                Image Analysis Result
              </h4>
              <ReactMarkdown>{analysisResult}</ReactMarkdown>
              <button 
                onClick={() => setAnalysisResult(null)}
                className="mt-4 text-[10px] uppercase tracking-widest font-bold text-primary hover:underline"
              >
                Clear Analysis
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-20 space-y-8">
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-bold font-headline tracking-tight">Derived Stylistic Iterations</h3>
          <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">3 variants generated</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: "Monolithic Brutalism", score: 0.72, desc: "Focus on weight, honest expression of material, and sharp shadow play.", seed: "brutalist" },
            { title: "Bio-Organic Fluidity", score: 0.89, desc: "Curves derived from natural systems with integrated carbon-sink vegetation.", seed: "organic", offset: true },
            { title: "Ethereal Glass Grid", score: 0.81, desc: "Dematerialization of the facade using smart-chromic glass and slender steel.", seed: "glass" }
          ].map((variant, i) => (
            <div key={i} className={cn("space-y-5 group cursor-pointer", variant.offset && "md:mt-12")}>
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-surface-container relative">
                <img 
                  src={`https://picsum.photos/seed/${variant.seed}/800/1000`} 
                  alt={variant.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 text-[10px] font-bold text-secondary uppercase bg-white/80 px-2 py-1 rounded">Score: {variant.score}</div>
              </div>
              <div className="px-2">
                <h4 className="font-bold text-lg mb-1">{variant.title}</h4>
                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{variant.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MaterialsLabView = () => {
  const [cct, setCct] = useState('4000K');
  
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface mb-4">The Materials Lab</h1>
        <p className="font-body text-on-surface-variant max-w-2xl text-lg">Validate aesthetic contrast and technical compliance through an ethereal lens. Upload high-res textures to begin spectral analysis.</p>
      </header>

      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-surface-container-low/50 rounded-xl p-6 flex items-center justify-between backdrop-blur-sm">
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">Environmental CCT Toggle</h3>
              <p className="text-xs text-on-surface-variant font-label">Simulate lighting conditions on surface textures</p>
            </div>
            <div className="flex bg-surface-container/50 p-1 rounded-full">
              {['2700K', '4000K', '6500K'].map((val) => (
                <button 
                  key={val}
                  onClick={() => setCct(val)}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-label font-medium transition-all",
                    cct === val ? "bg-surface-container-lowest text-primary shadow-sm font-semibold" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {val} {val === '2700K' ? '(Warm)' : val === '4000K' ? '(Neutral)' : '(Daylight)'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 h-[500px]">
            <div className="relative group h-full">
              <div className="absolute inset-0 rounded-2xl overflow-hidden bg-surface-container-high transition-transform duration-500 group-hover:scale-[1.02]">
                <img 
                  src="https://picsum.photos/seed/walnut/800/1000" 
                  alt="Brushed Walnut Texture" 
                  className="w-full h-full object-cover grayscale-[0.2]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="bg-primary/90 text-on-primary px-3 py-1 rounded-full text-[10px] font-label font-bold tracking-widest uppercase">Base Material</span>
                  <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-label font-medium">Brushed Walnut</span>
                </div>
                <div className="absolute bottom-6 left-6">
                  <div className="text-white">
                    <div className="text-4xl font-headline font-bold">18%</div>
                    <div className="text-[10px] font-label uppercase tracking-widest opacity-80">LRV Score</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-full flex flex-col gap-6">
              <div className="flex-grow rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-12 text-center weighted-ease hover:bg-primary-fixed-dim/10 hover:border-primary/40 group bg-white/20">
                <div className="w-16 h-16 rounded-full bg-surface-container-high/60 flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                  <UploadFile size={32} className="text-outline" />
                </div>
                <h4 className="font-headline font-bold text-on-surface">Drag Texture Here</h4>
                <p className="text-xs text-on-surface-variant mt-2 font-label max-w-[200px]">Upload stone, metal, or timber samples for contrast validation</p>
              </div>

              <div className="bg-surface-container-lowest/80 backdrop-blur-sm rounded-2xl p-6 shadow-luxury border border-outline-variant/10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-headline font-bold text-lg text-on-surface">Contrast Result</h3>
                    <p className="text-xs text-on-surface-variant font-label">Validation against ADA standards</p>
                  </div>
                  <div className="bg-error-container/20 text-error px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Warning size={14} />
                    <span className="text-[10px] font-label font-bold uppercase tracking-wider">Low Delta</span>
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-headline font-bold text-error">12.4</span>
                  <span className="text-sm font-label text-on-surface-variant pb-1">Δ LRV</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-error w-[41%] rounded-full"></div>
                </div>
                <p className="text-[10px] font-label text-error mt-3 leading-relaxed">Accessibility Warning: Delta LRV is below 30. This pairing may not meet Document M requirements for visual differentiation in public spaces.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low/60 backdrop-blur-sm rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-5 right-5 text-[10px] font-label font-bold text-secondary uppercase tracking-widest">Aesthetic Score</div>
            <div className="mb-8">
              <span className="text-6xl font-headline font-extrabold tracking-tighter text-on-surface">A+</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6 font-body">The warmth of the Walnut grain pairs mathematically with high-CCT neutral environments, creating a "Silent Luxury" atmosphere.</p>
            <div className="flex flex-wrap gap-2">
              {['Organic', 'Minimalist', 'Tactile'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-surface-container-lowest/80 rounded-full text-[10px] font-label text-secondary font-medium uppercase tracking-wider">{tag}</span>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest/80 backdrop-blur-sm rounded-2xl p-8 shadow-luxury">
            <h3 className="font-headline font-bold text-sm text-on-surface mb-6 uppercase tracking-widest">Technical Metadata</h3>
            <div className="space-y-6">
              {[
                { label: 'HEX (Dominant)', value: '#3E2B23' },
                { label: 'LRV (Measured)', value: '18.2' },
                { label: 'Material Source', value: 'European Forest Council' },
                { label: 'Spec ID', value: 'AS-MAT-990-WN' }
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                  <span className="text-xs font-label text-on-surface-variant">{item.label}</span>
                  <span className="text-xs font-mono font-bold text-on-surface">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-label text-on-surface-variant">Fire Rating</span>
                <span className="text-xs font-mono font-bold bg-primary-container text-on-primary-container px-2 py-0.5 rounded">CLASS B-s1, d0</span>
              </div>
            </div>
            <button className="w-full mt-8 py-4 border border-outline-variant/30 rounded-full font-label font-bold text-xs text-on-surface-variant hover:bg-surface-container transition-colors uppercase tracking-widest">
              Export Datasheet
            </button>
          </div>

          <div className="bg-secondary-container/30 backdrop-blur-sm rounded-2xl p-6">
            <h4 className="font-headline font-bold text-xs text-on-secondary-container mb-4">Complementary Tones</h4>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-[#f9f9f9] shadow-sm"></div>
              <div className="w-10 h-10 rounded-full bg-[#e8ddff] shadow-sm"></div>
              <div className="w-10 h-10 rounded-full bg-[#4f6447] shadow-sm"></div>
              <div className="w-10 h-10 rounded-full border border-dashed border-on-secondary-container/20 flex items-center justify-center">
                <Add size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MoodboardView = () => {
  const [items, setItems] = useState<MoodboardItem[]>([
    { id: '1', type: 'image', url: "https://picsum.photos/seed/texture1/800/1000", label: "Base Texture", className: "col-span-5 row-span-7" },
    { id: '2', type: 'image', url: "https://picsum.photos/seed/texture2/800/800", label: "Aesthetic Score: 8.9", className: "col-span-4 row-span-4 col-start-7 row-start-2 translate-x-4 -translate-y-4" },
    { id: '3', type: 'image', url: "https://picsum.photos/seed/sketch/600/800", label: "Sketch Overlay", className: "col-span-3 row-span-5 col-start-6 row-start-7 rounded-full border-8 border-white/50 backdrop-blur-sm -rotate-6 z-40" },
    { id: '4', type: 'image', url: "https://picsum.photos/seed/fabric/600/600", label: "Fabric Sample", className: "col-span-3 row-span-3 col-start-2 row-start-9 mix-blend-multiply opacity-60" },
    { id: '5', type: 'image', url: "https://picsum.photos/seed/glass/400/600", label: "Glass Detail", className: "col-span-2 row-span-4 col-start-10 row-start-6 translate-y-12" },
  ]);

  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [size, setSize] = useState('1K');
  const [style, setStyle] = useState('Photorealistic');
  const [generating, setGenerating] = useState(false);
  const [hasKey, setHasKey] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    if (!hasKey) {
      await handleSelectKey();
    }
    setGenerating(true);
    try {
      const fullPrompt = `${style} style: ${prompt}`;
      const imageUrl = await geminiService.generateStudioImage(fullPrompt, aspectRatio, size);
      if (imageUrl) {
        const newItem: MoodboardItem = {
          id: Date.now().toString(),
          type: 'image',
          url: imageUrl,
          label: `${style} | ${aspectRatio} | ${size}`,
          className: "col-span-4 row-span-4 col-start-1 row-start-1 z-50 shadow-2xl border-4 border-primary/20"
        };
        setItems([newItem, ...items]);
        setPrompt('');
      }
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = (url: string, label: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${label.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-8 min-h-[700px]">
      <aside className="hidden lg:flex flex-col gap-12 w-16 items-center py-8">
        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-white transition-all duration-300 shadow-luxury cursor-pointer">
          <Lightbulb size={20} />
        </div>
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary font-bold shadow-luxury">
          <Dashboard size={20} />
        </div>
        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-white transition-all duration-300 shadow-luxury cursor-pointer">
          <Inventory2 size={20} />
        </div>
      </aside>

      <section className="flex-grow space-y-8">
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-4">Aspect Ratio</label>
                  <div className="flex flex-wrap gap-2 px-2">
                    {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => (
                      <button
                        key={r}
                        onClick={() => setAspectRatio(r)}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold transition-all border",
                          aspectRatio === r 
                            ? "bg-primary text-on-primary border-primary shadow-sm" 
                            : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-4">Resolution</label>
                  <div className="flex gap-2 px-2">
                    {['1K', '2K', '4K'].map(s => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold transition-all border",
                          size === s 
                            ? "bg-primary text-on-primary border-primary shadow-sm" 
                            : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-4">Style</label>
                  <div className="flex gap-2 px-2">
                    {['Photorealistic', 'Sketch', 'Minimal', 'Cinematic'].map(s => (
                      <button
                        key={s}
                        onClick={() => setStyle(s)}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold transition-all border",
                          style === s 
                            ? "bg-primary text-on-primary border-primary shadow-sm" 
                            : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end px-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Image Generation Prompt</label>
                  <div className="flex gap-4 items-center">
                    <button 
                      onClick={() => setPrompt('')}
                      className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 hover:text-error transition-colors"
                      title="Clear Prompt"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => {
                        const prompts = [
                          "Brutalist concrete texture with moss and soft morning light",
                          "Minimalist glass facade reflecting a sunset over the ocean",
                          "Hand-drawn architectural sketch of a sustainable treehouse",
                          "Cinematic interior of a futuristic library with floating bookshelves",
                          "Ethereal marble columns in a misty mountain landscape",
                          "Parametric wooden structure with dappled forest shadows",
                          "Industrial loft with exposed brick and copper accents",
                          "Zen garden courtyard with raked sand and weathered stone",
                          "Art Deco skyscraper detail with gold leaf and geometric patterns",
                          "Sustainable vertical garden on a high-tech skyscraper",
                          "Gothic cathedral arches with stained glass light patterns",
                          "Modernist villa with a cantilevered pool over a cliff",
                          "Biophilic office interior with living walls and natural light",
                          "Desert retreat with rammed earth walls and desert flora",
                          "Scandinavian cabin with light wood and large windows"
                        ];
                        let newPrompt;
                        do {
                          newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
                        } while (newPrompt === prompt && prompts.length > 1);
                        setPrompt(newPrompt);
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                    >
                      <AutoAwesome size={10} />
                      Surprise Me
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={prompt}
                      initial={{ opacity: 0.8, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-full px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Describe a texture, material, or architectural detail..."
                      />
                    </motion.div>
                  </AnimatePresence>
                  <button 
                    onClick={handleGenerate}
                    disabled={generating || !prompt}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-dim transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {generating ? <AutoAwesome className="animate-spin" size={14} /> : (!hasKey ? <Warning size={14} /> : <Add size={14} />)}
                    {generating ? 'Generating...' : (!hasKey ? 'Select API Key' : 'Create')}
                  </button>
                </div>
                {!hasKey && (
                  <p className="text-[10px] text-error mt-2 ml-4 flex items-center gap-1">
                    <Warning size={10} />
                    A paid Gemini API key is required for high-quality generation. <button onClick={handleSelectKey} className="underline font-bold">Select Key</button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-luxury border border-outline-variant/10 p-8 min-h-[700px]">
          <div className="absolute top-8 left-8 z-10">
            <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Atmospheric Study 01</h1>
            <p className="text-sm text-on-surface-variant font-label max-w-xs leading-relaxed">Layered textures and light play for the Alpine Wellness Retreat concept.</p>
          </div>

          <AnimatePresence>
            {generating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-white/20 backdrop-blur-md flex flex-col items-center justify-center gap-4"
              >
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <div className="text-sm font-bold text-primary animate-pulse">Generating Architectural Vision...</div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            animate={{ scale: zoom }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="grid grid-cols-12 grid-rows-12 gap-6 w-full h-full min-h-[600px] mt-24 origin-center"
          >
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  layoutId={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn("rounded-xl overflow-hidden relative group cursor-move hover:scale-[1.02] transition-all duration-500 shadow-xl", item.className)}
                >
                  <img 
                    src={item.url} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-secondary/80 backdrop-blur-md text-on-secondary px-2 py-1 rounded text-[10px] font-label uppercase tracking-widest">
                      {item.label}
                    </div>
                    <button 
                      onClick={() => downloadImage(item.url, item.label || 'moodboard_item')}
                      className="bg-white/80 backdrop-blur-md text-primary p-1 rounded-full hover:bg-white transition-all"
                      title="Download Image"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                  <button 
                    onClick={() => setItems(items.filter(i => i.id !== item.id))}
                    className="absolute top-4 left-4 bg-error/80 backdrop-blur-md text-on-error p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Close size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 glass-panel rounded-full px-6 py-4 shadow-luxury flex items-center gap-6 border border-white/40 z-50">
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all text-on-surface-variant" title="Pan Tool">
              <PanTool size={20} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all text-on-surface-variant" title="Add Image">
              <AddPhotoAlternate size={20} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all text-on-surface-variant" title="Palette">
              <Palette size={20} />
            </button>
            <button 
              onClick={() => setItems([])}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-error/10 transition-all text-error" 
              title="Clear All"
            >
              <Archive size={20} />
            </button>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md rounded-full px-3 py-1 border border-white/40">
              <button 
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} 
                className="p-1 hover:bg-white rounded-full transition-all text-on-surface-variant"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-[10px] font-bold w-10 text-center text-on-surface-variant">{Math.round(zoom * 100)}%</span>
              <button 
                onClick={() => setZoom(Math.min(2, zoom + 0.1))} 
                className="p-1 hover:bg-white rounded-full transition-all text-on-surface-variant"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-label text-sm flex items-center gap-2 hover:bg-primary-dim transition-all">
              <span>Export</span>
              <IosShare size={16} />
            </button>
          </div>
        </div>
      </section>

      <aside className="w-80 flex flex-col gap-6">
        <div className="bg-surface-container-low rounded-3xl p-6 shadow-luxury">
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-6">Cohesion Monitor</h3>
          <div className="relative h-4 w-full bg-surface-container rounded-full overflow-hidden mb-8">
            <div className="absolute left-0 top-0 h-full bg-primary" style={{ width: '70%' }}></div>
            <div className="absolute right-0 top-0 h-full bg-secondary-fixed-dim" style={{ width: '30%' }}></div>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">70%</span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">Base Texture Cohesion</span>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="text-3xl font-bold text-secondary">30%</span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">Dynamic Contrast</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-luxury border border-white/60">
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-6">Light & Data</h3>
          <div className="space-y-6">
            {[
              { name: 'Forest Deep', hex: '#4F6447', color: 'bg-[#4f6447]' },
              { name: 'Ethereal Mist', hex: '#E8DDFF', color: 'bg-[#e8ddff]' },
              { name: 'Vellum White', hex: '#F2F4F4', color: 'bg-[#f2f4f4]' }
            ].map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-4 h-4 rounded-full", item.color)}></div>
                  <span className="font-label text-sm text-on-surface">{item.name}</span>
                </div>
                <span className="font-label text-sm text-on-surface-variant">{item.hex}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-outline-variant/10 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-label">
                <span className="text-on-surface-variant">LRV (Light Reflectance Value)</span>
                <span className="text-on-surface font-bold">42%</span>
              </div>
              <div className="flex justify-between text-xs font-label">
                <span className="text-on-surface-variant">M-Score (Mathematical Beauty)</span>
                <span className="text-on-surface font-bold">0.84</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary-container text-on-primary-container rounded-3xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <AutoAwesome className="mb-2" size={24} />
            <h4 className="font-headline font-bold text-lg mb-1 leading-tight">AI State: Ideating</h4>
            <p className="text-xs opacity-80 mb-4 leading-relaxed">System suggests adding 12% more organic fiber textures to achieve target cohesion.</p>
            <button className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary-dim transition-all">Apply Suggestion</button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Biotech size={120} />
          </div>
        </div>
      </aside>
    </div>
  );
};

const ReportsView = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface mb-4 leading-tight">
            Technical Materials Report:<br /><span className="text-primary/60">Project Alpha</span>
          </h1>
          <p className="text-on-surface-variant text-lg font-light leading-relaxed">Comprehensive analysis of material luminosity, aesthetic cohesion, and regulatory compliance for interior environments.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-primary text-primary-fixed rounded-full font-semibold flex items-center gap-3 hover:bg-primary-dim transition-all shadow-lg shadow-primary/10">
            <Download size={20} />
            Export PDF Report
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="md:col-span-2 glass-panel p-10 rounded-xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <span className="text-xs font-label font-semibold uppercase tracking-[0.2em] text-secondary mb-2 block">Executive Summary</span>
              <h3 className="text-3xl font-headline font-bold mb-4">Overall Performance</h3>
            </div>
            <div className="flex items-center gap-12 mt-8">
              <div>
                <p className="text-5xl font-headline font-extrabold text-primary">8.4<span className="text-xl font-light text-on-surface-variant">/10</span></p>
                <p className="text-xs font-label uppercase text-on-surface-variant tracking-wider mt-2">Aesthetic Score (M-Score)</p>
              </div>
              <div className="h-12 w-px bg-outline-variant/20"></div>
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle size={24} />
                  <span className="text-xl font-headline font-bold uppercase">Pass</span>
                </div>
                <p className="text-xs font-label uppercase text-on-surface-variant tracking-wider mt-2">ADA Compliance Status</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl group-hover:bg-primary-container/30 transition-colors"></div>
        </div>
        <div className="bg-surface-container-low p-10 rounded-xl flex flex-col justify-between border border-white/50">
          <ImageIcon className="text-secondary" size={32} />
          <div>
            <h4 className="text-xl font-headline font-bold mb-2">Contrast Metrics</h4>
            <p className="text-sm text-on-surface-variant font-label leading-relaxed">75% of primary sets meet the 30% LRV delta requirement for optimal accessibility.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-headline font-bold tracking-tight">Material Inventory & Specs</h3>
          <div className="flex items-center gap-2 text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">
            <span>Sort by:</span>
            <button className="flex items-center gap-1 text-primary">LRV Score</button>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { name: "Brushed Walnut", hex: "#4A3728", lrv: "18%", warning: true, seed: "walnut" },
            { name: "Carrara Marble", hex: "#F2F2F2", lrv: "72%", warning: false, seed: "marble" },
            { name: "Oxidized Steel", hex: "#3D342E", lrv: "12%", warning: true, seed: "steel" },
            { name: "Light Oak", hex: "#D1BC9E", lrv: "45%", warning: false, seed: "oak" }
          ].map((mat, i) => (
            <div key={i} className="bg-surface-container-lowest hover:bg-white rounded-xl p-5 flex flex-wrap lg:flex-nowrap items-center gap-8 transition-all border border-transparent hover:border-primary-fixed group">
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                <img 
                  src={`https://picsum.photos/seed/${mat.seed}/200/200`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <h4 className="text-lg font-headline font-bold text-on-surface">{mat.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className={cn("w-3 h-3 rounded-full", `bg-[${mat.hex}]`)} style={{ backgroundColor: mat.hex }}></div>
                  <span className="text-xs font-label text-on-surface-variant">HEX: {mat.hex}</span>
                </div>
              </div>
              <div className="flex-1 text-center border-l border-outline-variant/10">
                <p className="text-2xl font-headline font-extrabold text-on-surface">{mat.lrv}</p>
                <p className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant">LRV Score</p>
              </div>
              <div className="flex-1 flex justify-center border-l border-outline-variant/10">
                {mat.warning ? (
                  <span className="px-4 py-1.5 rounded-full bg-error-container/10 text-error text-[10px] font-label font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Warning size={14} />
                    Low Contrast Warning
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-primary-container/30 text-primary text-[10px] font-label font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    ADA Compliant
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- Chat Interface ---

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Hello, I am your Arispace Design Assistant. How can I help you refine your architectural vision today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input) return;
    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      const result = await geminiService.searchGrounding(input);
      setMessages(prev => [...prev, { role: 'bot', text: result.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-96 h-[500px] glass-panel rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/40"
          >
            <div className="p-6 bg-primary text-on-primary flex justify-between items-center">
              <div className="flex items-center gap-3">
                <AutoAwesome size={20} />
                <span className="font-bold font-headline">Design Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)}><Close size={20} /></button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-4 hide-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' ? "bg-primary text-on-primary rounded-tr-none" : "bg-surface-container-high text-on-surface rounded-tl-none"
                  )}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-high p-4 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant/10 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about materials, styles..."
                className="flex-grow bg-surface-container-low rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-primary border-none"
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary-dim transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-on-primary w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      >
        {isOpen ? <Close size={24} /> : <AutoAwesome size={24} />}
      </button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState('icebreaker');
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    // For deployment demo logic, forcibly set the PIN to '1507' to ensure the user is never locked out.
    localStorage.setItem('arispace_pin', '1507');

    // LIMPIEZA FINAL: Resetear datos de prueba si es la primera carga de esta versión
    const CLEAN_VERSION = 'v1.2_final';
    if (localStorage.getItem('arispace_clean_marker') !== CLEAN_VERSION) {
      localStorage.removeItem('arispace-storage');
      localStorage.setItem('arispace_clean_marker', CLEAN_VERSION);
      console.log("Arispace Cleanup: Datos de prueba eliminados. Sistema listo.");
      // No recargamos aquí para evitar bucles, el store se inicializará vacío.
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setView(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    // Verificar initial hash
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLocked ? (
        <PinLockScreen key="lock" onUnlock={() => setIsLocked(false)} />
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <MainLayout>
            {view === 'moodboard' ? <WorkspaceView /> : view === 'materials' ? <NewMaterialsLabView /> : view === 'reports' ? <NewReportsView /> : view === 'settings' ? <NewSettingsView /> : <NewIcebreakerView />}
          </MainLayout>
          <QuickCapturePanel />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
