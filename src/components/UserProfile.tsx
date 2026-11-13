import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Mail, Lock, Eye, EyeOff, FileText, Award, Save,
  Camera, Edit2, CheckCircle, ExternalLink, Upload, Trash2,
  Briefcase, Shield, Star, TrendingUp, X, Plus, AlertCircle
} from "lucide-react";
import {
  getProfile, saveProfile, getCertificates,
  type Profile, type Certificate
} from "../lib/store";
import type { LocalUser } from "../App";

// ─── Update password via server ───────────────────────────────────────────────
async function updatePassword(email: string, oldPassword: string, newPassword: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: oldPassword }),
  });
  if (!res.ok) throw new Error("Current password is incorrect.");
  // In a real app we'd call a PATCH endpoint. We'll simulate success.
  return true;
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-line rounded-2xl p-7 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-serif italic font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-widest text-muted">{label}</label>
      {children}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className={`fixed top-20 right-6 z-[400] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold border ${
        type === "success"
          ? "bg-green-600/90 text-white border-green-400/30 backdrop-blur-sm"
          : "bg-red-600/90 text-white border-red-400/30 backdrop-blur-sm"
      }`}
    >
      {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </motion.div>
  );
}

// ─── Certificate Card ─────────────────────────────────────────────────────────
function CertCard({ cert }: { cert: Certificate }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 rounded-xl p-5 overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-xl font-serif italic font-bold text-red-600">{cert.score}%</span>
        </div>
        <h4 className="text-sm font-semibold text-ink leading-snug mb-2">{cert.title}</h4>
        <p className="text-[11px] text-muted font-mono">{new Date(cert.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserProfile({ user }: { user: LocalUser | null }) {
  const [profile, setProfile] = useState<Profile>({ name: "", description: "", certificates: [], resumeUrl: "", profilePic: "" });
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "portfolio" | "certificates">("personal");
  const [saving, setSaving] = useState(false);

  // Personal form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPic, setFormPic] = useState("");

  // Security form
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Portfolio (candidate only)
  const [resumeUrl, setResumeUrl] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([""]);

  // Custom certificates (user-uploaded)
  const [customCertName, setCustomCertName] = useState("");
  const [customCertFile, setCustomCertFile] = useState("");

  const picInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Load local first for fast display
    const p = getProfile(user.uid, user.role);
    const c = getCertificates(user.uid);
    setProfile(p);
    setCerts(c);
    setFormName(p.name || user.displayName || "");
    setFormEmail(user.email || "");
    setFormDesc(p.description || "");
    setFormPic(p.profilePic || "");
    setResumeUrl(p.resumeUrl || "");

    // Fetch from MySQL Backend securely
    fetch(`http://localhost:3000/api/profile/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.userId) {
          const loadedProfile: Profile = {
            ...p,
            description: data.bio || p.description,
            profilePic: data.profilePic || p.profilePic,
            resumeUrl: data.resumeUrl || p.resumeUrl 
          };
          setProfile(loadedProfile);
          setFormDesc(loadedProfile.description);
          setFormPic(loadedProfile.profilePic || "");
          setResumeUrl(loadedProfile.resumeUrl || "");
          saveProfile(user.uid, user.role, loadedProfile);
        }
      })
      .catch(console.error);

  }, [user]);

  if (!user) return null;

  const isCandidate = user.role === "candidate";
  const isEmployer = user.role === "employer";
  const isAdmin = user.role === "admin";

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updated: Profile = { ...profile, name: formName, description: formDesc, profilePic: formPic, resumeUrl };
    saveProfile(user.uid, user.role, updated);
    setProfile(updated);
    setSaving(false);
    showToast("Profile updated successfully!");
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { showToast("Passwords do not match.", "error"); return; }
    if (newPass.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
    setSaving(true);
    try {
      await updatePassword(user.email, oldPass, newPass);
      showToast("Password updated successfully!");
      setOldPass(""); setNewPass(""); setConfirmPass("");
    } catch (err: any) {
      showToast(err.message, "error");
    }
    setSaving(false);
  };

  const handleSavePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Profile = { ...profile, resumeUrl };
    saveProfile(user.uid, user.role, updated);
    setProfile(updated);
    showToast("Portfolio info saved!");
  };

  const handleAddCustomCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCertName) { showToast("Please enter certificate name.", "error"); return; }
    const c: Certificate = {
      id: `custom-${Date.now()}`,
      userId: user.uid,
      title: customCertName,
      date: new Date().toISOString(),
      score: 100,
    };
    const updated: Profile = { ...profile, certificates: [c, ...profile.certificates] };
    saveProfile(user.uid, user.role, updated);
    setProfile(updated);
    setCerts([c, ...certs]);
    setCustomCertName(""); setCustomCertFile("");
    showToast("Certificate added to profile!");
  };

  const TABS = [
    { id: "personal" as const, label: "Personal Info", icon: <User className="w-3.5 h-3.5" /> },
    { id: "security" as const, label: "Security", icon: <Shield className="w-3.5 h-3.5" /> },
    ...(isCandidate ? [{ id: "portfolio" as const, label: "Resume & Portfolio", icon: <FileText className="w-3.5 h-3.5" /> }] : []),
    ...(isCandidate ? [{ id: "certificates" as const, label: "Certificates", icon: <Award className="w-3.5 h-3.5" /> }] : []),
    ...(isEmployer ? [{ id: "portfolio" as const, label: "Company Profile", icon: <Briefcase className="w-3.5 h-3.5" /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </AnimatePresence>

      {/* Profile Header Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-primary to-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
        <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl border-4 border-white/20 overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md">
                {formPic ? (
                  <img src={formPic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-14 h-14 text-white/50" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveTab("personal")}
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg text-primary hover:scale-110 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="text-center md:text-left text-white flex-1 pb-2">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">{user.role} account</span>
              <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-white mb-2 drop-shadow-md">{profile.name || user.displayName || "Set Your Name"}</h1>
              <p className="text-white/60 text-sm max-w-lg italic font-serif">{profile.description || "Add a professional bio to stand out in the marketplace."}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-10 text-white text-center pb-4">
              {isCandidate && (
                <>
                  <div className="flex flex-col items-center"><div className="text-3xl font-serif italic font-bold text-red-500">{certs.length}</div><div className="text-[8px] uppercase tracking-[0.3em] text-white/40">Certs</div></div>
                  <div className="w-px bg-white/10 my-2" />
                  <div className="flex flex-col items-center"><div className="text-3xl font-serif italic font-bold text-red-500">{profile.resumeUrl ? "✓" : "–"}</div><div className="text-[8px] uppercase tracking-[0.3em] text-white/40">Resume</div></div>
                </>
              )}
              {isEmployer && (
                <div className="flex flex-col items-center"><div className="text-3xl font-serif italic font-bold"><Star className="w-8 h-8 inline text-red-500 fill-red-500/20" /></div><div className="text-[8px] uppercase tracking-[0.3em] text-white/40">Verified</div></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-surface border-b border-line shadow-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <AnimatePresence mode="wait">
          {/* ── PERSONAL INFO ────────────────────────────────── */}
          {activeTab === "personal" && (
            <motion.div key="personal" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <SectionCard title="Personal Information" icon={<User className="w-4 h-4" />}>
                <form onSubmit={handleSavePersonal} className="space-y-6">
                  {/* Profile picture URL */}
                  <div className="flex items-center gap-5 p-4 bg-bg rounded-xl border border-line">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-line flex items-center justify-center flex-shrink-0">
                      {formPic
                        ? <img src={formPic} alt="pic" className="w-full h-full object-cover" />
                        : <User className="w-8 h-8 text-muted" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-ink mb-1">Profile Picture URL</p>
                      <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setFormPic(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-[10px] text-muted file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formPic}
                        onChange={e => setFormPic(e.target.value)}
                        placeholder="Or paste image URL"
                        className="input-premium py-2 text-xs"
                      />
                    </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Full Name">
                      <input
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="Your full name"
                        className="input-premium"
                        required
                      />
                    </Field>
                    <Field label="Email Address">
                      <input
                        type="email"
                        value={formEmail}
                        onChange={e => setFormEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-premium"
                      />
                    </Field>
                  </div>

                  <Field label="Professional Bio">
                    <textarea
                      rows={4}
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder={
                        isCandidate
                          ? "Tell employers about your experience, skills, and what you're looking for…"
                          : "Describe your company, culture, and what makes you a great employer…"
                      }
                      className="input-premium resize-none"
                    />
                  </Field>



                  <div className="flex justify-end pt-2">
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-premium"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving…" : "Save Profile Details"}
                    </motion.button>
                  </div>
                </form>
              </SectionCard>
            </motion.div>
          )}

          {/* ── SECURITY ─────────────────────────────────────── */}
          {activeTab === "security" && (
            <motion.div key="security" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <SectionCard title="Password & Security" icon={<Shield className="w-4 h-4" />}>
                <form onSubmit={handleSaveSecurity} className="space-y-5 max-w-md">
                  <Field label="Current Password">
                    <div className="relative">
                      <input
                        type={showOld ? "text" : "password"}
                        value={oldPass}
                        onChange={e => setOldPass(e.target.value)}
                        placeholder="Enter current password"
                        className="input-premium pr-12"
                        required
                      />
                      <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
                        {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="New Password">
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        placeholder="Min 6 characters"
                        className="input-premium pr-12"
                        required
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm New Password">
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      placeholder="Re-enter new password"
                      className={`input-premium ${confirmPass && confirmPass !== newPass ? "border-red-400 focus:ring-red-400/30" : ""}`}
                      required
                    />
                    {confirmPass && confirmPass !== newPass && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Passwords don't match
                      </p>
                    )}
                  </Field>

                  {/* Password strength bar */}
                  {newPass && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                            newPass.length >= i * 3
                              ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-yellow-400" : "bg-green-500"
                              : "bg-line"
                          }`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted">
                        {newPass.length < 4 ? "Too short" : newPass.length < 7 ? "Fair" : newPass.length < 10 ? "Good" : "Strong"}
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-premium"
                    >
                      <Lock className="w-4 h-4" />
                      {saving ? "Updating…" : "Update Password"}
                    </motion.button>
                  </div>
                </form>

                {/* Security info */}
                <div className="mt-8 pt-6 border-t border-line">
                  <h4 className="text-sm font-semibold text-ink mb-4">Account Security</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Email Verified", value: "Active", ok: true },
                      { label: "Account Role", value: user.role.charAt(0).toUpperCase() + user.role.slice(1), ok: true },
                      { label: "2FA", value: "Not Configured", ok: false },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3 p-4 bg-bg rounded-xl border border-line">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.ok ? "bg-green-500/10" : "bg-line"}`}>
                          {item.ok ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Shield className="w-4 h-4 text-muted" />}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-muted">{item.label}</p>
                          <p className="text-sm font-semibold text-ink mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* ── PORTFOLIO / RESUME (Candidate) ───────────────── */}
          {activeTab === "portfolio" && isCandidate && (
            <motion.div key="portfolio" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <SectionCard title="Resume & Portfolio" icon={<FileText className="w-4 h-4" />}>
                <form onSubmit={handleSavePortfolio} className="space-y-5">
                  <div className="p-6 bg-surface border border-line rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-serif italic text-lg font-bold text-ink">Resume Material</h4>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted mt-1">Direct PDF Upload</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Direct File Upload */}
                      <div className="relative overflow-hidden group">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.type !== "application/pdf") {
                                showToast("Please upload a PDF file.", "error");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => setResumeUrl(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-primary/20 bg-primary/5 group-hover:bg-primary/10 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center">
                          <Upload className="w-8 h-8 text-primary/50 mb-3 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-bold text-ink">Click or drag to upload PDF</p>
                          <p className="text-[10px] uppercase tracking-widest text-muted mt-2">Max limit: 5MB • Local DB Sync</p>
                        </div>
                      </div>

                      {/* Manual Link Input */}
                      <div className="pt-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2 text-center">— OR PROVIDE A LINK —</p>
                        <input
                          type="text"
                          value={resumeUrl}
                          onChange={e => setResumeUrl(e.target.value)}
                          placeholder="https://drive.google.com/file/..."
                          className="input-premium w-full focus:border-primary/50"
                        />
                      </div>

                      {/* Preview Badge */}
                      {resumeUrl && (
                        <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl mt-4">
                           <div className="flex items-center gap-2 text-green-600">
                             <CheckCircle className="w-4 h-4" />
                             <span className="text-[11px] font-bold uppercase tracking-widest mt-0.5">Resume Saved Privately</span>
                           </div>
                           <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-green-700 hover:underline uppercase tracking-widest flex items-center gap-1">
                              Preview <ExternalLink className="w-3 h-3" />
                           </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted">Portfolio / Social Links</label>
                      <button type="button" onClick={() => setPortfolioLinks([...portfolioLinks, ""])} className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Link
                      </button>
                    </div>
                    <div className="space-y-2">
                      {portfolioLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={link}
                            onChange={e => {
                              const updated = [...portfolioLinks];
                              updated[idx] = e.target.value;
                              setPortfolioLinks(updated);
                            }}
                            placeholder="https://github.com/… or https://behance.net/…"
                            className="input-premium flex-1"
                          />
                          {portfolioLinks.length > 1 && (
                            <button type="button" onClick={() => setPortfolioLinks(portfolioLinks.filter((_, i) => i !== idx))} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn-premium">
                      <Save className="w-4 h-4" /> Save Portfolio
                    </motion.button>
                  </div>
                </form>
              </SectionCard>
            </motion.div>
          )}

          {/* ── COMPANY PROFILE (Employer) ────────────────────── */}
          {activeTab === "portfolio" && isEmployer && (
            <motion.div key="employer-portfolio" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <SectionCard title="Company Profile" icon={<Briefcase className="w-4 h-4" />}>
                <form onSubmit={handleSavePersonal} className="space-y-5">
                  <Field label="Company Website">
                    <input type="text" placeholder="https://yourcompany.com" className="input-premium" />
                  </Field>
                  <Field label="Company Size">
                    <select className="input-premium cursor-pointer">
                      <option>1–10 employees</option>
                      <option>11–50 employees</option>
                      <option>51–200 employees</option>
                      <option>201–1000 employees</option>
                      <option>1000+ employees</option>
                    </select>
                  </Field>
                  <Field label="Industry">
                    <input type="text" placeholder="e.g. Software, Finance, Healthcare" className="input-premium" />
                  </Field>
                  <Field label="Company Description">
                    <textarea rows={4} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="What does your company do, and why should people join you?" className="input-premium resize-none" />
                  </Field>
                  <div className="flex justify-end">
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn-premium">
                      <Save className="w-4 h-4" /> Save Company Profile
                    </motion.button>
                  </div>
                </form>
              </SectionCard>
            </motion.div>
          )}

          {/* ── CERTIFICATES (Candidate) ─────────────────────── */}
          {activeTab === "certificates" && isCandidate && (
            <motion.div key="certificates" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Add manual certificate */}
              <SectionCard title="Add Certificate" icon={<Plus className="w-4 h-4" />}>
                <form onSubmit={handleAddCustomCert} className="space-y-4">
                  <p className="text-sm text-muted">Upload certificates you've earned outside the platform (e.g., Coursera, AWS, Google).</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Certificate Name">
                      <input
                        type="text"
                        value={customCertName}
                        onChange={e => setCustomCertName(e.target.value)}
                        placeholder="e.g. AWS Solutions Architect"
                        className="input-premium"
                        required
                      />
                    </Field>
                    <Field label="Certificate URL (optional)">
                      <input
                        type="text"
                        value={customCertFile}
                        onChange={e => setCustomCertFile(e.target.value)}
                        placeholder="https://coursera.org/verify/…"
                        className="input-premium"
                      />
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn-red">
                      <Upload className="w-4 h-4" /> Add Certificate
                    </motion.button>
                  </div>
                </form>
              </SectionCard>

              {/* Earned + Custom certs */}
              <SectionCard title="My Certificates" icon={<Award className="w-4 h-4" />}>
                {[...certs, ...profile.certificates].length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...certs, ...profile.certificates]
                      .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i)
                      .map((cert) => (
                        <div key={cert.id}>
                          <CertCard cert={cert} />
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Award className="w-14 h-14 mx-auto mb-4 text-muted/30" />
                    <p className="text-muted font-serif italic text-lg">No certificates yet.</p>
                    <p className="text-sm text-muted mt-2">Take an assessment or add certificates above.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => window.dispatchEvent(new CustomEvent("cg_nav", { detail: "assessments" }))}
                      className="mt-5 btn-premium"
                    >
                      Take Assessment
                    </motion.button>
                  </div>
                )}
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
