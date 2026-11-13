import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download, Wand2, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
  User, Briefcase, GraduationCap, Wrench, Award, Phone, Mail, MapPin,
  Globe, Linkedin, Sparkles, FileText, CheckCircle, Loader2, AlertCircle,
  Printer, BrainCircuit, Rocket, Trophy, Heart, Languages as LangIcon, ListTodo, ShieldCheck,
  HelpingHand, Coffee
} from "lucide-react";
import { useAuth } from "../App";
import { getResume, saveResume } from "../lib/store";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkExperience { id: string; jobTitle: string; company: string; location: string; startDate: string; endDate: string; current: boolean; bullets: string[]; }
interface Project { id: string; title: string; role: string; description: string; technologies: string[]; }
interface Education { id: string; degree: string; institution: string; location: string; startDate: string; endDate: string; }
interface Certification { id: string; name: string; issuer: string; date: string; }
interface AwardItem { id: string; title: string; issuer: string; date: string; }
interface Volunteer { id: string; role: string; organization: string; description: string; date: string; }

interface ResumeData {
  fullName: string; jobTitle: string; email: string; phone: string; location: string; linkedin: string; website: string;
  summary: string; experience: WorkExperience[]; projects: Project[]; education: Education[];
  technicalSkills: string[]; softSkills: string[]; languages: string[]; certifications: Certification[]; 
  awards: AwardItem[]; volunteering: Volunteer[]; interests: string[];
}

const EMPTY_RESUME: ResumeData = {
  fullName: "", jobTitle: "", email: "", phone: "", location: "", linkedin: "", website: "",
  summary: "", experience: [], projects: [], education: [], technicalSkills: [], softSkills: [],
  languages: [], certifications: [], awards: [], volunteering: [], interests: [],
};

// ─── Local AI Helper (Vite Proxy Bridge) ──────────────────────────────────────
const AI_ENDPOINT = "/api/v1/chat/completions";

async function callLocalAI(prompt: string): Promise<string> {
  try {
    // Exact structure that was manually tested and confirmed with CURL
    const payload = {
      model: "qwen2.5-7b-instruct-1m",
      system_prompt: "You are a professional resume architect. Provide high-impact, metrics-driven career achievements.",
      input: prompt,
      temperature: 0.7
    };

    console.log("[AI Request]", AI_ENDPOINT, payload);

    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
       const rawText = await res.text();
       throw new Error(`AI error (${res.status}): ${rawText}`);
    }

    const data = await res.json();
    console.log("[AI Response]", data);
    
    // Support multiple format types depending on the local wrapper version
    let rawResult = data.content || data.choices?.[0]?.message?.content || data.response || data.text || data.output;
    
    // Parse array output specifically handling LM Studio object wrapped response
    if (Array.isArray(rawResult) && rawResult.length > 0 && rawResult[0].content) {
      rawResult = rawResult.map((item: any) => item.content).join("\n");
    } else if (typeof rawResult === 'object') {
       // Deeply extract generic object returns to avoid React child crashes
       rawResult = rawResult.content || JSON.stringify(rawResult);
    }
    
    return rawResult || "";
  } catch (err: any) {
    console.error("[AI] Call failed", err);
    throw new Error(`AI Offline: ${err.message}. Ensure LM Studio is running on Port 1234.`);
  }
}

