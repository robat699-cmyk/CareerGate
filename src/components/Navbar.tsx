import { motion } from "motion/react";
import { Feather, User, LogIn, Menu, X, LogOut, Globe, MessageSquare, Sun, Moon, Video } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../App";
import NotificationSystem from "./NotificationSystem";

export default function Navbar({ setView }: { setView: (v: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, logout, setAuthMode, darkMode, toggleDarkMode } = useAuth();

  return (
    <nav className="bg-surface/80 backdrop-blur-md border-b border-line sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <motion.div 
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer group px-3 py-1.5 rounded-2xl hover:bg-primary/5 transition-all duration-500" 
            onClick={() => setView('home')}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur-[8px] opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-red-500 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 relative z-10 overflow-hidden ring-1 ring-white/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                <Feather className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transform -scale-x-100" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-serif italic text-2xl font-black tracking-tight bg-gradient-to-r from-red-900 via-red-600 to-red-800 bg-clip-text text-transparent drop-shadow-sm leading-none">CareerGate</span>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mt-2" />
              </div>
              <span className="text-[8px] uppercase font-bold tracking-[0.4em] text-red-600 mt-1 leading-none ml-0.5 opacity-60">Architecting Your Future</span>
            </div>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-6">
            <NavButton onClick={() => setView('jobs')} icon={<Globe className="w-3 h-3" />} label="Jobs" />
            <NavButton onClick={() => setView('feed')} icon={<MessageSquare className="w-3 h-3" />} label="Feed" />
            <NavButton onClick={() => setView('interviews')} icon={<Video className="w-3 h-3" />} label="Interviews" />
            <NavButton onClick={() => setView('assessments')} label="Assessments" />
            <NavButton onClick={() => setView('subscription')} label="Pricing" />
            <NavButton onClick={() => setView('profile')} label="Profile" />
            
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-1.5 bg-bg border border-line rounded-lg text-ink/60 hover:text-primary transition-all shadow-sm"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </motion.button>

            <NotificationSystem />

            {user ? (
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.02, translateZ: 20 }}
                  className="flex items-center gap-2 p-0.5 pr-2.5 h-8 bg-bg border border-line rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    if (role === 'admin') setView('admin');
                    else if (role === 'employer') setView('employer');
                    else setView('candidate');
                  }}
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="" 
                      className="w-6 h-6 rounded-lg object-cover border border-line"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary rounded-lg">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold leading-none truncate max-w-[70px]">{user.displayName || user.email?.split('@')[0]}</span>
                    <span className="text-[6px] uppercase font-bold tracking-widest text-primary mt-0.5">
                      {role}
                    </span>
                  </div>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('profile')}
                  className="h-8 flex items-center justify-center px-3 text-[9px] font-bold uppercase tracking-widest bg-bg text-ink border border-line rounded-xl hover:border-primary/50 shadow-sm transition-all"
                  title="My Profile"
                >
                  My Profile
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={logout}
                  className="p-1.5 text-ink/40 hover:text-accent transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setAuthMode('login')}
                  className="text-[9px] font-bold uppercase tracking-widest text-ink hover:text-primary transition-colors"
                >
                  Sign In
                </button>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAuthMode('signup')}
                  className="btn-premium"
                >
                  Get Started
                </motion.button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-ink p-2">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-surface border-b border-line px-6 pt-4 pb-10 space-y-6 shadow-xl"
        >
          <button onClick={() => { setView('jobs'); setIsOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest text-ink/60">Jobs</button>
          <button onClick={() => { setView('feed'); setIsOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest text-ink/60">Feed</button>
          <button onClick={() => { setView('interviews'); setIsOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest text-ink/60">Interviews</button>
          <button onClick={() => { setView('assessments'); setIsOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest text-ink/60">Assessments</button>
          <button onClick={() => { setView('subscription'); setIsOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest text-ink/60">Pricing</button>
          
          <button 
            onClick={() => { toggleDarkMode(); setIsOpen(false); }} 
            className="w-full flex items-center justify-between py-4 border-t border-line text-sm font-bold uppercase tracking-widest text-ink/60"
          >
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {user ? (
            <div className="pt-6 border-t border-line">
              <div className="flex items-center gap-3 mb-6" onClick={() => { 
                if (role === 'admin') setView('admin');
                else if (role === 'employer') setView('employer');
                else setView('candidate');
                setIsOpen(false); 
              }}>
                {user.photoURL && <img src={user.photoURL} className="w-10 h-10 rounded-xl" referrerPolicy="no-referrer" />}
                <div>
                  <p className="text-sm font-bold">{user.displayName || user.email}</p>
                  <p className="text-[10px] uppercase font-bold text-primary">{role} Dashboard</p>
                </div>
              </div>
              <button 
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-6 border-t border-line space-y-4">
              <button 
                onClick={() => { setAuthMode('login'); setIsOpen(false); }}
                className="w-full py-4 text-xs font-bold uppercase tracking-widest text-ink/60"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthMode('signup'); setIsOpen(false); }}
                className="w-full py-4 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl"
              >
                Get Started
              </button>
            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
}

function NavButton({ onClick, icon, label }: any) {
  return (
    <motion.button 
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="nav-pill"
    >
      {icon}
      {label}
    </motion.button>
  );
}
