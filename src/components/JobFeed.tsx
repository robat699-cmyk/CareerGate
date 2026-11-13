import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, Briefcase, Sparkles, Zap, TrendingUp, CheckCircle, X, MapPin, DollarSign, Clock, AlertCircle } from "lucide-react";
import JobCard from "./JobCard";
import { getJobs, hasApplied, applyToJob, type Job } from "../lib/store";

function DetailBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white/90 text-[10px] font-bold uppercase tracking-wider">
      {icon}
      {text}
    </div>
  );
}

// ─── Number Counter Animation ────────────────────────────────────────────────
function Counter({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
}

// ─── Job Detail Modal ─────────────────────────────────────────────────────────
function JobDetailModal({ job, user, onClose, onApplied }: { job: Job; user: any; onClose: () => void; onApplied: () => void }) {
  const [applied, setApplied] = useState(user ? hasApplied(job.id, user.uid) : false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  const handleApply = () => {
    if (!user || user.role !== 'candidate') { 
      setError('Only candidates can apply for jobs.'); 
      return; 
    }
    if (!resumeUrl || !description) {
      setError('Please provide your resume and a brief description.');
      return;
    }
    if (applied) return;
    
    setApplying(true);
    
    // Simulate delay
    setTimeout(() => {
      applyToJob(job, user.uid, user.displayName || 'Candidate', resumeUrl, description);
      setApplied(true);
      setApplying(false);
      onApplied();
      setTimeout(onClose, 1500);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 bg-black/70 backdrop-blur-lg"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.93, y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Hero Header ── */}
        <div className="relative min-h-[220px] flex flex-col justify-end" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
          {job.bannerUrl && (
            <img src={job.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.6) 60%, transparent 100%)' }} />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 flex items-center justify-center w-10 h-10 rounded-2xl transition-all hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative z-10 p-10 pb-8">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full mb-4 shadow-xl" style={{ background: 'rgba(14,165,233,0.3)', border: '1px solid rgba(14,165,233,0.5)' }}>
              <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{job.company}</span>
            </div>
            <h2 className="text-4xl font-serif italic font-bold leading-tight text-white mb-5">{job.title}</h2>
            <div className="flex flex-wrap gap-3">
              <DetailBadge icon={<MapPin className="w-3.5 h-3.5" />} text={job.location} />
              <DetailBadge icon={<DollarSign className="w-3.5 h-3.5" />} text={job.salary} />
              <DetailBadge icon={<Clock className="w-3.5 h-3.5" />} text={job.type} />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-10" style={{ background: 'var(--surface)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* Left: Info */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-primary">📋 Role Blueprint</p>
                <p className="text-[15.5px] leading-relaxed font-serif italic text-ink/90">
                  {job.description || 'Defining the future of technology with precision and care.'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-accent">⚡ High-Value Skills</p>
                <div className="p-6 rounded-[2rem] bg-bg/50 border border-line">
                  <p className="text-[13px] leading-relaxed font-mono whitespace-pre-line text-ink">
                    {job.requirements || 'Expertise in modern engineering paradigms required.'}
                  </p>
                </div>
              </div>

              {/* Application Form */}
              {!applied && user?.role === 'candidate' && (
                <div className="space-y-6 pt-8 border-t border-line">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">✍️ Secure Submission</p>
                  <div className="space-y-4">
                    <div className="relative group">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setResumeUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all bg-bg border-2 border-dashed border-line group-hover:border-primary/50">
                        <span className="text-[11px] font-bold text-ink/70">
                          {resumeUrl ? '✓ Resume Attached' : 'Attach Professional Resume (PDF)'}
                        </span>
                        <div className="px-3 py-1.5 bg-primary/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">Upload</div>
                      </div>
                    </div>
                    
                    <textarea
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Why do you resonate with this mission?"
                      className="w-full rounded-2xl py-4 px-6 text-sm outline-none bg-bg border border-line focus:ring-4 focus:ring-primary/10 transition-all resize-none text-ink"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-600">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-[11px] font-bold">{error}</p>
                </div>
              )}
            </div>

            {/* Right: Meta & Action */}
            <div className="space-y-6">
              <div className="rounded-[2.5rem] p-8 text-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-xl shadow-primary/5">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 text-primary">AI Potency</p>
                <div className="text-6xl font-serif italic font-black text-primary leading-none mb-2">
                  <Counter value={job.matchScore || 85} />%
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Market Fit Score</p>
              </div>

              <motion.button
                whileHover={{ scale: applied || applying ? 1 : 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                disabled={applied || applying}
                className="w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl"
                style={applied ? {
                  background: 'rgba(34,197,94,0.1)',
                  color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.2)'
                } : {
                  background: 'var(--primary)',
                  color: 'white',
                  boxShadow: '0 20px 40px -10px rgba(14,165,233,0.4)'
                }}
              >
                {applying ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                ) : applied ? (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Transmission Sent
                  </motion.div>
                ) : (
                  '🚀 Apply for Role'
                )}
              </motion.button>

              {applied && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Status: Pending Verification</p>
                  <p className="text-[9px] text-green-600/60 font-medium italic font-serif">Admin and Employer have been notified of your interest.</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── JobFeed ─────────────────────────────────────────────────────────────────
export default function JobFeed({ user }: { user: any }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedCount, setAppliedCount] = useState(0);
  const [toast, setToast] = useState('');

  const loadJobs = useCallback(() => {
    setJobs(getJobs());
  }, []);

  useEffect(() => {
    loadJobs();
    window.addEventListener('cg_store_update', loadJobs);
    return () => window.removeEventListener('cg_store_update', loadJobs);
  }, [loadJobs]);

  const handleApply = (job: Job) => {
    if (!user) { alert('Please sign in to apply for jobs.'); return; }
    setSelectedJob(job);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || job.type === filter || (filter === 'Remote' && job.location.toLowerCase().includes('remote'));
    return matchesSearch && matchesFilter && job.approved;
  });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 mb-20">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-[300] bg-green-600 text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(22,163,74,0.3)] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 border border-green-500"
          >
            <CheckCircle className="w-5 h-5" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-primary/20 shadow-sm"
          >
            <Sparkles className="w-3 h-3" /> Career Opportunities
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-serif italic font-bold mb-4 leading-[1.1] tracking-tight text-ink">
            Elevate your <span className="text-primary underline decoration-primary/20">professional</span> trajectory.
          </h2>
          <p className="text-[15px] text-ink/40 font-serif italic max-w-sm leading-relaxed">
            Curated roles from visionary companies, analyzed by AI to align with your career goals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-transform group-focus-within:scale-110" />
            <input
              type="text"
              placeholder="Search by role or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg border border-line rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:placeholder:text-ink/20"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-bg border border-line rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer shadow-sm appearance-none min-w-[140px] text-center"
          >
            <option value="all">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedJob(job)}
              >
                <JobCard
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  salary={job.salary}
                  type={job.type}
                  matchScore={job.matchScore || 85}
                  applied={user ? hasApplied(job.id, user.uid) : false}
                  isOwner={job.employerId === user?.uid}
                  onApply={(e) => { e?.stopPropagation?.(); handleApply(job); }}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-24 bg-surface rounded-[2.5rem] border border-line border-dashed">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-ink/10" />
              <p className="text-xl font-serif italic text-ink/30">The marketplace is evolving. No matching roles found.</p>
              <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-6 text-[10px] font-black text-primary hover:underline uppercase tracking-[0.3em]">
                Reset Parameters
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="surface-card p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 relative overflow-hidden"
          >
            <Zap className="absolute -right-4 -top-4 w-32 h-32 text-primary/5 rotate-12" />
            <div className="relative z-10">
              <h3 className="text-2xl font-serif italic font-extrabold text-primary mb-4 leading-tight">AI Matching Insight</h3>
              <p className="text-[12px] leading-relaxed text-ink/60 mb-6 italic font-serif">
                Based on your current portfolio, you have a <span className="text-primary font-black">92%</span> resonance with full-stack roles.
              </p>
              <div className="space-y-4">
                {jobs.slice(0, 2).map(job => (
                  <div key={job.id} className="p-4 rounded-xl bg-bg/50 border border-line">
                    <p className="text-[11px] font-bold text-ink truncate">{job.title}</p>
                    <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-1">Match: {job.matchScore}%</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="surface-card p-8">
            <h3 className="text-lg font-serif italic font-bold text-ink mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Market Pulse
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React Native', 'Rust', 'Vite', 'PostgreSQL', 'Tailwind', 'Framer Motion'].map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-bg border border-line rounded-xl text-[9px] font-black uppercase tracking-widest text-ink/40 hover:text-primary transition-colors cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            user={user}
            onClose={() => setSelectedJob(null)}
            onApplied={() => {
              setAppliedCount(c => c + 1);
              setToast(`Application Transmitted!`);
              setTimeout(() => setToast(''), 3000);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
