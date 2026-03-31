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
      <div>
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2937] drop-shadow-sm font-sans">
            Arispace
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-black/5 transition-all font-semibold text-[#374151] hover:text-[#111827]"
              >
                <Icon size={20} className="text-[#4B5563]" strokeWidth={2.5} />
                <span className="tracking-wide text-sm">{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div>
        {/* CTA Button */}
        <button className="w-full flex items-center justify-center space-x-2 bg-[var(--color-accent)] hover:brightness-110 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 mb-8">
          <Plus size={18} strokeWidth={2.5} />
          <span>Generate Concept</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 px-2 bg-black/5 p-3 rounded-2xl backdrop-blur-md border border-black/5">
          <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="font-bold text-sm text-[#4B5563]">YA</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-[#1F2937] truncate">Project Alpha</span>
            <span className="text-xs text-[#4B5563] truncate font-semibold">Yunikua</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
