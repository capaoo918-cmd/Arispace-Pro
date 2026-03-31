import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export const WelcomeHeader: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Lógica de Persistencia
    const storedName = localStorage.getItem('arispace_user_name');
    if (storedName) {
      setUserName(storedName);
    } else {
      const defaultName = 'Yunikua';
      localStorage.setItem('arispace_user_name', defaultName);
      setUserName(defaultName);
    }

    // Desmontar después de 5000ms
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!userName) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 24 }}
          exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full overflow-hidden"
        >
          <h2 className="text-3xl font-light font-sans text-text flex items-center gap-2 flex-wrap pb-2">
            <span>Hola {userName}, ¿lista para crear algo</span>
            <span className="bg-gradient-to-r from-purple-600 to-emerald-400 bg-clip-text text-transparent font-medium">
              increíble
            </span>
            <span>hoy?</span>
            <Sparkles 
              size={26} 
              className="text-[var(--color-accent)] inline-block animate-pulse ml-1" 
              strokeWidth={1.5} 
            />
          </h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
