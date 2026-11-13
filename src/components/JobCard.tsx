import React from "react";
import { motion } from "motion/react";
import { MapPin, DollarSign, Clock, Briefcase, ArrowUpRight, CheckCircle, Shield } from "lucide-react";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  matchScore: number;
  applied?: boolean;
  userRole?: string | null;
  isOwner?: boolean;
  onApply?: (e?: React.MouseEvent) => void;
}

export default function JobCard({ title, company, location, salary, type, matchScore, applied = false, userRole, isOwner, onApply }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, rotateY: 2, rotateX: -1, translateZ: 15, scale: 1.005 }}
      className="group bg-surface p-6 rounded-[1.5rem] border border-line flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer transition-all duration-500 perspective-[1000px] shadow-md hover:shadow-lg"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 bg-bg rounded-xl flex items-center justify-center border border-line shadow-inner">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-serif italic text-[10px] font-bold text-ink/40 block leading-none mb-1">{company}</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] uppercase font-bold rounded-full tracking-widest">{type}</span>
          </div>
        </div>
        <h3 className="text-2xl font-serif italic font-bold mb-4 leading-tight tracking-tight text-ink group-hover:text-primary transition-colors">{title}</h3>
        <div className="flex flex-wrap gap-4 text-[9px] font-bold uppercase tracking-widest text-ink/40">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary/40" />{location}
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-primary/40" />{salary}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary/40" />2d ago
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-4 w-full md:w-auto">
        <div className="text-right">
          <span className="text-[8px] uppercase tracking-widest font-bold text-ink/30 block mb-0.5">Match Score</span>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-3xl font-serif italic font-bold ${matchScore >= 90 ? 'text-green-500' : matchScore >= 75 ? 'text-primary' : 'text-ink/60'}`}>{matchScore}</span>
            <span className="text-lg font-serif italic font-bold text-primary/40">%</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: applied ? 1 : 1.05, y: applied ? 0 : -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={(e) => {
            e.stopPropagation();
            if (!applied) onApply?.(e);
          }}
          className={`btn-premium w-full md:w-auto ${
            applied
              ? 'badge-green !rounded-xl !px-6 !py-3 bg-green-500/10 text-green-500 border border-green-500/20 cursor-default shadow-none'
              : ''
          }`}
        >
          {applied ? (
            <><CheckCircle className="w-4 h-4" /> Already Applied</>
          ) : userRole === 'employer' || userRole === 'admin' ? (
            <>{isOwner ? 'View Applicants' : 'View Details'} <ArrowUpRight className="w-4 h-4" /></>
          ) : (
            <>Apply Now <ArrowUpRight className="w-4 h-4" /></>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