// ─── Resume Preview ───────────────────────────────────────────────────────────
function ResumePreview({ data }: { data: ResumeData }) {
  const sectionTitle = (txt: string) => ( <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 border-b-2 border-blue-100 pb-1">{txt}</h2> );
  return (
    <div id="resume-document" className="bg-white p-0" style={{ fontFamily: "'Inter', sans-serif", width: '210mm', minHeight: '297mm', color: '#0f172a', backgroundColor: '#ffffff' }}>
      {/* Blueprint Header */}
      <div className="bg-[#1e3a8a] text-white p-12 relative overflow-hidden" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-1 leading-none text-white">{data.fullName || "Name Here"}</h1>
        <p className="text-blue-300 font-bold uppercase tracking-widest text-sm mb-6 mt-2">{data.jobTitle || "Professional Title"}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[9pt] opacity-90 border-t border-white/20 pt-4 mt-2">
          {data.phone && <span className="flex items-center gap-1.5 font-medium whitespace-nowrap">📞 {data.phone}</span>}
          {data.email && <span className="flex items-center gap-1.5 font-medium whitespace-nowrap">✉ {data.email}</span>}
          {data.location && <span className="flex items-center gap-1.5 font-medium whitespace-nowrap">📍 {data.location}</span>}
          {data.linkedin && <span className="flex items-center gap-1.5 font-medium whitespace-nowrap">🔗 {data.linkedin}</span>}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-8 p-10 space-y-8 bg-white">
          {data.summary && ( <section>{sectionTitle("Profile Summary")}<p className="text-[10pt] leading-relaxed text-slate-700 whitespace-pre-wrap">{data.summary}</p></section> )}
          {data.experience?.length > 0 && (
            <section>{sectionTitle("Professional Orbit")}
              <div className="space-y-6">{data.experience.map((exp: any) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1"><h3 className="text-[11pt] font-bold text-slate-900">{exp.jobTitle}</h3><span className="text-[8pt] font-bold text-slate-400">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span></div>
                  <p className="text-[9pt] font-bold text-blue-700 mb-2">{exp.company} • {exp.location}</p>
                  <ul className="space-y-1.5">{exp.bullets?.filter((b: string) => b.trim()).map((b: string, bi: number) => ( <li key={bi} className="text-[9.5pt] text-slate-600 pl-4 relative"><span className="absolute left-0 text-blue-400">•</span> {b}</li> ))}</ul>
                </div>
              ))}</div>
            </section>
          )}
          {data.projects?.length > 0 && (
            <section>{sectionTitle("Strategic Lab")}
              <div className="space-y-5">{data.projects.map((proj: any) => (
                <div key={proj.id}><h3 className="text-[10pt] font-bold text-slate-900 mb-1">{proj.title} <span className="text-slate-400 font-normal italic">| {proj.role}</span></h3><p className="text-[9.5pt] text-slate-600 leading-snug">{proj.description}</p></div>
              ))}</div>
            </section>
          )}
        </div>
        <div className="col-span-4 bg-slate-50 p-10 space-y-8 min-h-full border-l border-slate-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          {data.technicalSkills?.length > 0 && ( <div><h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4">Hard Skills</h2><div className="flex flex-wrap gap-2">{data.technicalSkills.map((skill, i) => ( <span key={i} className="text-[8.5pt] font-bold text-blue-800 bg-blue-100/50 px-2 py-1 rounded">{skill}</span> ))}</div></div> )}
          {data.softSkills?.length > 0 && ( <div><h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4">Soft Strengths</h2><div className="flex flex-wrap gap-2">{data.softSkills.map((skill, i) => ( <span key={i} className="text-[8.5pt] font-bold text-slate-700 bg-slate-200/50 px-2 py-1 rounded">{skill}</span> ))}</div></div> )}
          {data.education?.length > 0 && ( <div><h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4">Education</h2>{data.education.map((edu: any) => ( <div key={edu.id} className="mb-4"><h3 className="text-[9pt] font-bold text-slate-900 leading-tight">{edu.degree}</h3><p className="text-[8pt] font-medium text-slate-600 mt-1">{edu.institution}</p></div> ))}</div> )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder }: any) { return ( <div className="space-y-1"><label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">{label}</label><input className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-ink text-sm outline-none focus:border-red-500/50 transition-all" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div> ); }
function Textarea({ label, value, onChange, rows = 3 }: any) { return ( <div className="space-y-1"><label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">{label}</label><textarea rows={rows} className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-ink text-sm outline-none focus:border-red-500/50 resize-none transition-all" value={value || ""} onChange={e => onChange(e.target.value)} /></div> ); }
function Section({ id, title, icon, active, onToggle, children }: any) {
  const isOpen = active === id;
  return (
    <div className="w-full">
      <button onClick={() => onToggle(id)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${isOpen ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-xl shadow-red-900/10' : 'surface-card text-ink hover:border-red-500/20'}`}>
        <div className="flex items-center gap-3"><span className={isOpen ? 'text-white' : 'text-red-500'}>{icon}</span><span className="text-[10px] font-black uppercase tracking-widest">{title}</span></div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : 'opacity-20'}`} />
      </button>
      <AnimatePresence>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2">{children}</motion.div>}</AnimatePresence>
    </div>
  );
}

// ─── Main Application ─────────────────────────────────────────────────────────
export default function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(EMPTY_RESUME);
  const [status, setStatus] = useState({ text: '', error: false });
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState('contact');
  const { user } = useAuth();
  
  const showStatus = (text: string, error = false) => { setStatus({ text, error }); setTimeout(() => setStatus({ text: '', error: false }), 4000); };
  const update = (field: keyof ResumeData, value: any) => setData(p => ({ ...p, [field]: value }));

  const handleAI = async (type: string, id?: string) => {
    if (!data.jobTitle) { showStatus("Objective context needed", true); return; }
    setLoading(type + (id || ''));
    try {
      let prompt = "";
      if (type === 'summary') {
        prompt = `Write a high-impact, professional career summary for a ${data.jobTitle}. ${data.summary ? `Enhance my existing draft: "${data.summary}"` : "Focus on high-value leadership and results."}`;
      }
      if (type === 'bullets') {
        const exp = data.experience.find(e => e.id === id);
        const existing = (exp?.bullets || []).filter(b => b.trim()).join(". ");
        prompt = `Generate 4 punchy metrics-driven resume bullets for a ${exp?.jobTitle} at ${exp?.company}. ${existing ? `Base it on my current context: "${existing}"` : "Focus on quantifiable achievements."}`;
      }
      const res = await callLocalAI(prompt);
      if (type === 'summary') update('summary', res);
      if (type === 'bullets') {
        const bullets = res.split('\n').map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(l => l.length > 5).slice(0, 5);
        update('experience', data.experience.map(e => e.id === id ? { ...e, bullets } : e));
      }
      showStatus("AI Optimized!");
    } catch (e: any) { showStatus(e.message, true); }
    finally { setLoading(null); }
  };

  const handlePrint = () => {
    const resumeHTML = document.getElementById('resume-document')?.outerHTML;
    if (!resumeHTML) return;
    const printWin = window.open('', '_blank', 'width=900,height=1200');
    if (!printWin) { showStatus("Pop-up blocker caught the print process.", true); return; }
    printWin.document.write(`<html><head><title>Print</title><script src="https://cdn.tailwindcss.com"></script><style>
        body { margin: 0; padding: 0; background: white; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Inter', sans-serif; }
        @page { size: A4; margin: 0; }
        #resume-document { width: 100% !important; margin: 0 !important; box-shadow: none !important; }
      </style></head><body>${resumeHTML}<script>setTimeout(() => { window.print(); window.close(); }, 1200);</script></body></html>`);
    printWin.document.close();
  };

  useEffect(() => { if (user) { const saved = getResume(user.uid); if (saved) setData(p => ({ ...p, ...saved as any })); } }, [user]);

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6 no-print">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:w-[480px] space-y-3">
          <div className="mb-8"><h1 className="text-4xl font-serif italic font-bold">Resume <span className="text-red-700">Studio</span>.</h1><p className="text-slate-400 text-sm font-medium mt-2">Design your career blueprint.</p></div>
          <div className="space-y-2">
            <Section id="contact" title="Identity" icon={<User className="w-4 h-4"/>} active={expanded} onToggle={setExpanded}>
               <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-line mt-3">
                 <Input label="Name" value={data.fullName} onChange={(v:any) => update('fullName', v)} />
                 <Input label="Role" value={data.jobTitle} onChange={(v:any) => update('jobTitle', v)} />
                 <Input label="Email" value={data.email} onChange={(v:any) => update('email', v)} />
                 <Input label="Phone" value={data.phone} onChange={(v:any) => update('phone', v)} />
                 <div className="col-span-2"><Input label="LinkedIn" value={data.linkedin} onChange={(v:any) => update('linkedin', v)} /></div>
               </div>
            </Section>
            <Section id="summary" title="Summary AI" icon={<Sparkles className="w-4 h-4"/>} active={expanded} onToggle={setExpanded}>
               <div className="p-6 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-line space-y-5 mt-3">
                 <Textarea value={data.summary} onChange={(v:any) => update('summary', v)} rows={5} />
                 <button onClick={() => handleAI('summary')} disabled={!!loading} className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-xl">
                   {loading === 'summary' ? <Loader2 className="w-5 h-5 animate-spin"/> : <BrainCircuit className="w-5 h-5"/>} AI Transform
                 </button>
               </div>
            </Section>
            <Section id="experience" title="Orbit Orbit" icon={<Briefcase className="w-4 h-4"/>} active={expanded} onToggle={setExpanded}>
               <div className="space-y-4 mt-3">
                 <button onClick={() => update('experience', [{ id: Date.now().toString(), jobTitle: '', company: '', bullets: [''] }, ...(data.experience || [])])} className="w-full py-5 border-2 border-dashed border-red-500/20 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/5 transition-all">+ Add Orbit Role</button>
                 {data.experience?.map(exp => (
                   <div key={exp.id} className="surface-card p-6 shadow-md space-y-5 relative">
                     <Input label="Role" value={exp.jobTitle} onChange={(v:any) => update('experience', data.experience.map(e => e.id === exp.id ? {...e, jobTitle: v} : e))} />
                     <Input label="Organization" value={exp.company} onChange={(v:any) => update('experience', data.experience.map(e => e.id === exp.id ? {...e, company: v} : e))} />
                     <button onClick={() => handleAI('bullets', exp.id)} className="w-full py-3 bg-slate-100 dark:bg-white/5 text-ink/70 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-primary transition-colors">AI Metrics Optimzer</button>
                     <button onClick={() => update('experience', data.experience.filter(e => e.id !== exp.id))} className="text-[9px] font-black uppercase text-red-400 block mx-auto hover:text-red-600 transition-colors">Terminate Role</button>
                   </div>
                 ))}
               </div>
            </Section>
            <Section id="skills" title="Skill Master" icon={<Wrench className="w-4 h-4"/>} active={expanded} onToggle={setExpanded}>
               <div className="p-6 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-line space-y-5 mt-3">
                 <Textarea label="Core Technologies" value={data.technicalSkills?.join(', ')} onChange={(v:any) => update('technicalSkills', v.split(',').map((s:string)=>s.trim()))} rows={2} />
                 <Textarea label="Soft Strengths" value={data.softSkills?.join(', ')} onChange={(v:any) => update('softSkills', v.split(',').map((s:string)=>s.trim()))} rows={2} />
                 <Textarea label="Linguistic Proficiencies" value={data.languages?.join(', ')} onChange={(v:any) => update('languages', v.split(',').map((s:string)=>s.trim()))} rows={2} />
               </div>
            </Section>
            <Section id="projects" title="Strategic Initiatives" icon={<Rocket className="w-4 h-4"/>} active={expanded} onToggle={setExpanded}>
               <div className="space-y-4">
                 <button onClick={() => update('projects', [{ id: Date.now().toString(), title: '', description: '' }, ...(data.projects || [])])} className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase">+ Deploy Initiative</button>
                 {data.projects?.map(proj => (
                   <div key={proj.id} className="p-5 bg-white border border-slate-200 shadow-md rounded-2xl space-y-4">
                     <Input label="Initiative Name" value={proj.title} onChange={(v:any) => update('projects', data.projects.map(p => p.id === proj.id ? {...p, title: v} : p))} />
                     <Textarea label="Core Impact" value={proj.description} onChange={(v:any) => update('projects', data.projects.map(p => p.id === proj.id ? {...p, description: v} : p))} />
                     <button onClick={() => update('projects', data.projects.filter(p => p.id !== proj.id))} className="text-[9px] font-black uppercase text-red-400 block mx-auto">Remove</button>
                   </div>
                 ))}
               </div>
            </Section>
            <Section id="mastery" title="Academy & Verified" icon={<ShieldCheck className="w-4 h-4"/>} active={expanded} onToggle={setExpanded}>
               <div className="space-y-6 mt-4">
                 <div className="space-y-4">
                   <button onClick={() => update('education', [{ id: Date.now().toString(), degree: '', institution: '', endDate: '' }, ...(data.education || [])])} className="w-full py-2 border border-slate-200 text-slate-500 rounded-xl text-[9px] font-bold uppercase">+ Add Academy</button>
                   {data.education?.map((edu: any) => (
                     <div key={edu.id} className="surface-card p-4 space-y-3 relative">
                       <Input label="Degree / Major" value={edu.degree} onChange={(v:any) => update('education', data.education.map((e:any) => e.id === edu.id ? {...e, degree: v} : e))} />
                       <Input label="Institution" value={edu.institution} onChange={(v:any) => update('education', data.education.map((e:any) => e.id === edu.id ? {...e, institution: v} : e))} />
                       <button onClick={() => update('education', data.education.filter((e:any) => e.id !== edu.id))} className="text-[9px] font-black uppercase text-red-400 block mx-auto hover:text-red-500 mt-2">Remove</button>
                     </div>
                   ))}
                 </div>
                 
                 <div className="space-y-4">
                   <button onClick={() => update('certifications', [{ id: Date.now().toString(), name: '', issuer: '', date: '' }, ...(data.certifications || [])])} className="w-full py-2 border border-slate-200 text-slate-500 rounded-xl text-[9px] font-bold uppercase">+ Add Cert</button>
                   {data.certifications?.map((cert: any) => (
                     <div key={cert.id} className="surface-card p-4 space-y-3 relative">
                       <Input label="Certification Name" value={cert.name} onChange={(v:any) => update('certifications', data.certifications.map((c:any) => c.id === cert.id ? {...c, name: v} : c))} />
                       <Input label="Issuer Organization" value={cert.issuer} onChange={(v:any) => update('certifications', data.certifications.map((c:any) => c.id === cert.id ? {...c, issuer: v} : c))} />
                       <button onClick={() => update('certifications', data.certifications.filter((c:any) => c.id !== cert.id))} className="text-[9px] font-black uppercase text-red-400 block mx-auto hover:text-red-500 mt-2">Remove</button>
                     </div>
                   ))}
                 </div>
               </div>
            </Section>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-8">
             <button onClick={() => { saveResume(user?.uid || '', data as any); showStatus("Snapshot stored."); }} className="py-5 surface-card text-ink rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-primary/5 transition-all">Store Draft</button>
             <button onClick={handlePrint} className="py-5 bg-red-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 shadow-2xl shadow-red-500/30 hover:bg-red-700 hover:-translate-y-1 transition-all">
               <Printer className="w-5 h-5"/> Generate PDF
             </button>
          </div>
          <AnimatePresence>{status.text && ( <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-5 rounded-2xl border-2 ${status.error ? 'bg-red-50 text-red-600 border-red-200 uppercase font-black text-[10px]' : 'bg-surface text-ink border-line text-sm'} shadow-2xl whitespace-pre-wrap leading-relaxed`}>{status.text}</motion.div> )}</AnimatePresence>
        </div>
        <div className="flex-1 bg-slate-50/50 p-10 rounded-[3rem] border border-white shadow-inner hidden xl:block no-print lg:sticky lg:top-12"><div className="overflow-y-auto max-h-[82vh] shadow-2xl rounded-2xl"><ResumePreview data={data} /></div></div>
      </div>
    </div>
  );
}
