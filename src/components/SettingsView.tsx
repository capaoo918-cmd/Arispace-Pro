import React, { useState, useEffect } from 'react';
import { WelcomeHeader } from './WelcomeHeader';
import { ShieldCheck, Lock, Unlock, KeyRound, CheckCircle, Moon, Sun, Timer } from 'lucide-react';
import { useArispaceStore } from '../store/useArispaceStore';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsView: React.FC = () => {
  const { isDarkMode, toggleDarkMode, autoLockTime, setAutoLockTime } = useArispaceStore();

  const [hasPin, setHasPin] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'change' | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    checkPin();
  }, []);

  const checkPin = () => {
    const pin = localStorage.getItem('arispace_pin');
    setHasPin(!!pin && pin.length === 4);
  };

  const handleModalOpen = (mode: 'create' | 'change') => {
    setModalMode(mode);
    setPinInput('');
    setConfirmInput('');
    setStep('enter');
  };

  const handleModalClose = () => {
    setModalMode(null);
  };

  const handlePinSubmit = () => {
    if (step === 'enter' && pinInput.length === 4) {
      setStep('confirm');
    } else if (step === 'confirm' && confirmInput.length === 4) {
      if (pinInput === confirmInput) {
        localStorage.setItem('arispace_pin', pinInput);
        setHasPin(true);
        handleModalClose();
        triggerToast();
      } else {
        // Red shake effect ideally, but for now just reset confirm
        setConfirmInput('');
      }
    }
  };

  const handleRemovePin = () => {
    localStorage.removeItem('arispace_pin');
    setHasPin(false);
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto hide-scrollbar pb-12 relative">
      <div className="w-full flex-grow flex flex-col gap-10">
        
        {/* Header & Title */}
        <div>
          <WelcomeHeader />
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] mt-8 font-sans drop-shadow-sm">
            Configuration
          </h1>
        </div>

        {/* Settings Layout */}
        <div className="flex flex-col gap-8 w-full max-w-4xl relative z-10">
          
          {/* Security & Privacy Section */}
          <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-white/50 p-10 flex flex-col gap-8">
            <div className="flex items-center gap-3 border-b border-black/5 pb-6">
              <ShieldCheck size={28} className="text-[var(--color-primary)]" />
              <h2 className="text-2xl font-bold font-sans tracking-tight text-[#1F2937]">Security & Privacy</h2>
            </div>

            {/* App Access PIN Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white/40 rounded-3xl border border-white/50 shadow-inner group transition-all hover:bg-white/60">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center flex-shrink-0 shadow-inner border border-white/30">
                  {hasPin ? <Lock size={24} className="text-[var(--color-primary)]" /> : <Unlock size={24} className="text-[#9CA3AF]" />}
                </div>
                <div className="flex flex-col gap-1.5 mt-0.5">
                  <h3 className="text-lg font-bold text-[#1F2937] tracking-tight">App Access PIN</h3>
                  <p className="text-[13px] font-medium text-[#4B5563] max-w-sm leading-relaxed">
                    {hasPin 
                      ? "Your Arispace session is currently secured with a 4-digit PIN lock screen."
                      : "Secure your presentations and sensitive concepts by enforcing a 4-digit PIN upon app launch."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {!hasPin ? (
                  <button 
                    onClick={() => handleModalOpen('create')}
                    className="bg-[var(--color-accent)] hover:brightness-105 text-white font-bold text-sm tracking-wide px-6 py-4 rounded-2xl shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    Set up 4-Digit PIN
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleModalOpen('change')}
                      className="bg-white hover:bg-black/5 text-[#1F2937] border border-black/10 font-bold text-sm tracking-wide px-6 py-4 rounded-2xl shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      Change PIN
                    </button>
                    <button 
                      onClick={handleRemovePin}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-500/20 font-bold text-sm tracking-wide px-6 py-4 rounded-2xl shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      Remove PIN
                    </button>
                  </>
                )}
              </div>
            </div>
            
          </section>

          {/* Workspace Preferences Section */}
          <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-white/50 p-10 flex flex-col gap-8">
            <div className="flex items-center gap-3 border-b border-black/5 pb-6">
              <h2 className="text-2xl font-bold font-sans tracking-tight text-[#1F2937]">Workspace Preferences</h2>
            </div>
            
            {/* Dark Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-white/40 rounded-3xl border border-white/50 shadow-inner group transition-all hover:bg-white/60">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center text-[#1F2937] shadow-inner border border-white/30">
                    {isDarkMode ? <Moon size={22} className="text-[#C084FC]" /> : <Sun size={22} className="text-[#6D28D9]" />}
                 </div>
                 <div className="flex flex-col">
                   <h3 className="font-bold text-[#1F2937] text-lg">Dark Mode</h3>
                   <span className="text-[13px] font-medium text-[#4B5563] max-w-sm">
                     Reduce visual strain and immerse creatively with high contrast deep tones.
                   </span>
                 </div>
               </div>
               
               <button 
                  onClick={toggleDarkMode} 
                  className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 shadow-inner cursor-pointer ${isDarkMode ? 'bg-[#6D28D9]' : 'bg-gray-300'}`}
               >
                 <motion.div 
                   layout 
                   className={`w-6 h-6 rounded-full bg-white shadow-md ${isDarkMode ? 'ml-auto' : ''}`} 
                 />
               </button>
            </div>

            {/* Smart Suspend Timer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-white/40 rounded-3xl border border-white/50 shadow-inner group transition-all hover:bg-white/60">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center text-[#1F2937] shadow-inner border border-white/30">
                    <Timer size={22} className={autoLockTime > 0 ? "text-[#C084FC]" : "text-[#9CA3AF]"} />
                 </div>
                 <div className="flex flex-col">
                   <h3 className="font-bold text-[#1F2937] text-lg">Smart Auto-Lock</h3>
                   <span className="text-[13px] font-medium text-[#4B5563] max-w-sm">
                     Suspend the workspace automatically to save memory and protect ideas.
                   </span>
                 </div>
               </div>
               
               <div className="relative">
                 <select 
                   value={autoLockTime}
                   onChange={(e) => setAutoLockTime(Number(e.target.value))}
                   className="appearance-none bg-white/80 hover:bg-white text-[#1F2937] font-bold text-sm px-5 py-3 pr-10 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 transition-shadow cursor-pointer shadow-sm"
                 >
                   <option value={0}>Disabled (Never)</option>
                   <option value={5}>5 Minutes</option>
                   <option value={10}>10 Minutes</option>
                   <option value={15}>15 Minutes</option>
                   <option value={20}>20 Minutes</option>
                   <option value={25}>25 Minutes</option>
                   <option value={30}>30 Minutes</option>
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    ▼
                 </div>
               </div>
            </div>
          </section>

        </div>
      </div>

      {/* PIN Modal Flow */}
      <AnimatePresence>
        {modalMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/80 p-12 flex flex-col items-center w-[450px] relative"
            >
              <button 
                onClick={handleModalClose}
                className="absolute top-8 right-8 text-[#9CA3AF] hover:text-[#1F2937] transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 border border-white/50">
                <KeyRound size={40} className="text-[var(--color-primary)]" strokeWidth={1.5} />
              </div>

              <h3 className="text-3xl font-extrabold text-[#1F2937] tracking-tight mb-2 font-sans">
                {step === 'enter' ? (modalMode === 'create' ? 'Set New PIN' : 'Change PIN') : 'Confirm PIN'}
              </h3>
              <p className="text-sm font-medium text-[#4B5563] text-center mb-10">
                {step === 'enter' ? 'Enter new 4-digit PIN' : 'Confirm new 4-digit PIN'}
              </p>

              <input 
                type="password"
                inputMode="numeric"
                maxLength={4}
                autoFocus
                value={step === 'enter' ? pinInput : confirmInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    step === 'enter' ? setPinInput(val) : setConfirmInput(val);
                  }
                }}
                className="w-full text-center tracking-[1em] text-4xl font-extrabold bg-black/5 border border-black/10 rounded-2xl py-6 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-[#1F2937] shadow-inner font-mono transition-shadow"
              />

              <button 
                onClick={handlePinSubmit}
                disabled={(step === 'enter' ? pinInput.length : confirmInput.length) !== 4}
                className="mt-10 w-full bg-[#1F2937] hover:bg-black text-white font-bold tracking-widest text-xs uppercase py-5 rounded-[1.25rem] shadow-xl transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {step === 'enter' ? 'Next Step' : 'Save Security PIN'}
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-12 right-12 z-50 bg-emerald-500/10 backdrop-blur-2xl border border-emerald-500/20 text-emerald-700 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <CheckCircle size={24} className="text-emerald-500" strokeWidth={2.5} />
            <span className="text-sm font-bold tracking-wide uppercase">Security PIN updated</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
