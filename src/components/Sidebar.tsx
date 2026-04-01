import React from 'react';
import { Sparkles, Layers, Image as ImageIcon, Plus, FileText, Settings } from 'lucide-react';

const navItems = [
  { name: 'Icebreaker', icon: Sparkles, href: '#icebreaker' },
  { name: 'Materials', icon: Layers, href: '#materials' },
  { name: 'Moodboard', icon: ImageIcon, href: '#moodboard' },
  { name: 'Reports', icon: FileText, href: '#reports' },
  { name: 'Settings', icon: Settings, href: '#settings' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-[250px] h-screen bg-gradient-to-b from-[#6D28D9] via-[#E9D5FF] to-[#FFFFFF] flex flex-col justify-between p-6 shadow-luxury fixed left-0 top-0 z-50 border-r border-[#6D28D9]/10">
      <div className="flex flex-col gap-8">
        {/* Logo with Premium Glow */}
        <div className="py-4">
          <h1 className="text-3xl font-black tracking-tighter text-[#1F2937] drop-shadow-[0_0_15px_rgba(109,40,217,0.4)] font-sans hover:scale-105 transition-transform cursor-default">
            Arispace
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-black/5 transition-all font-semibold text-[#374151] hover:text-[#111827] group"
              >
                <Icon size={18} className="text-[#4B5563] group-hover:text-[#6D28D9] transition-colors" strokeWidth={2.5} />
                <span className="tracking-wide text-[13px]">{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-6">
        {/* CTA Button */}
        <button className="w-full flex items-center justify-center space-x-2 bg-[#1F2937] hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 border border-white/10">
          <Plus size={16} strokeWidth={3} />
          <span className="text-xs uppercase tracking-widest">Nuevo Proyecto</span>
        </button>

        {/* User Profile & Branding */}
        <div className="flex flex-col gap-4">
           {/* Profile */}
           <div className="flex items-center space-x-3 px-3 py-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
              <span className="font-black text-xs">YA</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-black text-[#1F2937] truncate uppercase tracking-tight">AriSpace Pro</span>
              <span className="text-[10px] text-[#6D28D9] truncate font-bold uppercase">Yunikua Admin</span>
            </div>
          </div>
          
          {/* Branding Footer */}
          <div className="px-2 pb-2 opacity-50 hover:opacity-100 transition-opacity flex flex-col gap-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937]">Arispace v1.0</p>
            <p className="text-[9px] font-bold text-[#6D28D9] italic tracking-tight">For Aris with 💜</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
