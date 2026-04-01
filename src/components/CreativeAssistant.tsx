import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArispaceStore } from '../store/useArispaceStore';
import { aiService } from '../services/aiService';

export const CreativeAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: 'Soy tu copiloto de diseño. Arrastra ideas al lienzo y pregúntame lo que necesites.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { workspaceItems } = useArispaceStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    try {
      const context = `Lienzo con ${workspaceItems.length} objetos arquitectónicos.`;
      const response = await aiService.askCreativeAssistant(userText, context);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Tuve un fallo de enlace neural.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[1000] flex flex-col items-start justify-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl w-[320px] h-[400px] flex flex-col mb-4 overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-[#1F2937] px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                <span className="text-white text-xs font-bold tracking-widest uppercase">Copiloto IA</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-[#1F2937] text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none shadow-sm border border-gray-200/50'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 border border-gray-200/50 text-gray-500 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Analizando</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Pregunta sobre materiales, luz, estilo..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner text-gray-800"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 text-gray-400 hover:text-[#1F2937] disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1F2937] hover:bg-black text-white w-12 h-12 rounded-full shadow-xl flex items-center justify-center pointer-events-auto border border-white/10 relative group"
      >
        <Bot size={20} className={isOpen ? "opacity-50" : ""} />
        {!isOpen && <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full animate-pulse border-2 border-[#1F2937]"></span>}
      </motion.button>
    </div>
  );
};
