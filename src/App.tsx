/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase, Feather, Sparkles, Globe, User, ShieldCheck, AlertCircle, ArrowRight, LogIn, UserPlus, Mail, Lock, X, Zap, Shield, Star, CheckCircle, Eye, EyeOff, Activity, FileText, TrendingUp, Search, Bell, LogOut, ChevronRight, Layout
} from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ResumeBuilder from "./components/ResumeBuilder";
import SkillAssessment from "./components/SkillAssessment";
import EmployerDashboard from "./components/EmployerDashboard";
import CandidateDashboard from "./components/CandidateDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Subscription from "./components/Subscription";
import AIFloatingChat from "./components/AIFloatingChat";
import AISummarizer from "./components/AISummarizer";
import Newsfeed from "./components/Newsfeed";
import JobFeed from "./components/JobFeed";
import Interview from "./components/Interview";
import UserProfile from "./components/UserProfile";
import AssessmentQuiz from "./components/AssessmentQuiz";
import ErrorBoundary from "./components/ErrorBoundary";

// ─── Authentication Configuration ──────────────────────────────────────────
// All users are now managed via the MySQL backend. Use the 'Sign Up' or
// 'Continue with Google' buttons to create new accounts.

// ─── Types ───────────────────────────────────────────────────────────────────
export interface LocalUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'candidate' | 'employer' | 'admin';
  photoURL: string | null;
}

type View = 'home' | 'resume' | 'assessments' | 'employer' | 'candidate' | 'admin' | 'subscription' | 'summarizer' | 'feed' | 'jobs' | 'interviews' | 'payment-success' | 'payment-cancel' | 'profile';

