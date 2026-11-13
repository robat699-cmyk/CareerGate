import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, Award, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { addCertificate } from "../lib/store";

const QUIZ_QUESTIONS = [
  { id: 1, question: "What is the primary role of React's Virtual DOM?", options: ["It replaces the actual DOM entirely", "It reduces direct DOM manipulation for performance", "It manages server-side logic", "It handles network requests"], correct: 1 },
  { id: 2, question: "Which hook is used for side effects in functional components?", options: ["useState", "useContext", "useEffect", "useMemo"], correct: 2 },
  { id: 3, question: "What is the purpose of TypeScript?", options: ["To make JS faster", "To add static typing to JavaScript", "To replace HTML", "To manage databases"], correct: 1 },
  { id: 4, question: "Which CSS property is used for flexbox centering?", options: ["align-content: center", "display: grid", "justify-content: center", "float: middle"], correct: 2 },
  { id: 5, question: "What does API stand for?", options: ["Application Process Interface", "Application Programming Interface", "Auto Program Integration", "Advanced Port Intervention"], correct: 1 },
  { id: 6, question: "What command is used to install dependencies in NPM?", options: ["npm run", "npm start", "npm install", "npm add"], correct: 2 },
  { id: 7, question: "What is JSX?", options: ["A JavaScript library", "A syntax extension for JavaScript", "A database query language", "A CSS framework"], correct: 1 },
  { id: 8, question: "What is a 'prop' in React?", options: ["A internal state of a component", "Arguments passed into React components", "A React global variable", "A type of hook"], correct: 1 },
  { id: 9, question: "What is 'State' in React?", options: ["Data passed from parent to child", "Internal data storage for components", "The current status of the network", "A library for routing"], correct: 1 },
  { id: 10, question: "Which company developed React?", options: ["Google", "Meta (Facebook)", "Amazon", "Microsoft"], correct: 1 }
];

export default function AssessmentQuiz({ userId, onComplete }: { userId: string; onComplete?: () => void }) {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  const startQuiz = () => {
    setStep('quiz');
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate final score
      const finalScore = newAnswers.reduce((acc, ans, idx) => {
        return ans === QUIZ_QUESTIONS[idx].correct ? acc + 1 : acc;
      }, 0);
      setScore(finalScore);
      setStep('result');

      // Generate certificate if score >= 8
      if (finalScore >= 8) {
        addCertificate(userId, 'candidate', {
          userId,
          title: "Professional React Developer Certificate",
          score: finalScore * 10
        });
      }
    }
  };

  const reset = () => {
    setStep('intro');
    setScore(0);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="surface-card p-12 text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Zap className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-serif italic font-bold mb-4 text-ink">Scale Your Career</h2>
            <p className="text-sm text-ink/40 mb-10 font-serif leading-relaxed italic max-w-md mx-auto">
              Pass this professional assessment with a score of **8/10** or higher to earn your verified **CareerGate Professional Certificate**.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={startQuiz}
              className="btn-premium px-12 py-4"
            >
              Start Your Assessment <ArrowRight className="w-4 h-4 ml-2" />
            </motion.button>
          </motion.div>
        )}

        {step === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="surface-card p-10"
          >
            <div className="flex justify-between items-center mb-10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Module Phase {currentQuestion + 1} / 10</span>
              <div className="w-40 h-1.5 bg-bg rounded-full overflow-hidden border border-line">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
                />
              </div>
            </div>
 
            <h3 className="text-2xl font-serif italic font-bold mb-10 text-ink leading-tight">{QUIZ_QUESTIONS[currentQuestion].question}</h3>
 
            <div className="space-y-4">
              {QUIZ_QUESTIONS[currentQuestion].options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ x: 8, backgroundColor: 'var(--bg)' }}
                  onClick={() => handleAnswer(idx)}
                  className="w-full text-left p-5 border border-line rounded-2xl hover:border-primary/50 transition-all text-base font-serif italic flex items-center gap-4 bg-surface/50 group"
                >
                  <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">{String.fromCharCode(65 + idx)}</span>
                  <span className="text-ink/80 group-hover:text-ink">{opt}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="surface-card p-14 text-center"
          >
            {score >= 8 ? (
              <div className="space-y-8">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner text-red-500">
                  <Award className="w-14 h-14" />
                </div>
                <div>
                  <h2 className="text-4xl font-serif italic font-bold text-ink">Assessment Passed!</h2>
                  <p className="text-red-500 font-mono text-xl font-black mt-2 tracking-widest uppercase">Certified Rank</p>
                </div>
                <div className="text-2xl font-mono text-ink/60">Final Score: <span className="text-red-600 font-black">{score * 10}%</span></div>
                <p className="text-sm opacity-60 text-ink/40 font-serif italic leading-relaxed max-w-sm mx-auto">
                  Exceptional performance. Your **Professional Resume Badge** has been unlocked and added to your portfolio.
                </p>
                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => { reset(); onComplete?.(); }}
                    className="btn-red px-14 py-4"
                  >
                    View Verified Badge
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner text-red-500/40">
                  <AlertCircle className="w-14 h-14" />
                </div>
                <h2 className="text-4xl font-serif italic font-bold text-ink">Keep Learning</h2>
                <div className="text-xl font-mono text-ink/60">Module Score: <span className="text-red-600 font-black">{score * 10}%</span></div>
                <p className="text-sm opacity-60 text-ink/40 font-serif italic leading-relaxed max-w-sm mx-auto">
                  A minimum of **80%** is required for certification. Review the curriculum and prepare for your next attempt.
                </p>
                <div className="flex gap-4 justify-center pt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={startQuiz}
                    className="btn-premium px-10 py-4"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Certification
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
