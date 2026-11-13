import React, { useState, useEffect, useCallback } from "react";
import { Users, Briefcase, ShieldCheck, AlertCircle, Trash2, CheckCircle, Activity, CreditCard, Search, ExternalLink, Mail, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getJobs, deleteJob, getApplications, updateApplicationStatus, getPayments, approveJob, approveApplication, getAllUsers, getProfile, getPricing, setPricing, type Job, type Application, type Payment, type UserSummary, type Profile } from "../lib/store";
import ViewJobModal from "./ViewJobModal";
import type { LocalUser } from "../App";

export default function AdminDashboard({ user: adminUser }: { user: LocalUser | null }) {
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'applications' | 'reports' | 'payments'>('users');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [pricing, setLocalPricing] = useState({ pro: 2900, enterprise: 9900 });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const loadData = useCallback(() => {
    setJobs(getJobs());
    setApplications(getApplications());
    setPayments(getPayments());
    setLocalPricing(getPricing());
    
    // Fetch all user credentials from backend using absolute path
    const url = `${window.location.origin}/api/admin/all-users`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Admin users data received:", data);
        setAllUsers(data || []);
      })
      .catch(err => {
        console.error("Failed to fetch admin users data:", err);
        // If fetch fails, we show local users but they won't have passwords
        setAllUsers(getAllUsers()); 
      });
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('cg_store_update', loadData);
    return () => window.removeEventListener('cg_store_update', loadData);
  }, [loadData]);

  const handleUserClick = (u: any) => {
    setSelectedUser(u);
    setUserProfile(getProfile(u.uid || u.id, u.role));
  };

  const handleDeleteUser = async (uid: string) => {
    if (!uid) { alert("Error: User ID not found for this account."); return; }
    if (!window.confirm("Permanently remove this account from CareerGate? This action is irreversible.")) return;
    try {
      // Using POST even for deletion for maximum compatibility with all network environments
      const res = await fetch(`${window.location.origin}/api/admin/delete-user/${uid}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        alert("Account successfully deleted.");
        setSelectedUser(null);
        loadData();
      } else {
        const errData = await res.json();
        alert(`Deletion Error: ${errData.error || 'Server error'}`);
      }
    } catch (err) {
      console.error("Delete failure:", err);
      alert("Network error. Please ensure the backend is active.");
    }
  };

  const handleToggleUserStatus = async (uid: string, currentActive: boolean) => {
    if (!uid) { alert("Error: Invalid user data."); return; }
    const nextStatus = !currentActive;
    try {
      const res = await fetch(`${window.location.origin}/api/admin/toggle-user-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, active: nextStatus })
      });
      if (res.ok) {
        alert(`Account has been ${nextStatus ? 'Activated' : 'Deactivated'}.`);
        // Update with numeric 1/0 to match what MySQL/API returns
        setSelectedUser((prev: any) => ({ ...prev, active: nextStatus ? 1 : 0 }));
        loadData();
      } else {
        const errData = await res.json();
        alert(`Status Change Error: ${errData.error || 'Communication failed'}`);
      }
    } catch (err) {
      console.error("Status toggle failure:", err);
      alert("Network unreachable. Check your server connection.");
    }
  };

  const stats = {
    totalUsers: allUsers.length,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    totalRevenue: payments.reduce((acc, p) => acc + parseInt(p.amount.replace(/\D/g, '') || '0'), 0),
    pendingJobs: jobs.filter(j => !j.approved).length,
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-12">
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-line pb-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">System Administration v2.0</span>
          <h2 className="text-4xl font-serif italic text-ink">Master Dashboard</h2>
          <p className="text-sm text-muted mt-1">Real-time oversight of CareerGate platform operations.</p>
        </div>
        <div className="flex items-center gap-4 mt-6 md:mt-0 p-1.5 bg-surface border border-line rounded-2xl">
          <div className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Security Level 4
          </div>
          <div className="w-10 h-10 bg-bg border border-line rounded-xl flex items-center justify-center text-ink">
            <UserIcon className="w-5 h-5" />
          </div>
        </div>
      </motion.div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatCard label="Total Community" value={stats.totalUsers} icon={<Users />} color="sky" />
        <ModernStatCard label="Active Listings" value={stats.activeJobs} icon={<Briefcase />} color="gold" />
        <ModernStatCard label="Platform Revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} icon={<CreditCard />} color="green" />
        <ModernStatCard label="Approval Queue" value={stats.pendingJobs} icon={<AlertCircle />} color="red" />
      </div>

      {/* Content Area */}
      <div className="surface-card p-4 md:p-8">
        <div className="flex overflow-x-auto gap-4 mb-10 border-b border-line scrollbar-hide">
          {(['users', 'jobs', 'applications', 'payments', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`nav-pill whitespace-nowrap ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.replace('_', ' ')}
              <span className="ml-2 text-[8px] opacity-40">
                {tab === 'jobs' && jobs.length}
                {tab === 'users' && allUsers.length}
                {tab === 'applications' && applications.length}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="overflow-x-auto">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Identity & Email</th>
                      <th>Role & Status</th>
                      <th>Bcrypt Hash (stored in DB)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {allUsers.map((u, idx) => {
                      const isActive = u.active === true || u.active === 1;
                      return (
                      <tr key={u.uid || u.id} className="group">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-line rounded-lg flex items-center justify-center font-bold text-xs uppercase text-ink">
                              {u.displayName?.charAt(0) || u.email?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-ink">{u.displayName}</p>
                              <p className="text-[10px] text-primary">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full w-fit ${
                               u.role === 'admin' ? 'bg-red-500/10 text-red-600' : 'bg-line text-ink'
                            }`}>{u.role}</span>
                            {!isActive && (
                              <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full bg-red-600 text-white w-fit animate-pulse">DEACTIVATED</span>
                            )}
                          </div>
                        </td>
                        <td className="text-[9px] text-emerald-500 font-mono max-w-[260px] truncate" title={u.password}>
                          {u.password ? u.password : <span className="text-red-400 italic">No hash found</span>}
                        </td>
                        <td>
                           <button onClick={() => handleUserClick(u)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                    {allUsers.length === 0 && (
                      <tr><td colSpan={4} className="py-20 text-center text-muted italic">Waiting for platform registrations...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="surface-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-lg transition-all border-l-4 border-l-primary/30">
                  <div>
                    <h4 className="font-serif italic text-xl text-ink">{job.title}</h4>
                    <p className="text-sm text-muted">{job.company} • {job.location}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-primary">{job.type}</span>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-gold">{job.salary}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedJob(job)} className="p-3 bg-surface border border-line text-ink hover:text-primary rounded-xl transition-all shadow-sm">
                      <Search className="w-5 h-5" />
                    </button>
                    {!job.approved ? (
                      <button onClick={() => approveJob(job.id)} className="btn-premium">
                        <CheckCircle className="w-4 h-4" /> Approve Listing
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-green-500/20">
                        <ShieldCheck className="w-4 h-4" /> Approved & Viral
                      </span>
                    )}
                    <button onClick={() => deleteJob(job.id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div key="apps" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="overflow-x-auto">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Role & Company</th>
                      <th>Application Pitch</th>
                      <th>Resume</th>
                      <th>Status & Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id}>
                        <td>
                          <p className="font-bold text-ink">{app.candidateName}</p>
                          <p className="text-[10px] text-muted">{app.appliedAt}</p>
                        </td>
                        <td>
                          <p className="text-sm font-medium text-ink">{app.jobTitle}</p>
                          <p className="text-[10px] text-primary uppercase font-bold tracking-widest">{app.companyName}</p>
                        </td>
                        <td className="max-w-xs">
                          <p className="text-[11px] text-ink/60 truncate italic">"{app.description || 'No pitch provided'}"</p>
                        </td>
                        <td>
                          {app.resumeUrl ? (
                            <a 
                              href={app.resumeUrl} 
                              download={app.resumeUrl.startsWith('data:') ? `${app.candidateName.replace(/\s+/g, '_')}_Resume.pdf` : undefined}
                              target={app.resumeUrl.startsWith('data:') ? undefined : "_blank"} 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-[10px] font-bold"
                            >
                              <ExternalLink className="w-3 h-3" /> {app.resumeUrl.startsWith('data:') ? 'Download PDF' : 'View Link'}
                            </a>
                          ) : <span className="text-red-500/40 text-[10px]">No Link</span>}
                        </td>
                        <td>
                          <div className="flex flex-col gap-2">
                            <select
                              value={app.status}
                              onChange={(e) => updateApplicationStatus(app.id, e.target.value as Application['status'])}
                              className={`text-[9px] font-black uppercase tracking-widest rounded-lg px-2 py-1.5 border cursor-pointer focus:outline-none transition-all ${
                                app.status === 'accepted' ? 'bg-green-500/10 text-green-600 border-green-500/30' :
                                app.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                                app.status === 'interview' ? 'bg-purple-500/10 text-purple-600 border-purple-500/30' :
                                'bg-primary/10 text-primary border-primary/30'
                              }`}
                            >
                              <option value="applied">Applied</option>
                              <option value="interview">Interview</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            {!app.approvedByAdmin ? (
                              <button
                                onClick={() => approveApplication(app.id)}
                                className="px-2 py-1 bg-red-600 text-white text-[8px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all shadow-sm"
                              >
                                ✓ Approve for Employer
                              </button>
                            ) : (
                              <span className="flex items-center gap-1 text-green-500 text-[8px] font-bold uppercase">
                                <CheckCircle className="w-3 h-3" /> Employer Approved
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr><td colSpan={5} className="py-20 text-center text-muted italic">No applications pending review...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
             <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <div className="overflow-x-auto">
                 <table className="premium-table">
                   <thead>
                     <tr>
                       <th>Identity</th>
                       <th>Investment</th>
                       <th>Status</th>
                       <th>Timeline</th>
                     </tr>
                   </thead>
                   <tbody>
                     {payments.map(p => (
                       <tr key={p.id}>
                         <td><p className="font-mono text-xs text-ink">{p.userEmail}</p></td>
                         <td>
                           <p className="text-sm font-bold text-ink">{p.amount}</p>
                           <p className="text-[10px] text-gold uppercase font-black">{p.plan}</p>
                         </td>
                         <td><span className="text-green-500 font-bold text-[10px]">SUCCESS</span></td>
                         <td className="text-[10px] text-muted">{new Date(p.date).toLocaleDateString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </motion.div>
          )}

           {activeTab === 'settings' && (
             <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="surface-card p-6 border-gold/30 block">
                 <h3 className="text-xl font-serif italic text-gold mb-6 border-b border-line pb-4 flex items-center gap-2"><CreditCard className="w-5 h-5"/> Pricing Configuration</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Pro Plan Price (BDT)</label>
                     <input type="number" value={pricing.pro} onChange={e => setLocalPricing(p => ({...p, pro: Number(e.target.value)}))} className="w-full bg-bg border border-line p-3 rounded-xl mt-1 text-ink focus:border-gold outline-none" />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Enterprise Plan Price (BDT)</label>
                     <input type="number" value={pricing.enterprise} onChange={e => setLocalPricing(p => ({...p, enterprise: Number(e.target.value)}))} className="w-full bg-bg border border-line p-3 rounded-xl mt-1 text-ink focus:border-gold outline-none" />
                   </div>
                   <button onClick={() => { setPricing(pricing.pro, pricing.enterprise); alert('Pricing Settings Updated globally.'); }} className="w-full py-3 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gold hover:text-white transition-all border border-gold/20">Update Pricing Matrix</button>
                 </div>
               </div>
               <div className="surface-card p-6 border-sky-500/30 block">
                 <h3 className="text-xl font-serif italic text-sky-500 mb-6 border-b border-line pb-4 flex items-center gap-2"><Activity className="w-5 h-5"/> Meeting & News Feed Control</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Schedule Platform Meeting</label>
                     <input type="datetime-local" className="w-full bg-bg border border-line p-3 rounded-xl mt-1 text-ink outline-none" />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Broadcast Feed Announcement</label>
                     <textarea rows={2} placeholder="Enter global alert..." className="w-full bg-bg border border-line p-3 rounded-xl mt-1 text-ink outline-none"></textarea>
                   </div>
                   <button onClick={() => alert('Broadcast successfully pushed to platform feeds')} className="w-full py-3 bg-sky-500/10 text-sky-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-sky-500 hover:text-white transition-all border border-sky-500/20">Broadcast Global Update</button>
                 </div>
               </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="absolute inset-0 bg-bg/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="surface-card w-full max-w-2xl p-8 relative z-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="flex justify-between items-start mb-10">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-line rounded-2xl flex items-center justify-center font-bold text-2xl font-serif italic text-ink">
                    {selectedUser.displayName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif italic text-ink">{selectedUser.displayName}</h3>
                    <p className="text-muted flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" /> {selectedUser.email}
                    </p>
                    <span className="inline-block mt-3 px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full">{selectedUser.role}</span>
                  </div>
                </div>
                 <button 
                  onClick={() => handleDeleteUser(selectedUser.uid || selectedUser.id)}
                  className="p-3 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-600/20"
                  title="Permanently Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-ink/40">Portfolio Oversight</h4>
                  <div className="space-y-3">
                    <div className="surface-card p-4 bg-bg/40 border-none">
                      <p className="text-[10px] font-bold text-muted uppercase mb-2">Resume Status</p>
                      {userProfile?.resumeUrl ? (
                        <a 
                          href={userProfile.resumeUrl} 
                          download={userProfile.resumeUrl.startsWith('data:') ? `${selectedUser.displayName.replace(/\s+/g, '_')}_Resume.pdf` : undefined}
                          target={userProfile.resumeUrl.startsWith('data:') ? undefined : "_blank"} 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary font-bold hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" /> {userProfile.resumeUrl.startsWith('data:') ? 'Download Local PDF' : 'View Link'}
                        </a>
                      ) : <p className="text-sm italic opacity-40">No resume linked</p>}
                    </div>
                    <div className="surface-card p-4 bg-bg/40 border-none">
                      <p className="text-[10px] font-bold text-muted uppercase mb-2">Platform Bio</p>
                      <p className="text-sm text-ink/80 leading-relaxed italic">{userProfile?.description || "No bio provided"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-ink/40">Certification Record</h4>
                  <div className="space-y-3">
                    {userProfile?.certificates && userProfile.certificates.length > 0 ? userProfile.certificates.map(c => (
                      <div key={c.id} className="p-3 bg-gold/5 border border-gold/10 rounded-xl">
                        <p className="text-sm font-bold text-ink">{c.title}</p>
                        <p className="text-[9px] text-gold uppercase font-black">Score: {c.score}%</p>
                      </div>
                    )) : <p className="text-center py-6 text-muted italic text-xs">No certifications earned</p>}
                  </div>
                </div>
              </div>

               <div className="mt-10 flex gap-4">
                <button className="btn-premium flex-1">Send System Message</button>
                <button 
                  onClick={() => {
                    const isActive = selectedUser.active === true || selectedUser.active === 1;
                    handleToggleUserStatus(selectedUser.uid || selectedUser.id, isActive);
                  }}
                  className={`flex-1 px-8 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border ${
                    (selectedUser.active === false || selectedUser.active === 0)
                      ? 'bg-green-500 text-white border-green-600 hover:bg-green-600' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  {(selectedUser.active === false || selectedUser.active === 0) ? 'Activate Account' : 'Deactivate Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <ViewJobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ModernStatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const styles = {
    sky: 'from-sky-500/10 to-transparent border-sky-500/20 text-sky-500',
    gold: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-500',
    green: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-500',
    red: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-500',
  }[color as any] || '';

  return (
    <motion.div whileHover={{ y: -5 }} className={`surface-card p-6 bg-gradient-to-br ${styles} border relative overflow-hidden`}>
      <div className="flex justify-between items-start">
        <div className="p-3 bg-surface rounded-xl border border-line shadow-sm">{icon}</div>
        <span className="text-3xl font-mono font-black text-ink">{value}</span>
      </div>
      <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-muted">{label}</p>
    </motion.div>
  );
}
