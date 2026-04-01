import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Layout & Shell ---
import { MainLayout } from './components/MainLayout';
import { PinLockScreen } from './components/PinLockScreen';
import { QuickCapturePanel } from './components/QuickCapturePanel';

// --- Views (modular, migrated) ---
import { IcebreakerView } from './components/IcebreakerView';
import { WorkspaceView } from './components/Workspace/WorkspaceView';
import { MaterialsLabView } from './components/MaterialsLabView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

// ─────────────────────────────────────────────────────────────────────────────
// App — Root Component
// All view routing is hash-based (#icebreaker, #materials, #moodboard, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import { useArispaceStore } from './store/useArispaceStore';

export default function App() {
  const [view, setView] = useState<string>('icebreaker');
  const { isLocked, setIsLocked, autoLockTime, isDarkMode } = useArispaceStore();

  // Smart Suspension / Inactivity Timer
  useEffect(() => {
    if (autoLockTime === 0 || isLocked) return;
    
    let timerId: ReturnType<typeof setTimeout>;
    const lockdown = () => setIsLocked(true);
    const resetTimer = () => {
      clearTimeout(timerId);
      timerId = setTimeout(lockdown, autoLockTime * 60000); // Minutes to MS
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timerId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [autoLockTime, isLocked, setIsLocked]);

  // One-time setup: pin seed + storage cleanup on new version deploy
  useEffect(() => {
    // Ensure the default PIN is always set so Ariana is never locked out
    localStorage.setItem('arispace_pin', '1507');

    // Version-gated storage cleanup — prevents stale data from old builds
    const CLEAN_VERSION = 'v1.2_final';
    if (localStorage.getItem('arispace_clean_marker') !== CLEAN_VERSION) {
      localStorage.removeItem('arispace-storage');
      localStorage.setItem('arispace_clean_marker', CLEAN_VERSION);
      console.log('[Arispace] Storage cleaned for new version. System ready.');
    }
  }, []);

  // Hash-based routing: browser back/forward navigation + deep links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setView(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // apply on initial load
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderView = () => {
    switch (view) {
      case 'moodboard': return <WorkspaceView />;
      case 'materials': return <MaterialsLabView />;
      case 'reports':   return <ReportsView />;
      case 'settings':  return <SettingsView />;
      default:          return <IcebreakerView />;
    }
  };

  return (
    <>
      {/* Global CSS Injector for Dark Mode */}
      {isDarkMode && (
        <style dangerouslySetInnerHTML={{ __html: `
          /* Gris Oscuro Profundo / Carbón */
          body, .bg-\\[\\#FAF9FF\\], .bg-white, .bg-gray-50, .bg-\\[\\#ffffff\\] {
            background-color: #0F172A !important;
            color: #F8FAFC !important;
            border-color: #334155 !important;
          }
          /* Tonos Púrpura y Morado Eléctrico para Botones/Acentos */
          .bg-\\[\\#1F2937\\], .bg-black, button.bg-\\[\\#1F2937\\] {
            background-color: #4C1D95 !important;
            border-color: #5B21B6 !important;
          }
          button:hover.bg-\\[\\#1F2937\\], button:hover.bg-black {
            background-color: #5B21B6 !important;
          }
          /* Reestructuración de Textos de alto contraste */
          .text-\\[\\#1F2937\\], .text-gray-800, .text-gray-900, .text-black, .text-gray-700 {
            color: #F8FAFC !important;
          }
          h1, h2, h3, span, p {
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          }
          /* Transformar el esmeralda genérico en Morado Eléctrico Neón */
          .text-emerald-500, .text-emerald-600 {
            color: #C084FC !important;
          }
          .bg-emerald-500, .bg-emerald-600 {
            background-color: #9333EA !important;
            border-color: #A855F7 !important;
          }
          .bg-emerald-50 {
            background-color: #4C1D95 !important;
          }
          .shadow-luxury, .shadow-xl, .shadow-lg, .shadow-2xl, .shadow-sm {
            box-shadow: 0 10px 40px -10px rgba(139,92,246,0.3) !important;
          }
          /* Fondos de cajas flotantes */
          .bg-white\\/40, .bg-white\\/60, .bg-white\\/80, .bg-white\\/90 {
            background-color: rgba(30,41,59, 0.7) !important;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(139,92,246,0.4) !important;
          }
        `}} />
      )}

      <AnimatePresence mode="wait">
      {isLocked ? (
        <PinLockScreen
          key="lock"
          onUnlock={() => setIsLocked(false)}
        />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <MainLayout>
            {renderView()}
          </MainLayout>
          <QuickCapturePanel />
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
