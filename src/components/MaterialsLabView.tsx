import React, { useState } from 'react';
import { WelcomeHeader } from './WelcomeHeader';
import { UploadCloud, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

export const MaterialsLabView: React.FC = () => {
  const [cct, setCct] = useState<'2700K' | '4000K' | '6500K'>('4000K');

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto hide-scrollbar pb-12">
      <div className="w-full flex-grow flex flex-col gap-10">
        
        {/* Header & Title */}
        <div>
          <WelcomeHeader />
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] mt-8 font-sans drop-shadow-sm">
            The Materials Lab
          </h1>
          
          {/* Environmental CCT Toggle */}
          <div className="mt-8 flex items-center bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50 w-fit">
            {(['2700K', '4000K', '6500K'] as const).map((temp) => (
              <button
                key={temp}
                onClick={() => setCct(temp)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1 ${
                  cct === temp 
                    ? 'bg-white shadow-sm text-[var(--color-primary)]' 
                    : 'text-[#4B5563] hover:bg-black/5'
                }`}
              >
                {temp}
                <span className={`text-[10px] font-medium ${cct === temp ? 'opacity-80' : 'opacity-60'}`}>
                  {temp === '2700K' ? '(Warm)' : temp === '4000K' ? '(Neutral)' : '(Daylight)'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full relative z-10">
          
          {/* Left Column: Base Material */}
          <div className="col-span-1 h-[600px] bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] shadow-sm border border-white/50 flex flex-col">
            <div 
              className="w-full h-full rounded-[2rem] relative overflow-hidden shadow-inner group"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: cct === '2700K' ? 'sepia(30%) hue-rotate(-10deg) saturate(120%)' : cct === '6500K' ? 'hue-rotate(5deg) saturate(90%) brightness(110%)' : 'none',
                transition: 'filter 0.5s ease-in-out'
              }}
            >
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-white/50">
                <span className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">Base Material: Brushed Walnut</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <span className="text-6xl font-extrabold text-white tracking-tighter drop-shadow-md font-sans">18%</span>
                <span className="text-sm font-bold text-white/90 uppercase tracking-widest ml-2">LRV Score</span>
              </div>
            </div>
          </div>

          {/* Center Column: Dropzone & Contrast Result */}
          <div className="col-span-1 flex flex-col gap-6 h-[600px]">
            {/* Dropzone */}
            <div className="flex-1 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 shadow-sm border border-white/50 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-white/80 transition-all border-dashed hover:border-[var(--color-primary)]">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <UploadCloud size={32} className="text-[#6B7280] group-hover:text-[var(--color-primary)] transition-colors" />
              </div>
              <span className="text-sm font-bold text-[#4B5563] uppercase tracking-widest text-center px-4">Drag Texture Here<br/><span className="text-[10px] font-medium opacity-50 block mt-1">to compare LRV</span></span>
            </div>

            {/* Contrast Result Panel */}
            <div className="h-48 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 shadow-sm border border-white/50 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280] font-bold">Contrast Result</span>
                <div className="bg-red-500/10 text-red-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-500/20 shadow-sm">
                  <AlertTriangle size={12} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Low Delta</span>
                </div>
              </div>
              <div>
                <span className="text-5xl font-light text-[#1F2937] tracking-tighter font-sans block mb-2">12.4 <span className="text-xl font-medium text-[#6B7280]">∆ LRV</span></span>
                <p className="text-xs text-[#7F1D1D] leading-relaxed font-medium bg-red-50 p-3 rounded-xl border border-red-100 shadow-inner">
                  Warning: The contrast ratio falls below the recommended 30-point LRV difference for ADA/Document M compliance. Visual boundaries may not be discernible.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Technical Metadata */}
          <div className="col-span-1 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/50 h-[600px] flex flex-col">
            <div className="flex items-center gap-2 border-b border-black/5 pb-4 mb-6">
              <Info size={16} className="text-[var(--color-primary)]" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F2937]">Technical Metadata</h3>
            </div>
            
            <ul className="flex flex-col gap-6">
              <li className="flex flex-col gap-1 border-b border-black/5 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">Dominant HEX</span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-8 h-8 rounded-lg shadow-md border border-black/10 bg-[#5C4033]"></div>
                  <span className="text-sm font-mono font-bold text-[#374151]">#5C4033</span>
                </div>
              </li>
              <li className="flex flex-col gap-1 border-b border-black/5 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">Material Source</span>
                <span className="text-sm font-medium text-[#374151] mt-1 leading-relaxed">FSC Certified End-Grain Walnut, Matte Finish (5% Gloss)</span>
              </li>
              <li className="flex flex-col gap-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">Fire Rating / Certification</span>
                <div className="bg-emerald-500/10 text-emerald-700 w-fit px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-500/20 mt-1 shadow-sm">
                  <ShieldCheck size={14} strokeWidth={2.5} />
                  <span className="text-[11px] font-bold tracking-wider">CLASS B-s1, d0</span>
                </div>
                <span className="text-[10px] text-[#6B7280] font-medium italic mt-2">Conforms to EN 13501-1 standards for interior wall cladding.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
