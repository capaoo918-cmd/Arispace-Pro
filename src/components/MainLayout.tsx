import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { SaveIndicator } from './SaveIndicator';
import { ParticlesBackground } from './ParticlesBackground';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#FAF9FF] w-full font-sans text-text relative overflow-hidden">
      
      {/* Fluid Lava Lamp Animated Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none filter blur-[120px] opacity-70">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#E9D5FF] animate-orb-1 mix-blend-multiply"></div>
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#FEE2E2] animate-orb-2 mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-tl-full rounded-br-full bg-[#D8B4FE] animate-orb-3 mix-blend-multiply"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-[#E9D5FF] animate-orb-4 mix-blend-multiply"></div>
      </div>

      {/* Space Dust Background behind content */}
      <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-90">
        <ParticlesBackground />
      </div>

      {/* Sidebar fixed to the left */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-[250px] p-8 w-full min-h-screen relative z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto h-full pointer-events-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
