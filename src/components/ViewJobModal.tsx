import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, DollarSign, Clock, Briefcase, Zap, CheckCircle } from "lucide-react";
import type { Job } from "../lib/store";

function DetailBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white/90 text-[10px] font-bold uppercase tracking-wider">
      {icon}
      {text}
    </div>
  );
}

export default function ViewJobModal({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 30, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="relative h-[220px] flex flex-col justify-end" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
          {job.bannerUrl && (
            <img src={job.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.6) 60%, transparent 100%)' }} />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 flex items-center justify-center w-10 h-10 rounded-2xl transition-all hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative z-10 p-10">
            <h2 className="text-4xl font-serif italic font-bold text-white mb-4">{job.title}</h2>
            <div className="flex flex-wrap gap-3">
              <DetailBadge icon={<MapPin className="w-3.5 h-3.5" />} text={job.location} />
              <DetailBadge icon={<Briefcase className="w-3.5 h-3.5" />} text={job.company} />
              <DetailBadge icon={<DollarSign className="w-3.5 h-3.5" />} text={job.salary} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-primary">📋 Job Specifications</p>
            <p className="text-[15px] leading-relaxed font-serif italic text-ink/80">
              {job.description || "A pivotal role in our growing organization."}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-accent">⚡ Requisites</p>
            <div className="p-6 rounded-2xl bg-bg border border-line">
              <p className="text-[13px] font-mono leading-relaxed text-ink/70">
                {job.requirements || "Details are being finalized."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-line">
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Status</p>
              <p className="text-sm font-bold text-ink">{job.approved ? 'Live & Verified' : 'Awaiting Review'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-gold/5 border border-gold/10">
              <p className="text-[9px] font-black uppercase tracking-widest text-gold mb-1">AI Match Factor</p>
              <p className="text-sm font-bold text-ink">{job.matchScore || 85}% Confidence</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