interface AuthContextType {
  user: LocalUser | null;
  role: 'candidate' | 'employer' | 'admin' | null;
  loading: boolean;
  signIn: (mode?: 'login' | 'signup') => void;
  logout: () => void;
  setAuthMode: (mode: 'login' | 'signup' | null) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// ─── Auth Modal ──────────────────────────────────────────────────────────────
function AuthModal({ initialMode, onClose, onLogin }: { initialMode: 'login' | 'signup' | 'forgot', onClose: () => void; onLogin: (user: LocalUser) => void }) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp' | 'reset'>(() => {
    return initialMode as any;
  });
  const [email, setEmail] = useState('');
  const [resetUid, setResetUid] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [devOtp, setDevOtp] = useState(''); // shown only when Gmail not configured
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Listen for Google OAuth popup messages
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'google_auth_success') {
        const userData = event.data.user as LocalUser;
        localStorage.setItem('cg_user', JSON.stringify(userData));
        import("./lib/store").then(m => m.trackUser({ ...userData, id: userData.uid }));
        onLogin(userData);
        onClose();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleGoogleSignIn = () => {
    const width = 500, height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      `${window.location.origin}/auth/google`,
      'GoogleSignIn',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Step 1: Send OTP to email
    if (mode === 'forgot') {
      try {
        const res = await fetch(`${window.location.origin}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (data.dev && data.otp) setDevOtp(data.otp); // show OTP on screen in dev mode
        setMode('otp');
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
      return;
    }

    // Step 2: Verify the OTP
    if (mode === 'otp') {
      try {
        const res = await fetch(`${window.location.origin}/api/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otpInput }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResetUid(data.uid);
        setMode('reset');
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
      return;
    }

    // Step 3: Set new password
    if (mode === 'reset') {
      try {
        const res = await fetch(`${window.location.origin}/api/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: resetUid, newPassword: password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccess(true);
        setTimeout(() => { setMode('login'); setSuccess(false); }, 2500);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
      return;
    }

    if (mode === 'login') {
      try {
        const res = await fetch(`${window.location.origin}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Invalid email or password.'); setLoading(false); return; }
        localStorage.setItem('cg_user', JSON.stringify(data));
        import("./lib/store").then(m => m.trackUser({ ...data, id: data.uid }));
        onLogin(data);
        onClose();
      } catch (err) {
        setError('Connection failed. Please try again later.');
      }
    } else {
      try {
        const res = await fetch(`${window.location.origin}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, displayName, role }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Registration failed.'); setLoading(false); return; }
        localStorage.setItem('cg_user', JSON.stringify(data));
        import("./lib/store").then(m => m.trackUser({ ...data, id: data.uid }));
        onLogin(data);
        onClose();
      } catch (err) {
        setError('Connection failed. Please check your network.');
      }
    }
    setLoading(false);
  };

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  const modeHeaders: Record<string, { title: string; subtitle: string }> = {
    login:  { title: 'Welcome Back',    subtitle: 'Sign in to access your CareerGate dashboard' },
    signup: { title: 'Create Account',  subtitle: 'Join thousands of professionals today' },
    forgot: { title: 'Forgot Password', subtitle: 'Enter your Gmail address — we\'ll send a 6-digit OTP' },
    otp:    { title: 'Enter OTP',       subtitle: `Check your inbox at ${email} for the verification code` },
    reset:  { title: 'New Password',    subtitle: 'Almost there! Set your new secure password' },
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
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-surface w-full max-w-md p-8 rounded-3xl shadow-2xl border border-line overflow-y-auto max-h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {mode === 'login' ? <LogIn className="w-8 h-8 text-primary" /> :
             mode === 'otp'   ? <span className="text-2xl">📬</span> :
             mode === 'reset' ? <span className="text-2xl">🔐</span> :
             <UserPlus className="w-8 h-8 text-primary" />}
          </div>
          <h2 className="text-3xl font-serif italic font-bold text-ink">{modeHeaders[mode]?.title}</h2>
          <p className="text-ink/60 text-sm mt-2">{modeHeaders[mode]?.subtitle}</p>
        </div>

        {/* Google Sign-In Button */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="mb-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-line rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all font-bold text-sm text-ink group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="group-hover:text-primary transition-colors">Continue with Google</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-line" /><span className="text-[10px] uppercase font-bold tracking-widest text-muted">or</span><div className="flex-1 h-px bg-line" />
            </div>
          </div>
        )}

        {/* Quick Login Buttons */}
        {mode === 'login' && (
          <div className="mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-ink/40 mb-3 text-center">Quick Access</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => quickLogin('admin@gmail.com', 'admin1')} className="py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-line bg-red-50 text-red-700 hover:bg-red-100 transition-all">🔑 Admin</button>
              <button type="button" onClick={() => quickLogin('employe@gmail.com', 'employe27t')} className="py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-line bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">🏢 Employer</button>
              <button type="button" onClick={() => quickLogin('candidate@gmail.com', 'candidated')} className="py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-line bg-green-50 text-green-700 hover:bg-green-100 transition-all">👤 Candidate</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name (signup only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted flex items-center gap-1.5">Full Name <Activity className="w-3 h-3 opacity-20" /></label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full bg-transparent border-b-2 border-line py-3 text-lg font-serif italic focus:outline-none focus:border-primary transition-colors placeholder:opacity-20" placeholder="Eleanor Rigby" />
            </div>
          )}

          {/* Email field */}
          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted">
                {mode === 'forgot' ? 'Your Gmail Address' : 'Email Address'}
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-transparent border-b-2 border-line py-3 text-lg font-serif italic focus:outline-none focus:border-primary transition-colors placeholder:opacity-20"
                placeholder={mode === 'forgot' ? 'yourname@gmail.com' : 'e.rigby@careergate.ai'} />
            </div>
          )}

          {/* OTP input field */}
          {mode === 'otp' && (
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted block text-center">6-Digit OTP Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full text-center text-4xl font-mono font-black tracking-[0.5em] bg-transparent border-b-4 border-primary py-4 focus:outline-none text-ink"
                placeholder="------"
                autoFocus
              />
              {devOtp && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-amber-600">Dev Mode OTP (Gmail not configured)</p>
                  <p className="text-2xl font-mono font-black text-amber-700 mt-1">{devOtp}</p>
                </div>
              )}
              <button type="button" onClick={() => { setMode('forgot'); setError(''); setOtpInput(''); }}
                className="w-full text-[10px] uppercase font-bold tracking-widest text-primary hover:underline">
                Didn't receive it? Resend OTP
              </button>
            </div>
          )}

          {/* New password field */}
          {mode === 'reset' && (
            <div className="space-y-1.5 relative">
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted">New Password (min. 6 characters)</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-transparent border-b-2 border-line py-3 text-lg font-serif italic focus:outline-none focus:border-primary transition-all placeholder:opacity-20"
                placeholder="••••••••"
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 p-1 opacity-20 hover:opacity-100 transition-all">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Password field for login/signup */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="space-y-1.5 relative">
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted">Password</label>
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-transparent border-b-2 border-line py-3 text-lg font-serif italic focus:outline-none focus:border-primary transition-all placeholder:opacity-20"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 p-1 opacity-20 hover:opacity-100 transition-all">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Role selector (signup only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setRole('candidate')} className={`py-3 border ${role === 'candidate' ? 'bg-[#141414] text-white border-[#141414]' : 'border-[#141414]/20 opacity-40'} text-[9px] font-bold uppercase tracking-widest transition-all`}>Candidate</button>
                <button type="button" onClick={() => setRole('employer')} className={`py-3 border ${role === 'employer' ? 'bg-[#141414] text-white border-[#141414]' : 'border-[#141414]/20 opacity-40'} text-[9px] font-bold uppercase tracking-widest transition-all`}>Employer</button>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/20 p-3 bg-red-500/5 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 text-[10px] font-bold uppercase tracking-widest bg-green-50 p-3 border border-green-200 rounded-lg">✅ Password updated! Redirecting to login...</p>}

          {!success && (
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} disabled={loading}
              className="btn-premium py-4 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(var(--primary-rgb),.2)]">
              {loading ? 'Processing...' :
               mode === 'login'  ? 'Sign In Now' :
               mode === 'signup' ? 'Join CareerGate' :
               mode === 'forgot' ? '📬 Send OTP to My Gmail' :
               mode === 'otp'    ? '✓ Verify OTP' :
               'Set New Password →'}
            </motion.button>
          )}
        </form>

        <div className="mt-6 text-center flex flex-col gap-3">
          {(mode === 'login' || mode === 'signup') && (
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-[10px] uppercase font-bold tracking-widest text-primary hover:underline transition-all">
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          )}
          {mode === 'login' && (
            <button onClick={() => { setMode('forgot'); setError(''); }}
              className="text-[10px] uppercase font-bold tracking-widest text-ink/40 hover:text-primary transition-all">
              Forgot Password?
            </button>
          )}
          {(mode === 'forgot' || mode === 'otp' || mode === 'reset') && (
            <button onClick={() => { setMode('login'); setError(''); setOtpInput(''); setDevOtp(''); }}
              className="text-[10px] uppercase font-bold tracking-widest text-primary hover:underline transition-all">
              ← Return to Sign In
            </button>
          )}
        </div>

        {/* Credentials reference */}
        {(mode === 'login' || mode === 'signup') && (
        <div className="mt-6 p-4 bg-bg rounded-xl border border-line">
          <p className="text-[10px] uppercase font-bold tracking-widest text-ink/40 mb-3">Test Credentials</p>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between text-ink/70"><span className="text-red-600 font-bold">Admin:</span><span>admin@gmail.com / admin1</span></div>
            <div className="flex justify-between text-ink/70"><span className="text-blue-600 font-bold">Employer:</span><span>employe@gmail.com / employe27t</span></div>
            <div className="flex justify-between text-ink/70"><span className="text-green-600 font-bold">Candidate:</span><span>candidate@gmail.com / candidated</span></div>
          </div>
        </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Environment Particle Render System ───────────────────────────────────────
const BIRDS_GROUP1 = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: 12 + (i * 2) % 6,
  top: 8 + (i * 7) % 20,
  duration: 22 + (i * 4) % 15,
  delay: (i * 3.1) % 12,
  wobble: i % 2 === 0 ? '-8deg' : '8deg',
}));

const BIRDS_GROUP2 = Array.from({ length: 12 }, (_, i) => ({
  id: i + 10,
  size: 8 + (i * 1) % 4,
  top: 25 + (i * 5) % 25,
  duration: 35 + (i * 5) % 20,
  delay: 4 + (i * 2.1) % 15,
  wobble: i % 2 === 0 ? '-5deg' : '5deg',
}));

const EnvironmentFX = () => {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden no-print">
         {/* Dynamic Meteors - Show in both modes for extra atmosphere */}
         <div className="block">
           {Array.from({ length: 15 }).map((_, i) => (
             <div 
               key={`meteor-${i}`}
               className="absolute w-[150px] sm:w-[250px] h-[1px] rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent dark:via-white/60 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
               style={{
                 top: `${(i * 18) % 70 - 10}vh`,
                 left: `${40 + (i * 22) % 65}vw`,
                 transform: `rotate(-35deg)`,
                 animation: `shooting-star-burst ${4 + (i % 6)}s ease-out infinite`,
                 animationDelay: `${(i * 2.1) % 15}s`,
                 opacity: 0,
                 pointerEvents: 'none'
               }}
             />
           ))}
         </div>

         {/* Birds only show in light mode — Group 1 (high) and Group 2 (mid) */}
          <div className="dark:hidden">
            {[...BIRDS_GROUP1, ...BIRDS_GROUP2].map((bird) => (
              <div
                key={`bird-${bird.id}`}
                style={{
                  position: 'absolute',
                  top: `${bird.top}vh`,
                  left: '-10vw',
                  opacity: 0,
                  animation: `bird-flock-fly ${bird.duration}s linear infinite`,
                  animationDelay: `${bird.delay}s`,
                }}
              >
                <svg width={bird.size * 2} height={bird.size} viewBox="0 0 20 10" className="text-ink/10 drop-shadow-sm overflow-visible">
                  {/* Small body/head point for more realism */}
                  <circle cx="10" cy="8" r="1.2" fill="currentColor" className="opacity-40" />
                  <path 
                    d="M0,8 C5,2 10,8 10,8 C10,8 15,2 20,8" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                    style={{
                       animation: 'bird-wing-flap 1.5s ease-in-out infinite',
                       animationDelay: `${bird.delay * 0.2}s`
                    }}
                  />
                </svg>
              </div>
            ))}
          </div>
      </div>
    </>
  )
}

function App() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('home');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cg_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem('cg_user');
    }
    setLoading(false);
  }, []);

  // Handle internal navigation events dispatched from child components
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (typeof detail === 'string') {
        setView(detail as View);
      } else if (typeof detail === 'object') {
        if (detail.view) setView(detail.view as View);
        // Store tab context for dashboards to pick up
        if (detail.tab) (window as any).__cgNavTab = detail.tab;
        if (detail.jobId) (window as any).__cgNavJobId = detail.jobId;
      }
    };
    window.addEventListener('cg_navigate', handler);
    return () => window.removeEventListener('cg_navigate', handler);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const signIn = (mode: 'login' | 'signup' = 'login') => setAuthMode(mode);

  const logout = () => {
    localStorage.removeItem('cg_user');
    setUser(null);
    setView('home');
  };

  const handleLogin = (loggedInUser: LocalUser) => {
    setUser(loggedInUser);
    // Auto-navigate to the correct dashboard after login
    if (loggedInUser.role === 'admin') setView('admin');
    else if (loggedInUser.role === 'employer') setView('employer');
    else setView('candidate');
  };

  const role = user?.role ?? null;

  const renderView = () => {
    switch (view) {
      case 'resume': return <ResumeBuilder />;
      case 'assessments': return user ? <AssessmentQuiz userId={user.uid} /> : <AccessDenied role="Candidate" onSignIn={signIn} />;
      case 'profile': return user ? <UserProfile user={user} /> : <AccessDenied role="Guest" onSignIn={signIn} />;
      case 'employer': return user && role === 'employer' ? <EmployerDashboard user={user} /> : <AccessDenied role="Employer" onSignIn={signIn} />;
      case 'candidate': return user && role === 'candidate' ? <CandidateDashboard user={user} /> : <AccessDenied role="Candidate" onSignIn={signIn} />;
      case 'admin': return user && role === 'admin' ? <AdminDashboard user={user} /> : <AccessDenied role="Admin" onSignIn={signIn} />;
      case 'subscription': return <Subscription user={user} />;
      case 'summarizer': return <AISummarizer />;
      case 'feed': return <Newsfeed user={user} />;
      case 'jobs': return <JobFeed user={user} />;
      case 'interviews': return <Interview />;
      case 'payment-success': return <PaymentSuccess setView={setView} />;
      case 'payment-cancel': return <PaymentCancel setView={setView} />;
      default: return (
        <>
          <Hero setView={setView} />
          <section className="max-w-7xl mx-auto px-4 py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="w-8 h-8 text-primary" />}
                title="AI Resume Builder"
                description="Create a professional, ATS-friendly resume in minutes with our AI assistant."
                onClick={() => setView('resume')}
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8 text-accent" />}
                title="Skill Assessments"
                description="Verify your expertise with industry-standard tests and earn badges."
                onClick={() => setView('assessments')}
              />
              <FeatureCard
                icon={<Star className="w-8 h-8 text-secondary" />}
                title="Job Newsfeed"
                description="Connect with professionals and stay updated with the latest industry news."
                onClick={() => setView('feed')}
              />
            </div>
          </section>
        </>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, logout, setAuthMode, darkMode, toggleDarkMode }}>
      <ErrorBoundary>
        <div className="min-h-screen bg-bg text-ink selection:bg-primary/20">
          <EnvironmentFX />
          <Navbar setView={setView} />

          <AnimatePresence mode="wait">
            <motion.main
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.main>
          </AnimatePresence>

          <AnimatePresence>
            {authMode && (
              <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} onLogin={handleLogin} />
            )}
          </AnimatePresence>
          
          <AIFloatingChat />

          <footer className="bg-surface border-t border-line py-12 mt-24">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-6 hover:scale-110 transition-transform cursor-pointer">
                <Feather className="w-8 h-8 text-primary" />
                <span className="font-serif italic text-2xl font-black tracking-tight bg-gradient-to-r from-red-600 to-red-900 bg-clip-text text-transparent">CareerGate</span>
              </div>
              <p className="text-ink/40 text-sm font-bold uppercase tracking-widest">© 2026 CareerGate. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

// ─── Access Denied ────────────────────────────────────────────────────────────
function AccessDenied({ role, onSignIn }: { role: string; onSignIn: () => void }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface max-w-md w-full p-12 rounded-3xl border border-line shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-8">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-serif italic font-bold mb-4">Access Restricted</h2>
        <p className="text-ink/60 mb-8">
          You need to be logged in as an <strong>{role}</strong> to access this area.
        </p>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSignIn}
          className="w-full py-4 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all"
        >
          Sign In
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, onClick }: any) {
  return (
    <motion.div
      whileHover={{ y: -10, rotateX: 5, rotateY: 5, translateZ: 50 }}
      onClick={onClick}
      className="bg-surface p-10 rounded-3xl border border-line shadow-xl hover:shadow-2xl transition-all cursor-pointer perspective-[1000px]"
    >
      <div className="mb-8">{icon}</div>
      <h3 className="text-2xl font-serif italic font-bold mb-4">{title}</h3>
      <p className="text-ink/60 leading-relaxed mb-8">{description}</p>
      <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
        Learn More <ArrowRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
}

// ─── Payment Views ─────────────────────────────────────────────────────────────
function PaymentSuccess({ setView }: any) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface max-w-md w-full p-12 rounded-[3rem] border border-line shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-serif italic font-bold mb-4">Payment Successful!</h2>
        <p className="text-ink/60 mb-10 leading-relaxed">
          Thank you for upgrading! Your premium features are now active. Start exploring your new career tools.
        </p>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setView('home')}
          className="w-full py-5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all"
        >
          Go to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}

function PaymentCancel({ setView }: any) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface max-w-md w-full p-12 rounded-[3rem] border border-line shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-8">
          <X className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-serif italic font-bold mb-4">Payment Cancelled</h2>
        <p className="text-ink/60 mb-10 leading-relaxed">
          The payment process was cancelled. No charges were made.
        </p>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setView('subscription')}
          className="w-full py-5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all"
        >
          Back to Pricing
        </motion.button>
      </motion.div>
    </div>
  );
}

export default App;
