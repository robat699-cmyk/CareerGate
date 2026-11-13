export type UserRole = 'candidate' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Candidate {
  id: string;
  userId: string;
  fullName: string;
  resumeUrl?: string;
  videoUrl?: string;
  bio?: string;
  preferredLocation?: string;
  skills: string[];
  subscriptionPlan: 'basic' | 'professional';
}

export interface Employer {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  employeeCount: number;
  logoPath?: string;
  subscriptionPlan: 'basic' | 'professional' | 'enterprise';
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  salaryRange: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  status: 'open' | 'closed';
  createdAt: string;
  requiredSkills: string[];
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'applied' | 'under-review' | 'shortlisted' | 'interview' | 'rejected' | 'accepted';
  score: number;
  appliedAt: string;
}

export interface Assessment {
  id: string;
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  scoreThreshold: number;
}

export interface AssessmentResult {
  id: string;
  candidateId: string;
  assessmentId: string;
  score: number;
  isPassed: boolean;
  completedAt: string;
}
