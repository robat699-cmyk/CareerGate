import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

export default function AIFloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hello! I am your local CareerGate Co-Pilot. How can I help you build your resume or prepare for applications today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const payload = {
        model: "qwen2.5-7b-instruct-1m",
        system_prompt: "You are a highly professional CareerGate AI Co-Pilot. You help users structure their resumes, prepare for interviews, and optimize job applications. Keep answers concise, metrics-driven, and highly professional.",
        input: userMsg,
        temperature: 0.7
      };

      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Connection Refused");

      const data = await res.json();
      let reply = data.content || data.choices?.[0]?.message?.content || data.response || data.text || data.output;
      
      // Parse array output specifically handling LM Studio object wrapped response
      if (Array.isArray(reply) && reply.length > 0 && reply[0].content) {
        reply = reply.map((item: any) => item.content).join("\n");
      } else if (typeof reply === 'object') {
        reply = reply.content || JSON.stringify(reply);
      }

      setMessages(prev => [...prev, { role: 'ai', text: reply || "I'm having trouble thinking right now." }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ System Offline: Ensure your local LM Studio is running on Port 1234.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-surface border border-line shadow-2xl shadow-primary/20 rounded-[2rem] flex flex-col overflow-hidden z-[9999] backdrop-blur-md"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-900 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">CareerGate Co-Pilot</h3>
                  <p className="text-red-200 text-[10px] uppercase font-black tracking-widest">Local AI Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-red-200 hover:text-white hover:rotate-90 transition-all p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-line shadow-xl shadow-primary/10'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5 text-primary" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] text-[13px] font-medium shadow-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-surface border border-line text-ink rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface border border-line shadow-xl shadow-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-surface border border-line px-4 py-4 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-surface border-t border-line shrink-0">
              <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask for resume feedback..."
                  className="w-full bg-bg border border-line rounded-xl pl-4 pr-12 py-3 text-sm focus:border-red-500/50 outline-none transition-all placeholder:text-muted text-ink shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors shadow-md"
                >
                  <Send className="w-4 h-4 translate-x-px -translate-y-px" />
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-red-600 to-red-900 text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(220,38,38,0.4)] hover:shadow-[0_15px_40px_rgba(220,38,38,0.6)] transition-all z-[9999] border-2 border-white/10"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
