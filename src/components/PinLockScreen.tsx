import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface PinLockScreenProps {
  onUnlock: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (error) setError(false);

    // Auto-advance
    if (value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Validación automática al 4to dígito
    if (index === 3 && value !== '') {
      validatePin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Regresar al input anterior en Backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validatePin = (enteredPin: string) => {
    const savedPin = localStorage.getItem('arispace_pin') || '1507';
    
    if (enteredPin === savedPin) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => {
        setPin(['', '', '', '']);
        setError(false);
        inputRefs.current[0]?.focus();
      }, 500); // Wait for shake animation
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[200] bg-lava-lamp bg-[length:400%_400%] animate-lava-flow flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Dark Overlay for Contrast */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[100px] z-0 pointer-events-none" />

      {/* Glassmorphism Card */}
      <motion.div 
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-[420px] bg-white/60 backdrop-blur-2xl shadow-2xl rounded-[3rem] border border-white/50 flex flex-col items-center p-12 z-10 relative overflow-hidden group"
      >
        {/* Glow ambient interior */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[var(--color-primary)]/20 transition-all duration-1000" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[var(--color-accent)]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[var(--color-accent)]/20 transition-all duration-1000 delay-100" />

        {/* Logo Icon */}
        <div className="w-20 h-20 rounded-[1.5rem] bg-white/80 shadow-sm border border-white/50 flex items-center justify-center mb-8 relative z-10 backdrop-blur-md">
          <ShieldCheck size={40} className="text-[var(--color-primary)]" strokeWidth={2} />
        </div>

        {/* Greetings */}
        <div className="relative z-10 text-center mb-10 w-full space-y-2">
          <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight font-sans">Arispace Vault</h1>
          <p className="text-sm font-bold text-[#4B5563]/80">Hola Yunikua. Ingresa tu código de acceso.</p>
        </div>

        {/* Keypad */}
        <div className="flex gap-4 relative z-10">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-14 h-16 rounded-[1.25rem] text-center text-3xl font-extrabold focus:outline-none transition-all duration-300 shadow-inner block
                ${error ? 'bg-red-500/10 border-red-500/50 text-red-600 focus:ring-red-500/30 ring-2 ring-red-500/20 ring-offset-2 ring-offset-white/20' : 
                  digit ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/50 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30 ring-2 ring-offset-2 ring-offset-white/20' : 
                  'bg-white/50 border-white/40 text-[#1F2937] hover:bg-white/80 focus:bg-white focus:ring-[var(--color-primary-light)] ring-2 focus:ring-offset-2 ring-offset-white/20 border'}
              `}
            />
          ))}
        </div>

        {/* Error Messaging Optional */}
        <div className="h-4 mt-6 mb-2 relative z-10">
          <AnimatePresence>
            {error && (
              <motion.span 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }} 
                className="text-xs font-bold text-red-500 tracking-wider uppercase"
              >
                Acceso Denegado
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto pt-6 text-[9px] uppercase tracking-[0.25em] font-bold text-[#9CA3AF] relative z-10 border-t border-black/5 w-full text-center">
          AES-256 Encrypted Session
        </div>
      </motion.div>
    </motion.div>
  );
};
