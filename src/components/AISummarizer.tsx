import React, { useState } from "react";
import { Sparkles, FileText, Copy, Check, RefreshCw } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { motion } from "motion/react";

export default function AISummarizer() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    
    setIsSummarizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-latest",
        contents: `Summarize the following job description or professional profile into a concise, impact-driven paragraph (max 100 words). Focus on key skills, achievements, and value proposition: \n\n${inputText}`,
        config: {
          systemInstruction: "You are a world-class executive recruiter and career coach. Your summaries are professional, punchy, and highlight the most critical information for decision-makers.",
        }
      });
      
      setSummary(response.text || "Failed to generate summary.");
    } catch (error) {
      console.error("Summarization error:", error);
      setSummary("Error: Unable to connect to AI service. Please check your API key.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-20 px-4 perspective-[1000px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-12 border-b border-[#141414] pb-8"
      >
        <div>
          <span className="font-serif italic text-sm uppercase tracking-widest opacity-50">AI Career Tools</span>
          <h2 className="text-5xl font-serif italic mt-2">AI Summarizer</h2>
        </div>
        <div className="flex gap-4">
          <motion.div 
            whileHover={{ scale: 1.05, rotateY: 10 }}
            className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] text-xs font-mono shadow-[4px_4px_0px_#888]"
          >
            <Sparkles className="w-4 h-4" />
            AI_POWERED
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif italic">Input Text</h3>
            <span className="text-[10px] uppercase tracking-widest opacity-50">{inputText.length} characters</span>
          </div>
          <motion.textarea 
            whileFocus={{ scale: 1.01, rotateX: 2 }}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste a long job description, your resume text, or a cover letter here..."
            className="w-full h-80 p-6 border border-[#141414] bg-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#141414] transition-all shadow-[4px_4px_0px_#141414]"
          />
          <motion.button 
            whileHover={{ scale: 1.02, translateZ: 20 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSummarize}
            disabled={isSummarizing || !inputText.trim()}
            className="w-full py-4 bg-[#141414] text-[#E4E3E0] text-sm font-medium hover:opacity-90 disabled:opacity-30 transition-all flex items-center justify-center gap-3 shadow-[8px_8px_0px_#888]"
          >
            {isSummarizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Summary
              </>
            )}
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif italic">AI Output</h3>
            {summary && (
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:opacity-50 transition-opacity"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <motion.div 
            whileHover={{ rotateY: -5, rotateX: 2, translateZ: 30 }}
            className="w-full h-80 p-8 border border-[#141414] bg-[#141414] text-[#E4E3E0] overflow-auto shadow-[8px_8px_0px_#141414]"
          >
            {summary ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-serif italic leading-relaxed"
              >
                {summary}
              </motion.p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                <FileText className="w-12 h-12 mb-4" />
                <p className="text-sm">Your summary will appear here after processing.</p>
              </div>
            )}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 border border-[#141414]/10 bg-white shadow-[4px_4px_0px_#141414]"
          >
            <h4 className="text-xs uppercase tracking-widest font-bold mb-4">Pro Tips:</h4>
            <ul className="text-xs space-y-2 opacity-70 list-disc pl-4">
              <li>Use summaries for your LinkedIn "About" section.</li>
              <li>Add AI-generated summaries to the top of your resume.</li>
              <li>Summarize long job descriptions to quickly identify key requirements.</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
