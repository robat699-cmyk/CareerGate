import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Star, CheckCircle, Shield, Briefcase, TrendingUp, Sparkles, Target, BarChart3, Zap } from "lucide-react";

export default function Hero({ setView }: { setView: (v: any) => void }) {
  return (
    <section className="bg-bg py-20 px-4 border-b border-line perspective-[2000px] overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -100, rotateY: -20 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Career Growth
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-serif italic text-5xl lg:text-7xl leading-[0.9] text-ink mb-8 tracking-tighter"
            >
              Unlock your <span className="text-luxury">potential</span> today.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-ink/60 max-w-md mb-10 font-serif italic leading-relaxed"
            >
              CareerGate connects you with the world's most innovative companies. 
              Build ATS-optimized resumes, take certified assessments, and track your progress in real-time.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('jobs')}
                className="btn-premium px-10 py-4 text-sm"
              >
                Explore Jobs
                <ArrowRight className="w-5 h-5 ml-1" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('assessments')}
                className="btn-crimson px-10 py-4 text-sm"
              >
                Get Certified
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 relative perspective-[1000px]">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="AI Matching"
              desc="95% match accuracy using our proprietary NLP algorithms."
              delay={0.6}
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6 text-accent" />}
              title="Skill Tests"
              desc="Get certified with industry-standard assessments."
              delay={0.7}
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-secondary" />}
              title="Analytics"
              desc="Track your application conversion rates and market value."
              delay={0.8}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              whileHover={{ rotateY: -10, translateZ: 50, scale: 1.05 }}
              className="bg-[#111827] p-8 flex flex-col justify-end rounded-2xl shadow-xl shadow-indigo-500/10 perspective-[1000px] cursor-default"
            >
              <span className="text-white text-4xl font-serif italic mb-1">10k+</span>
              <span className="text-white/40 text-[8px] uppercase tracking-[0.2em] font-bold">Active Jobs</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ 
        y: -10,
        rotateY: 10,
        rotateX: -5,
        translateZ: 30,
        scale: 1.02
      }}
      className="surface-card p-8 flex flex-col gap-4 rounded-2xl hover:shadow-xl transition-all duration-500 perspective-[1000px] cursor-default"
    >
      <div className="p-2 bg-bg rounded-xl w-fit shadow-inner">{icon}</div>
      <h3 className="font-serif italic text-xl text-ink font-bold">{title}</h3>
      <p className="text-xs text-muted leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}
