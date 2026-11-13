import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getJobsByEmployer, addJob, updateJob, deleteJob, getAllApplicationsForEmployer, updateApplicationStatus, getNotifications, markAsRead, type Job, type Application, type Notification } from "../lib/store";
import { Users, Briefcase, TrendingUp, Search, MoreHorizontal, Plus, X, MapPin, DollarSign, CheckCircle, Trash2, Edit3, Bell, Info, Image as ImageIcon, Eye } from "lucide-react";
import ViewJobModal from "./ViewJobModal";
import type { LocalUser } from "../App";

export default function EmployerDashboard({ user }: { user: LocalUser | null }) {
  const [isPosting, setIsPosting] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applicants' | 'notifications'>('overview');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterJobId, setFilterJobId] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "Full-time",
    description: "",
    requirements: "",
    bannerUrl: "",
  });
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedJobView, setSelectedJobView] = useState<Job | null>(null);

  const loadData = useCallback(() => {
    if (!user) return;
    setJobs(getJobsByEmployer(user.uid));
    setApplications(getAllApplicationsForEmployer(user.uid).filter(a => a.approvedByAdmin)); // Only show approved candidates
    setNotifications(getNotifications(user.uid));
  }, [user]);

  useEffect(() => {
    loadData();
    window.addEventListener('cg_store_update', loadData);
    window.addEventListener('storage', loadData); // Sync across tabs natively
    return () => {
      window.removeEventListener('cg_store_update', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, [loadData]);

  // Handle navigation context from "View Applicants" clicks in JobFeed
  useEffect(() => {
    const navTab = (window as any).__cgNavTab;
    const navJobId = (window as any).__cgNavJobId;
    if (navTab === 'applicants') {
      setActiveTab('applicants');
      if (navJobId) setFilterJobId(navJobId);
      // Clear the context so it doesn't persist
      (window as any).__cgNavTab = null;
      (window as any).__cgNavJobId = null;
    }
  }, []);

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (editingJob) {
      updateJob(editingJob.id, newJob);
      setEditingJob(null);
      setSuccessMsg("✅ Job updated and sent for review!");
    } else {
      addJob({
        ...newJob,
        employerId: user.uid,
        status: 'active',
        matchScore: Math.floor(Math.random() * 15) + 80,
      });
      setSuccessMsg("✅ Job posted! awaiting Admin approval.");
    }
    
    setIsPosting(false);
    setNewJob({ title: "", company: "", location: "", salary: "", type: "Full-time", description: "", requirements: "", bannerUrl: "" });
    setBannerPreview(null);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      bannerUrl: job.bannerUrl || ""
    });
    setBannerPreview(job.bannerUrl || null);
    setIsPosting(true);
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm("Delete this job posting?")) {
      deleteJob(jobId);
    }
  };

  const handleStatusChange = (appId: string, status: Application['status']) => {
    updateApplicationStatus(appId, status);
  };

  const stats = {
    totalApplicants: applications.length,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    interviews: applications.filter(a => a.status === 'interview').length,
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 perspective-[1000px]">
      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[200] bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-bold"
          >
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-6 border-b border-line pb-4"
      >
        <div>
          <span className="font-serif italic text-[10px] uppercase tracking-widest opacity-50">Welcome, {user?.displayName}</span>
          <h2 className="text-2xl font-serif italic mt-0.5">Recruitment Overview</h2>
        </div>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('notifications')}
            className="relative p-2.5 bg-surface border border-line rounded-xl shadow-sm hover:shadow-md transition-all text-ink"
          >
            <Bell className="w-4 h-4" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setEditingJob(null); setIsPosting(true); }}
            className="btn-premium px-5 py-2.5"
          >
            <Plus className="w-3.5 h-3.5" /> Post New Job
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard icon={<Users className="w-4 h-4" />} label="Total Applicants" value={String(stats.totalApplicants)} change={`${stats.interviews} in interview`} delay={0.1} />
        <StatCard icon={<Briefcase className="w-4 h-4" />} label="Active Jobs" value={String(stats.activeJobs)} change="Live postings" delay={0.2} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Conversion Rate" value={stats.totalApplicants > 0 ? `${Math.round((stats.interviews / stats.totalApplicants) * 100)}%` : '0%'} change="Interview rate" delay={0.3} />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-line">
        {(['overview', 'jobs', 'applicants', 'notifications'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[10px] uppercase tracking-widest font-bold capitalize transition-all border-b-2 ${
              activeTab === tab ? 'border-primary text-primary opacity-100' : 'border-transparent text-muted opacity-50 hover:opacity-100'
            }`}
          >
            {tab} 
            {tab === 'jobs' && ` (${jobs.length})`} 
            {tab === 'applicants' && ` (${applications.length})`}
            {tab === 'notifications' && notifications.filter(n => !n.read).length > 0 && ` (${notifications.filter(n => !n.read).length})`}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <h3 className="text-xl font-serif italic mb-4 text-ink">Recent Applicants</h3>
            <motion.div className="surface-card">
              <div className="grid grid-cols-4 p-4 border-b border-line text-[8px] uppercase tracking-[0.2em] font-bold text-muted">
                <span>Candidate</span><span>Job</span><span>Status</span><span className="text-right">Action</span>
              </div>
              {applications.slice(0, 5).length > 0 ? applications.slice(0, 5).map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                  className="grid grid-cols-4 p-4 border-b border-line last:border-0 items-center hover:bg-bg/50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-serif italic text-sm text-ink">{app.candidateName}</span>
                  </div>
                  <div className="text-[9px] font-mono text-muted truncate">{app.jobTitle}</div>
                  <div>
                    <span className={app.status === 'interview' ? 'badge-gold' : app.status === 'accepted' ? 'badge-green' : app.status === 'rejected' ? 'badge-red' : 'badge-sky'}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as Application['status'])}
                      className="text-[8px] border border-line p-1 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-ink transition-all"
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accept</option>
                      <option value="rejected">Reject</option>
                    </select>
                    <button 
                      onClick={() => setSelectedApp(app)}
                      className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20"
                      title="View Details"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )) : (
                <div className="p-8 text-center opacity-30">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-serif italic">No applicants yet. Post jobs to get applications.</p>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* AI Talent Scout */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <motion.div whileHover={{ scale: 1.02 }} className="surface-card bg-gradient-to-br from-primary/10 to-transparent border-primary/20 p-6">
              <h3 className="text-lg font-serif italic mb-3 text-ink">AI Talent Scout</h3>
              <p className="text-[10px] text-muted mb-4 leading-relaxed font-serif italic">
                {applications.length > 0 ? `${applications.length} candidates found. Top matches for your open roles:` : 'Post a job to see AI-matched candidates.'}
              </p>
              <div className="space-y-2.5">
                {applications.slice(0, 3).map((app, i) => (
                  <motion.div key={app.id} whileHover={{ x: 2, backgroundColor: 'rgba(var(--primary), 0.05)' }} className="p-3 border border-line rounded-xl hover:border-primary/20 cursor-pointer transition-colors">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-ink">{app.candidateName}</span>
                      <span className="text-[8px] font-mono text-green-500 font-bold">{90 - i * 5}% Match</span>
                    </div>
                    <p className="text-[8px] text-muted font-mono truncate">{app.jobTitle}</p>
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={() => setActiveTab('applicants')}
                className="w-full mt-6 btn-premium py-2 bg-transparent border border-primary text-primary hover:bg-primary hover:text-white"
              >
                View All Applicants
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {jobs.length > 0 ? jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="surface-card p-6 flex justify-between items-center transition-all"
            >
              <div>
                <h4 className="font-serif italic text-lg text-ink">{job.title}</h4>
                <p className="text-[10px] font-mono text-muted">{job.location} • {job.salary} • {job.type}</p>
                <p className="text-[9px] font-mono text-green-600 mt-1 font-bold">
                  {getAllApplicationsForEmployer(user?.uid || '').filter(a => a.jobId === job.id).length} applicants
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={job.approved ? 'badge-green' : 'badge-gold'}>
                    {job.approved ? 'Live' : 'Approval Pending'}
                </span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedJobView(job)} className="p-2.5 bg-bg/50 border border-line text-primary rounded-xl transition-colors">
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEditJob(job)} className="p-2.5 hover:bg-primary/10 text-primary rounded-xl transition-colors">
                  <Edit3 className="w-4 h-4" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDeleteJob(job.id)} className="p-2.5 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-20 opacity-30">
              <Briefcase className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-serif italic">No jobs posted yet. Click "Post New Job" to get started.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Applicants Tab */}
      {activeTab === 'applicants' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {filterJobId && (
            <div className="flex items-center gap-3 mb-4 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">
                Showing applicants for: <span className="font-black">{jobs.find(j => j.id === filterJobId)?.title || filterJobId}</span>
              </p>
              <button onClick={() => setFilterJobId(null)} className="ml-auto text-[9px] text-muted hover:text-red-500 font-bold uppercase tracking-widest">
                Show All
              </button>
            </div>
          )}
          {(filterJobId ? applications.filter(a => a.jobId === filterJobId) : applications).length > 0
            ? (filterJobId ? applications.filter(a => a.jobId === filterJobId) : applications).map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="surface-card p-6 flex flex-col md:flex-row justify-between md:items-center transition-all gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 font-bold text-sm">
                    {app.candidateName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-serif italic text-lg text-ink">{app.candidateName}</h4>
                    <p className="text-[10px] font-mono text-muted">{app.jobTitle} • Applied {app.appliedAt}</p>
                  </div>
                </div>
                {app.description && (
                  <p className="text-[11px] text-ink/60 italic mt-2 ml-10 line-clamp-2">"{app.description}"</p>
                )}
                {app.resumeUrl && (
                  <a 
                    href={app.resumeUrl} 
                    download={app.resumeUrl.startsWith('data:') ? `${app.candidateName.replace(/\s+/g, '_')}_Resume.pdf` : undefined}
                    target={app.resumeUrl.startsWith('data:') ? undefined : "_blank"} 
                    rel="noopener noreferrer"
                    className="text-[10px] text-red-500 hover:underline font-bold flex items-center gap-1 mt-1 ml-10">
                    📎 {app.resumeUrl.startsWith('data:') ? 'Download Resume PDF' : 'View Resume Link'}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <select
                  value={app.status}
                  onChange={e => handleStatusChange(app.id, e.target.value as Application['status'])}
                  className="text-[9px] border border-line p-2 rounded-xl outline-none bg-surface text-ink focus:ring-2 focus:ring-red-500/20 transition-all font-bold"
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Schedule Interview</option>
                  <option value="accepted">Accept</option>
                  <option value="rejected">Reject</option>
                </select>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedApp(app)}
                  className="px-4 py-2 bg-red-500/10 text-red-500 text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-20 opacity-30">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-serif italic">
                {filterJobId ? 'No approved applicants for this job yet.' : 'No applicants yet. Your job postings will attract candidates.'}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {notifications.length > 0 ? notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => markAsRead(notif.id)}
              className={`surface-card p-5 flex items-start gap-3 cursor-pointer transition-all ${notif.read ? 'opacity-50' : 'border-red-500/30 shadow-md shadow-red-500/5'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.read ? 'bg-muted/10 text-muted' : 'bg-red-500/10 text-red-500'}`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${notif.read ? 'text-muted' : 'text-ink'}`}>{notif.message}</p>
                <p className="text-[9px] opacity-40 uppercase font-mono mt-1 text-muted">{new Date(notif.date).toLocaleString()}</p>
              </div>
              {!notif.read && <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />}
            </motion.div>
          )) : (
            <div className="text-center py-20 opacity-30">
              <Bell className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-serif italic">No notifications yet.</p>
            </div>
          )}
        </motion.div>
      )}
      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <ApplicationDetailModal 
            application={selectedApp} 
            onClose={() => setSelectedApp(null)} 
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="surface-card p-8 w-full max-w-2xl relative shadow-2xl"
            >
              <button 
                onClick={() => setIsPosting(false)} 
                className="absolute top-6 right-6 p-2 text-muted hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-serif italic mb-8 text-ink border-b border-line pb-4">
                {editingJob ? `Edit Job Listing` : 'Publish New Opportunity'}
              </h3>
              <form onSubmit={handlePostJob} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-bold tracking-widest opacity-50">Job Banner (JPG/PNG)</label>
                  <div className="flex flex-col gap-3">
                    {bannerPreview && (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border border-line">
                        <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => { setBannerPreview(null); setNewJob({ ...newJob, bannerUrl: "" }); }}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg backdrop-blur-sm hover:bg-black/70 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className={`relative ${bannerPreview ? 'hidden' : 'block'}`}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64 = reader.result as string;
                              setBannerPreview(base64);
                              setNewJob({ ...newJob, bannerUrl: base64 });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full h-24 border-2 border-dashed border-line rounded-xl flex flex-col items-center justify-center gap-2 bg-bg/50 hover:bg-bg transition-all">
                        <ImageIcon className="w-6 h-6 text-muted" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Click to upload banner</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <FormField label="Job Title" value={newJob.title} onChange={v => setNewJob({ ...newJob, title: v })} placeholder="Senior Product Designer" icon={<Briefcase className="w-3 h-3 opacity-30" />} />
                  <FormField label="Company Name" value={newJob.company} onChange={v => setNewJob({ ...newJob, company: v })} placeholder="Acme Corp" />
                  <FormField label="Location" value={newJob.location} onChange={v => setNewJob({ ...newJob, location: v })} placeholder="Remote / Dhaka" icon={<MapPin className="w-3 h-3 opacity-30" />} />
                  <FormField label="Salary Range" value={newJob.salary} onChange={v => setNewJob({ ...newJob, salary: v })} placeholder="$120k–$150k" icon={<DollarSign className="w-3 h-3 opacity-30" />} />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8px] uppercase font-bold tracking-widest opacity-50">Job Type</label>
                  <select value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })} className="w-full bg-transparent border-b border-[#141414] py-1 focus:outline-none text-sm font-bold">
                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8px] uppercase font-bold tracking-widest opacity-50">Job Description</label>
                  <textarea required rows={2} className="w-full bg-bg border border-line rounded-xl p-3 text-[10px] focus:ring-1 focus:ring-primary outline-none transition-all"
                    value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} placeholder="Describe the role and responsibilities..." />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8px] uppercase font-bold tracking-widest opacity-50">Requirements</label>
                  <textarea required rows={2} className="w-full bg-bg border border-line rounded-xl p-3 text-[10px] focus:ring-1 focus:ring-primary outline-none transition-all"
                    value={newJob.requirements} onChange={e => setNewJob({ ...newJob, requirements: e.target.value })} placeholder="Key qualifications..." />
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
                  className="btn-premium w-full py-4 rounded-xl"
                >
                  {editingJob ? 'Update Posting' : 'Publish Job Opportunity'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedJobView && (
          <ViewJobModal job={selectedJobView} onClose={() => setSelectedJobView(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ApplicationDetailModal({ application, onClose, onStatusChange }: { application: Application; onClose: () => void; onStatusChange: (id: string, s: any) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-surface w-full max-w-lg p-8 rounded-[32px] shadow-2xl border border-line"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-serif italic font-bold text-ink leading-tight">{application.candidateName}</h2>
                <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Applicant for {application.jobTitle}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-bg border border-line rounded-xl text-ink/40 hover:text-ink transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-[10px] uppercase font-black tracking-widest text-primary mb-3">Professional Pitch</h3>
            <div className="bg-bg/50 p-6 rounded-2xl border border-line italic font-serif text-ink/70 leading-relaxed text-sm">
              "{application.description || "No pitch provided by candidate."}"
            </div>
          </section>

          <section>
            <h3 className="text-[10px] uppercase font-black tracking-widest text-accent mb-3">Links & documents</h3>
            {application.resumeUrl ? (
              <a 
                href={application.resumeUrl} 
                download={application.resumeUrl.startsWith('data:') ? `${application.candidateName.replace(/\s+/g, '_')}_Resume.pdf` : undefined}
                target={application.resumeUrl.startsWith('data:') ? undefined : "_blank"} 
                rel="noopener noreferrer" 
                className="flex items-center justify-between p-4 bg-surface border border-line rounded-2xl hover:border-primary transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-ink/60">
                    {application.resumeUrl.startsWith('data:') ? 'Download Candidate Resume (PDF)' : 'View Candidate Resume'}
                  </span>
                </div>
                <Info className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
              </a>
            ) : (
              <p className="text-xs text-red-500/60 font-medium ml-2">No resume link provided.</p>
            )}
          </section>

          <div className="pt-6 border-t border-line flex flex-col gap-4">
            <label className="text-[10px] uppercase font-black tracking-widest text-ink/40 ml-1">Update Status</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { onStatusChange(application.id, 'interview'); onClose(); }}
                className="py-3 px-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-secondary transition-all shadow-lg shadow-primary/20"
              >
                Schedule Interview
              </button>
              <button 
                onClick={() => { onStatusChange(application.id, 'accepted'); onClose(); }}
                className="py-3 px-4 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
              >
                Accept Candidate
              </button>
              <button 
                onClick={() => { onStatusChange(application.id, 'rejected'); onClose(); }}
                className="py-3 px-4 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all col-span-2 shadow-lg shadow-red-500/20 opacity-80 hover:opacity-100"
              >
                Decline Application
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, value, onChange, placeholder, icon }: any) {
  return (
    <div className="space-y-0.5">
      <label className="text-[8px] uppercase font-bold tracking-widest opacity-50">{label}</label>
      <div className={`flex items-center gap-1.5 ${icon ? 'border-b border-[#141414]' : ''}`}>
        {icon}
        <input
          required
          className={`w-full bg-transparent py-1 focus:outline-none text-sm ${!icon ? 'border-b border-[#141414]' : ''}`}
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="surface-card p-6 group transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
          {icon}
        </div>
        <span className="text-[10px] font-mono text-green-500 font-bold">{change}</span>
      </div>
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted group-hover:text-primary transition-all block mb-1">{label}</span>
      <div className="text-3xl font-serif italic text-ink">{value}</div>
    </motion.div>
  );
}
