import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Calendar, Clock, User, Briefcase, CheckCircle, X, Plus } from 'lucide-react';
import { useAuth } from '../App';

interface Interview {
  id: string;
  employerId: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  employerName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink: string;
  notes?: string;
}

const MOCK_INTERVIEWS: Interview[] = [
  { id: 'i1', employerId: 'employer-001', candidateId: 'candidate-001', jobId: 'j1', jobTitle: 'Senior React Developer', candidateName: 'Job Seeker', employerName: 'TechCorp Recruiter', date: '2026-04-10', time: '10:00', status: 'scheduled', meetingLink: 'https://meet.google.com/abc-xyz' },
  { id: 'i2', employerId: 'employer-001', candidateId: 'candidate-001', jobId: 'j2', jobTitle: 'UX Designer', candidateName: 'Job Seeker', employerName: 'StartupBD HR', date: '2026-04-15', time: '14:00', status: 'scheduled', meetingLink: 'https://zoom.us/j/1234567' },
];

// Module-level so sessions persist
let sessionInterviews = [...MOCK_INTERVIEWS];

function InterviewCard({ interview, delay }: any) {
  const { role } = useAuth();
  return (
    <motion.div 
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.01, translateZ: 10, y: -2 }}
      className="surface-card p-6 relative overflow-hidden group border-line"
    >
      <div className="absolute top-0 right-0 p-3">
        <span className={`px-1.5 py-0.5 text-[8px] uppercase font-bold rounded-full ${
          interview.status === 'scheduled' ? 'bg-primary/10 text-primary' :
          interview.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {interview.status}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-serif italic font-bold text-ink leading-tight">{interview.jobTitle}</h4>
              <p className="text-[9px] text-ink/40 font-bold uppercase tracking-widest">{interview.employerName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-primary" />
              <div>
                <p className="text-[8px] uppercase font-bold text-ink/30">Date</p>
                <p className="text-[11px] font-bold">{interview.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-primary" />
              <div>
                <p className="text-[8px] uppercase font-bold text-ink/30">Time</p>
                <p className="text-[11px] font-bold">{interview.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-primary" />
              <div>
                <p className="text-[8px] uppercase font-bold text-ink/30">{role === 'employer' ? 'Candidate' : 'Interviewer'}</p>
                <p className="text-[11px] font-bold">{role === 'employer' ? interview.candidateName : interview.employerName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-2 min-w-[140px]">
          <motion.a 
            href={interview.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 btn-crimson text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all"
          >
            <Video className="w-4 h-4" />
            Join Meeting
          </motion.a>
          <button className="text-[8px] uppercase font-bold tracking-widest text-ink/40 hover:text-accent transition-colors text-center">
            Reschedule or Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Interview() {
  const { user, role } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>(sessionInterviews);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleScheduled = (newInterview: Interview) => {
    sessionInterviews = [...sessionInterviews, newInterview];
    setInterviews([...sessionInterviews]);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 perspective-[1000px]">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-6 border-b border-line pb-4"
      >
        <div>
          <span className="font-serif italic text-[10px] uppercase tracking-widest opacity-50">Career Management</span>
          <h2 className="text-3xl font-serif italic mt-0.5">Interviews</h2>
        </div>
        {role === 'employer' && (
          <motion.button 
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-md shadow-primary/10 hover:bg-secondary transition-all"
          >
            <Plus className="w-3 h-3" />
            Schedule Interview
          </motion.button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3.5">
          {interviews.length === 0 ? (
            <div className="bg-surface border border-line p-12 rounded-xl text-center shadow-sm">
              <Video className="w-10 h-10 text-primary/20 mx-auto mb-3" />
              <h3 className="text-lg font-serif italic font-bold mb-1.5">No Interviews Scheduled</h3>
              <p className="text-ink/40 text-[11px] max-w-sm mx-auto">
                {role === 'employer' 
                  ? "You haven't scheduled any interviews yet."
                  : "You don't have any upcoming interviews."}
              </p>
            </div>
          ) : (
            interviews.map((interview, idx) => (
              <InterviewCard key={interview.id} interview={interview} delay={idx * 0.04} />
            ))
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-surface border border-line p-5 rounded-xl shadow-sm">
            <h3 className="text-base font-serif italic font-bold mb-4">Interview Tips</h3>
            <div className="space-y-4">
              <TipCard 
                icon={<Video className="w-3.5 h-3.5 text-primary" />}
                title="Check your setup"
                text="Ensure your camera and microphone are working properly before the call."
              />
              <TipCard 
                icon={<Clock className="w-3.5 h-3.5 text-secondary" />}
                title="Be punctual"
                text="Join the meeting 5 minutes early to avoid any technical delays."
              />
              <TipCard 
                icon={<Briefcase className="w-3.5 h-3.5 text-accent" />}
                title="Dress professionally"
                text="Treat a virtual interview with the same professionalism as an in-person one."
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScheduleModal && (
          <ScheduleModal onClose={() => setShowScheduleModal(false)} onScheduled={handleScheduled} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TipCard({ icon, title, text }: any) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-bg border border-line rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-bold text-ink mb-0.5">{title}</h4>
        <p className="text-[10px] text-ink/40 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ScheduleModal({ onClose, onScheduled }: { onClose: () => void; onScheduled?: (i: Interview) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    candidateEmail: '',
    jobTitle: '',
    date: '',
    time: '',
    meetingLink: 'https://meet.google.com/new',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const newInterview: Interview = {
        id: `i-${Date.now()}`,
        employerId: user?.uid || '',
        candidateId: 'candidate-001',
        jobId: '',
        jobTitle: formData.jobTitle,
        candidateName: formData.candidateEmail.split('@')[0],
        employerName: user?.displayName || 'Employer',
        date: formData.date,
        time: formData.time,
        status: 'scheduled',
        meetingLink: formData.meetingLink,
        notes: formData.notes
      };
      onScheduled?.(newInterview);
      onClose();
      setLoading(false);
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.98, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98, y: 10 }}
        className="bg-surface w-full max-w-lg p-6 rounded-[24px] shadow-2xl border border-line"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-serif italic font-bold text-ink">Schedule Interview</h2>
            <p className="text-ink/40 text-[11px] mt-0.5">Set up a meeting with a top candidate</p>
          </div>
          <button onClick={onClose} className="p-2 bg-bg border border-line rounded-lg text-ink/40 hover:text-ink transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-[8px] uppercase font-bold tracking-widest text-ink/40 ml-1">Candidate Email</label>
            <input 
              required
              type="email"
              value={formData.candidateEmail}
              onChange={e => setFormData({...formData, candidateEmail: e.target.value})}
              className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg focus:ring-1 focus:ring-primary/20 outline-none transition-all text-[11px] font-bold"
              placeholder="candidate@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] uppercase font-bold tracking-widest text-ink/40 ml-1">Job Title</label>
            <input 
              required
              type="text"
              value={formData.jobTitle}
              onChange={e => setFormData({...formData, jobTitle: e.target.value})}
              className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg focus:ring-1 focus:ring-primary/20 outline-none transition-all text-[11px] font-bold"
              placeholder="Senior Frontend Developer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] uppercase font-bold tracking-widest text-ink/40 ml-1">Date</label>
            <input 
              required
              type="date"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg focus:ring-1 focus:ring-primary/20 outline-none transition-all text-[11px] font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] uppercase font-bold tracking-widest text-ink/40 ml-1">Time</label>
            <input 
              required
              type="time"
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
              className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg focus:ring-1 focus:ring-primary/20 outline-none transition-all text-[11px] font-bold"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-[8px] uppercase font-bold tracking-widest text-ink/40 ml-1">Meeting Link</label>
            <input 
              required
              type="url"
              value={formData.meetingLink}
              onChange={e => setFormData({...formData, meetingLink: e.target.value})}
              className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg focus:ring-1 focus:ring-primary/20 outline-none transition-all text-[11px] font-bold"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-[8px] uppercase font-bold tracking-widest text-ink/40 ml-1">Notes</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg focus:ring-1 focus:ring-primary/20 outline-none transition-all text-[11px] font-bold min-h-[70px]"
              placeholder="Add any specific instructions for the candidate..."
            />
          </div>
          
          <div className="col-span-2 pt-3">
            <motion.button 
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="w-full py-3 bg-primary text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-md shadow-primary/10 hover:bg-secondary transition-all disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Confirm Interview'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
