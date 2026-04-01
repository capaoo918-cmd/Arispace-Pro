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

export default function App() {
  const [view, setView] = useState<string>('icebreaker');
  const [isLocked, setIsLocked] = useState<boolean>(true);

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
  );
}
