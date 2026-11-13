import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, ArrowRight, Trophy } from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is the primary purpose of React's useEffect hook?",
    options: [
      "To manage local component state",
      "To perform side effects in functional components",
      "To optimize rendering performance",
      "To define component structure"
    ],
    correct: 1
  },
  {
    id: 2,
    text: "Which of the following is NOT a valid Tailwind CSS utility class?",
    options: [
      "p-4",
      "bg-blue-500",
      "flex-center",
      "text-xl"
    ],
    correct: 2
  }
];

export default function SkillAssessment({ title, onComplete }: { title: string, onComplete: (score: number) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);
    
    if (currentStep < MOCK_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setFinished(true);
      const score = newAnswers.reduce((acc, ans, i) => ans === MOCK_QUESTIONS[i].correct ? acc + 1 : acc, 0);
      onComplete((score / MOCK_QUESTIONS.length) * 100);
    }
  };

  if (finished) {
    const score = (answers.reduce((acc, ans, i) => ans === MOCK_QUESTIONS[i].correct ? acc + 1 : acc, 0) / MOCK_QUESTIONS.length) * 100;
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-8" />
          <h2 className="text-4xl font-serif italic mb-4">Assessment Complete</h2>
          <div className="text-6xl font-mono mb-8">{score}%</div>
          <p className="text-lg opacity-70 mb-12">
            {score >= 70 ? "Congratulations! You've passed the assessment and earned your certificate." : "You didn't pass this time. Review the material and try again in 24 hours."}
          </p>
          <button className="px-8 py-4 bg-[#141414] text-[#E4E3E0] font-medium hover:opacity-90 transition-opacity">
            View Certificate
          </button>
        </motion.div>
      </div>
    );
  }

  const question = MOCK_QUESTIONS[currentStep];

  return (
    <div className="max-w-3xl mx-auto py-20 px-4 perspective-[1000px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 border-b border-[#141414] pb-8"
      >
        <span className="font-serif italic text-sm uppercase tracking-widest opacity-50">Question {currentStep + 1} of {MOCK_QUESTIONS.length}</span>
        <h2 className="text-4xl font-serif italic mt-2">{title}</h2>
      </motion.div>

      <div className="space-y-12">
        <motion.h3 
          key={currentStep}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-medium leading-relaxed font-serif italic"
        >
          {question.text}
        </motion.h3>
        <div className="grid grid-cols-1 gap-6">
          {question.options.map((option, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, rotateX: -20, translateZ: -50 }}
              animate={{ opacity: 1, rotateX: 0, translateZ: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ 
                scale: 1.02, 
                rotateY: 5, 
                translateZ: 20,
                boxShadow: "8px 8px 0px #141414" 
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(i)}
              className="p-8 border border-[#141414] text-left bg-white hover:bg-[#141414] hover:text-[#E4E3E0] transition-all flex justify-between items-center group shadow-[4px_4px_0px_#141414]"
            >
              <span className="text-lg font-mono uppercase tracking-tight">{option}</span>
              <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-24 w-full h-2 bg-[#141414]/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / MOCK_QUESTIONS.length) * 100}%` }}
          className="h-full bg-[#141414]"
        />
      </div>
    </div>
  );
}
