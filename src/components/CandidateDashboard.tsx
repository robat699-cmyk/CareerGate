import React, { useState, useEffect, useCallback } from "react";
import { Briefcase, FileText, CheckCircle, Clock, Star, TrendingUp, ArrowRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import JobCard from "./JobCard";
import { getApplicationsByCandidate, getJobs, hasApplied, applyToJob, type Application, type Job } from "../lib/store";
import type { LocalUser } from "../App";

export default function CandidateDashboard({ user }: { user: LocalUser | null }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'jobs'>('overview');
  const [toast, setToast] = useState('');

  const loadData = useCallback(() => {
    if (!user) return;
    const apps = getApplicationsByCandidate(user.uid);
    setApplications(apps);
    const jobs = getJobs().filter(j => !hasApplied(j.id, user.uid)).slice(0, 4);
    setRecommendedJobs(jobs);
  }, [user]);

  useEffect(() => {
    loadData();
    window.addEventListener('cg_store_update', loadData);
    return () => window.removeEventListener('cg_store_update', loadData);
  }, [loadData]);

  const stats = {
    applied: applications.length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'accepted').length,
  };

  const handleApply = (job: Job) => {
    if (!user) return;
    if (hasApplied(job.id, user.uid)) {
      setToast('Already applied to this job!');
    } else {
      // Open modal in feed instead of direct apply without resume
      window.dispatchEvent(new CustomEvent('cg_nav', { detail: 'feed' }));
      setToast(`Please find the job in the feed to apply with your resume.`);
    }
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 perspective-[1000px]">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-6 z-[300] bg-green-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-bold"
        >
          {toast}
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-12 border-b border-line pb-8"
      >
        <div>
          <span className="font-serif italic text-sm uppercase tracking-widest opacity-50">
            Welcome Back, {user?.displayName?.split(' ')[0] || 'Candidate'}
          </span>
          <h2 className="text-4xl font-serif italic mt-2">Candidate Dashboard</h2>
        </div>
        <div className="flex gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 10 }}
            className="flex items-center gap-2 px-4 py-2 bg-surface text-ink text-xs font-mono border border-line rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <TrendingUp className="w-4 h-4 text-primary" /> PROFILE: 88%
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <StatCard icon={<Briefcase className="w-6 h-6" />} label="Applied Jobs" value={stats.applied} delay={0.1} />
        <StatCard icon={<Clock className="w-6 h-6" />} label="Interviews" value={stats.interviews} delay={0.2} />
        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Offers" value={stats.offers} delay={0.3} />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-line">
        {(['overview', 'applications', 'jobs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[10px] uppercase tracking-widest font-bold capitalize transition-all border-b-2 ${
              activeTab === tab ? 'border-primary text-primary opacity-100' : 'border-transparent text-muted opacity-50 hover:opacity-100'
            }`}
          >
            {tab} {tab === 'applications' && ` (${applications.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif italic">Recent Applications</h3>
              <button onClick={() => setActiveTab('applications')} className="text-[10px] uppercase tracking-widest font-bold hover:underline text-primary">View All</button>
            </div>
            <div className="space-y-4">
              {applications.length > 0 ? (
                <>
                  <ApplicationRow app={applications[0]} delay={0.5} />
                  {applications.length > 1 && <ApplicationRow app={applications[1]} delay={0.6} statusOverride="interview" />}
                  {applications.length > 2 && <ApplicationRow app={applications[2]} delay={0.7} statusOverride="applied" />}
                  {applications.length > 3 && <ApplicationRow app={applications[3]} delay={0.8} statusOverride="rejected" />}
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card p-16 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted" />
                  <p className="text-lg font-serif italic text-muted">No applications yet. Browse jobs and start applying!</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="space-y-6">
            {/* AI Career Coach */}
            <motion.div whileHover={{ scale: 1.02 }} className="surface-card bg-gradient-to-br from-primary/10 to-transparent border-primary/20 p-8">
              <h3 className="text-xl font-serif italic text-ink mb-4">AI Career Coach</h3>
              <p className="text-sm text-muted mb-6 leading-relaxed font-serif italic">
                Based on your {applications.length} applications, focus on "System Design" to unlock higher-paying roles.
              </p>
              <div className="space-y-3">
                <motion.div whileHover={{ x: 5, backgroundColor: 'rgba(var(--primary), 0.05)' }} className="p-3 border border-line rounded-xl cursor-not-allowed transition-colors">
                  <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Next Step</span>
                  <p className="text-sm font-bold text-ink mt-0.5">Complete System Design Assessment</p>
                </motion.div>
                <motion.div whileHover={{ x: 5, backgroundColor: 'rgba(var(--primary), 0.05)' }} className="p-3 border border-line rounded-xl cursor-not-allowed transition-colors">
                  <span className="text-[9px] uppercase tracking-widest text-red-500 font-bold">Resume Tip</span>
                  <p className="text-sm font-bold text-ink mt-0.5">Add "Scalability" to your experience section</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Subscription upsell */}
            <motion.div whileHover={{ scale: 1.02 }} className="surface-card p-8">
              <h3 className="text-xl font-serif italic text-ink mb-4">Upgrade Plan</h3>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-sm">
                  <Star className="w-5 h-5 fill-primary/20" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-ink">Basic Plan</p>
                  <p className="text-xs text-muted font-mono">Free Tier</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.03 }}
                onClick={() => window.dispatchEvent(new CustomEvent('cg_nav', { detail: 'subscription' }))}
                className="btn-premium w-full py-3"
              >
                Upgrade to Pro
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {activeTab === 'applications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {applications.length > 0 ? applications.map((app, i) => (
            <div key={app.id}>
              <ApplicationRow app={app} delay={i * 0.05} />
            </div>
          )) : (
            <div className="text-center py-20 opacity-30">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-serif italic">No applications yet. Browse jobs and start applying!</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'jobs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="text-2xl font-serif italic mb-6">Recommended For You</h3>
          {recommendedJobs.map((job, idx) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
              <JobCard
                title={job.title}
                company={job.company}
                location={job.location}
                salary={job.salary}
                type={job.type}
                matchScore={job.matchScore || 85}
                applied={user ? hasApplied(job.id, user.uid) : false}
                onApply={() => handleApply(job)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function ApplicationRow({ app, delay, statusOverride }: { app: Application; delay: number; statusOverride?: string }) {
  const [showDetails, setShowDetails] = useState(false);
  const status = statusOverride || app.status;
  const statusClasses: Record<string, string> = {
    applied: 'badge-sky opacity-80',
    interview: 'badge-gold',
    accepted: 'badge-green',
    rejected: 'badge-red',
  };

  return (
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ scale: 1.01, x: 5 }}
        onClick={() => setShowDetails(!showDetails)}
        className="surface-card p-6 flex justify-between items-center group cursor-pointer"
      >
        <div>
          <h4 className="font-serif italic text-lg text-ink">{app.jobTitle}</h4>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted">{app.companyName} • {app.appliedAt}</p>
        </div>
        <div className="flex items-center gap-6">
          <span className={statusClasses[status] || 'badge-sky'}>
            {status}
          </span>
          <ArrowRight className={`w-4 h-4 text-muted group-hover:text-primary transition-all ${showDetails ? 'rotate-90' : ''}`} />
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-bg/50 border border-line p-6 rounded-2xl mx-2 mb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-[10px] uppercase font-bold tracking-widest text-muted mb-1">Resume Submitted</h5>
                  <p className="text-xs font-mono text-primary truncate">{app.resumeUrl?.substring(0, 30)}...</p>
                </div>
                <div>
                  <h5 className="text-[10px] uppercase font-bold tracking-widest text-muted mb-1">Application Date</h5>
                  <p className="text-xs text-ink">{app.appliedAt}</p>
                </div>
              </div>
              <div>
                <h5 className="text-[10px] uppercase font-bold tracking-widest text-muted mb-1">Your Pitch</h5>
                <p className="text-xs font-serif italic text-ink/70 leading-relaxed">
                  {app.description || "I am highly motivated to join your team as a developer. I have extensive experience in React and TypeScript."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, delay }: { icon: React.ReactNode; label: string; value: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="surface-card p-8 group transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
          {icon}
        </div>
        <div className="text-4xl font-serif italic text-ink">{value}</div>
      </div>
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted group-hover:text-primary transition-all">{label}</span>
    </motion.div>
  );
}
