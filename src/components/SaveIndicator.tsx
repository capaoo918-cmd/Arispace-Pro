import React, { useState, useEffect } from 'react';
import { CloudOff, CloudCheck, Loader2 } from 'lucide-react';
import { saveStatusEmitter, SaveStatus } from '../hooks/useAutosave';

export const SaveIndicator: React.FC = () => {
  const [status, setStatus] = useState<SaveStatus>('saved');

  useEffect(() => {
    const handleStatusChange = (e: any) => {
      setStatus(e.detail);
    };

    saveStatusEmitter.addEventListener('statusChange', handleStatusChange);
    return () => saveStatusEmitter.removeEventListener('statusChange', handleStatusChange);
  }, []);

  if (status === 'saving') {
    return (
      <div className="flex items-center gap-2 bg-blue-500/10 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/20 shadow-sm min-w-[140px] justify-center text-blue-600 animate-pulse">
        <Loader2 size={14} className="text-blue-500 animate-spin" strokeWidth={2.5} />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] ml-1 mt-[1px]">Sincronizando...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 bg-red-500/10 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/20 shadow-sm min-w-[140px] justify-center text-red-600 animate-in fade-in zoom-in duration-300">
        <CloudOff size={14} className="text-red-500" strokeWidth={2.5} />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] ml-1 mt-[1px]">Error Guardando</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-500/20 shadow-sm min-w-[140px] justify-center text-emerald-600 animate-in fade-in zoom-in duration-300">
      <CloudCheck size={14} className="text-emerald-500" strokeWidth={2.5} />
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] ml-1 mt-[1px]">Project Synced</span>
    </div>
  );
};
