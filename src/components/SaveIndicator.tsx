import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, CloudOff, Loader2, Save } from 'lucide-react';
import { saveStatusEmitter, SaveStatus } from '../hooks/useAutosave';

const STATUS_CONFIG: Record<
  SaveStatus,
  { icon: React.ReactNode; label: string; color: string }
> = {
  saved: {
    icon: <CheckCircle size={13} strokeWidth={2.5} />,
    label: 'Guardado',
    color: 'text-emerald-600',
  },
  saving: {
    icon: <Loader2 size={13} className="animate-spin" strokeWidth={2.5} />,
    label: 'Guardando...',
    color: 'text-blue-500',
  },
  error: {
    icon: <CloudOff size={13} strokeWidth={2.5} />,
    label: 'Sin conexión',
    color: 'text-amber-500',
  },
  idle: {
    icon: <Save size={13} strokeWidth={2.5} />,
    label: 'Listo',
    color: 'text-gray-400',
  },
};

export const SaveIndicator: React.FC = () => {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [visible, setVisible] = useState(false);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SaveStatus>;
      const newStatus = customEvent.detail;
      setStatus(newStatus);
      setVisible(true);

      // Auto-hide after 3s once state is 'saved' or 'idle'
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (newStatus === 'saved' || newStatus === 'idle') {
        hideTimerRef.current = setTimeout(() => setVisible(false), 3000);
      }
    };

    saveStatusEmitter.addEventListener('statusChange', handler);
    return () => {
      saveStatusEmitter.removeEventListener('statusChange', handler);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const config = STATUS_CONFIG[status];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`
            flex items-center gap-1.5 px-3 py-1.5
            bg-white/70 backdrop-blur-md
            border border-white/50 rounded-full
            shadow-sm text-[11px] font-bold
            tracking-wide uppercase select-none
            ${config.color}
          `}
        >
          {config.icon}
          <span>{config.label}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
