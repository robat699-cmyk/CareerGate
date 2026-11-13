/**
 * CareerGate Central Data Store
 * localStorage-backed reactive store for all app data.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string;
  employerId: string;
  status: 'active' | 'pending' | 'closed';
  postedAt: string;
  matchScore?: number;
  approved: boolean;
  bannerUrl?: string; // base64 or URL
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  status: 'applied' | 'interview' | 'accepted' | 'rejected';
  appliedAt: string;
  resumeUrl?: string;
  description?: string;
  approvedByAdmin: boolean;
}

export interface Resume {
  experience: { company: string; role: string; desc: string }[];
  education: { school: string; degree: string; year: string }[];
  skills: string[];
  updatedAt: string;
}

export interface UserPlan {
  userId: string;
  plan: 'basic' | 'pro' | 'enterprise';
  activatedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  title: string;
  date: string;
  score: number;
}

export interface Profile {
  name: string;
  description: string;
  certificates: Certificate[];
  resumeUrl?: string;
  profilePic?: string;
}

export interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  plan: string;
  amount: string;
  status: 'success' | 'failed' | 'processing';
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'transaction' | 'hiring' | 'posting' | 'application' | 'general';
  date: string;
  read: boolean;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  content: string;
  imageUrl?: string | null;
  likes: number;
  comments: number;
  createdAt: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

// ─── Seed Data ────────────────────────────────────────────────────────────────
// Seed data has been migrated to the MySQL backend.
const INITIAL_JOBS: Job[] = [];
const INITIAL_APPLICATIONS: Application[] = [];
const INITIAL_PAYMENTS: Payment[] = [];

const INITIAL_FEED: FeedPost[] = [
  { id: 'post-001', authorId: 'seed', authorName: 'Sara Ahmed', authorPhoto: null, content: '🎉 Just landed my dream job at TechCorp! CareerGate made the whole process seamless. Highly recommend using the AI Resume Builder!', likes: 24, comments: 5, createdAt: '2 hours ago' },
  { id: 'post-002', authorId: 'seed', authorName: 'TechCorp Recruiter', authorPhoto: null, content: '🚀 We are hiring! Looking for Senior React Developers. Great package, fully remote. Apply through CareerGate today!', likes: 47, comments: 12, createdAt: '5 hours ago' },
  { id: 'post-003', authorId: 'seed', authorName: 'Rahat Kabir', authorPhoto: null, content: '💡 Pro tip: Use the Skill Assessments on CareerGate to validate your expertise and stand out to employers. Got 3 interview calls after adding my badge!', likes: 31, comments: 8, createdAt: '1 day ago' },
];

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  JOBS: 'cg_jobs',
  APPLICATIONS: 'cg_applications',
  RESUME: 'cg_resume_',
  USER_PLAN: 'cg_plan_',
  PAYMENTS: 'cg_payments',
  NOTIFICATIONS: 'cg_notifications',
  PROFILE: 'cg_profile_',
  CERTIFICATES: 'cg_certificates',
  USERS: 'cg_users',
  PRICING: 'cg_pricing_config',
  FEED: 'cg_feed_posts',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('cg_store_update', { detail: { key } }));
}

export async function syncDataFromServer() {
  try {
    const [jobsRes, appsRes] = await Promise.all([
      fetch('http://localhost:3000/api/jobs').catch(() => null),
      fetch('http://localhost:3000/api/applications').catch(() => null)
    ]);
    
    if (jobsRes && jobsRes.ok) {
      const jobs = await jobsRes.json();
      if (jobs.length > 0) set(KEYS.JOBS, jobs);
    }
    if (appsRes && appsRes.ok) {
      const apps = await appsRes.json();
      if (apps.length > 0) set(KEYS.APPLICATIONS, apps);
    }
  } catch (err) {
    console.error('Failed to sync from MySQL server', err);
  }
}
// Try to aggressively sync data on module load
syncDataFromServer();

// ─── Jobs API ─────────────────────────────────────────────────────────────────

export function getJobs(): Job[] {
  const stored = get<Job[] | null>(KEYS.JOBS, null);
  if (!stored) {
    set(KEYS.JOBS, INITIAL_JOBS);
    return INITIAL_JOBS;
  }
  return stored;
}

export function addJob(job: Omit<Job, 'id' | 'postedAt' | 'approved'>): Job {
  const jobs = getJobs();
  const newJob: Job = { ...job, id: `j-${Date.now()}`, postedAt: 'Just now', approved: false };
  set(KEYS.JOBS, [newJob, ...jobs]);
  
  // Background MySQL push
  fetch('http://localhost:3000/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newJob)
  }).catch(console.error);
  
  // Notify admin
  getAllUsers().filter(u => u.role === 'admin').forEach(admin => {
    addNotification(admin.id, `🆕 New Job Submission: "${job.title}" by ${job.company} requires review.`, 'posting');
  });
  
  // Notify employer
  addNotification(job.employerId, `📋 Your job post "${job.title}" has been submitted and is awaiting admin approval.`, 'posting');
  
  return newJob;
}

export function updateJob(jobId: string, updates: Partial<Job>) {
  const jobs = getJobs().map(j => j.id === jobId ? { ...j, ...updates, approved: false } : j);
  set(KEYS.JOBS, jobs);
  
  // Background MySQL push
  fetch(`http://localhost:3000/api/jobs/${jobId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...updates, approved: false })
  }).catch(console.error);

  // Notify admin for re-approval
  const job = jobs.find(j => j.id === jobId);
  if (job) {
    getAllUsers().filter(u => u.role === 'admin').forEach(admin => {
      addNotification(admin.id, `📝 Job Updated: "${job.title}" was edited and needs re-approval.`, 'posting');
    });
  }
}

export function approveJob(jobId: string) {
  const jobs = getJobs().map(j => {
    if (j.id === jobId) {
      addNotification(j.employerId, `✅ Your job post "${j.title}" has been approved and is now live!`, 'posting');
      return { ...j, approved: true };
    }
    return j;
  });
  set(KEYS.JOBS, jobs);

  fetch(`http://localhost:3000/api/jobs/${jobId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved: true })
  }).catch(console.error);
}

export function deleteJob(jobId: string) {
  const jobs = getJobs().filter(j => j.id !== jobId);
  set(KEYS.JOBS, jobs);

  fetch(`http://localhost:3000/api/jobs/${jobId}`, {
    method: 'DELETE'
  }).catch(console.error);
}

export function getJobsByEmployer(employerId: string): Job[] {
  return getJobs().filter(j => j.employerId === employerId);
}

// ─── Applications API ────────────────────────────────────────────────────────

export function getApplications(): Application[] {
  const stored = get<Application[] | null>(KEYS.APPLICATIONS, null);
  if (!stored) {
    set(KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    return INITIAL_APPLICATIONS;
  }
  return stored;
}

export function getApplicationsByCandidate(candidateId: string): Application[] {
  return getApplications().filter(a => a.candidateId === candidateId);
}

export function getApplicationsByJob(jobId: string): Application[] {
  return getApplications().filter(a => a.jobId === jobId);
}

export function hasApplied(jobId: string, candidateId: string): boolean {
  return getApplications().some(a => a.jobId === jobId && a.candidateId === candidateId);
}

export function applyToJob(job: Job, candidateId: string, candidateName: string, resumeUrl: string, description: string): Application {
  const apps = getApplications();
  const newApp: Application = {
    id: `app-${Date.now()}`,
    jobId: job.id,
    jobTitle: job.title,
    companyName: job.company,
    candidateId,
    candidateName,
    status: 'applied',
    appliedAt: new Date().toLocaleDateString(),
    resumeUrl,
    description,
    approvedByAdmin: false,
  };
  set(KEYS.APPLICATIONS, [...apps, newApp]);
  
  // Background MySQL push
  fetch('http://localhost:3000/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newApp)
  }).catch(console.error);
  
  // Notify Admin
  getAllUsers().filter(u => u.role === 'admin').forEach(admin => {
    addNotification(admin.id, `🆕 New Application: ${candidateName} applied for "${job.title}". Needs validation.`, 'application');
  });

  // Notify Candidate
  addNotification(candidateId, `📨 Application Sent: You've applied for "${job.title}" at ${job.company}. Awaiting admin verification.`, 'application');
  
  return newApp;
}

export function approveApplication(appId: string) {
  const apps = getApplications();
  const app = apps.find(a => a.id === appId);
  if (app) {
    const jobs = getJobs();
    const job = jobs.find(j => j.id === app.jobId);
    if (job && job.employerId) {
      // Notify Employer
      addNotification(
        job.employerId,
        `🎉 New Validated Applicant! ${app.candidateName} is ready for review for "${app.jobTitle}". Check your dashboard.`,
        'application'
      );
    }
    // Notify Candidate
    addNotification(app.candidateId, `🔍 Verification Success: Your application for "${app.jobTitle}" has been verified and sent to the employer!`, 'application');
  }
  const updatedApps = apps.map(a => a.id === appId ? { ...a, approvedByAdmin: true } : a);
  set(KEYS.APPLICATIONS, updatedApps);

  fetch(`http://localhost:3000/api/applications/${appId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approvedByAdmin: true })
  }).catch(console.error);
}

export function updateApplicationStatus(appId: string, status: Application['status']) {
  const apps = getApplications();
  const app = apps.find(a => a.id === appId);
  if (app) {
    const statusMessages: Record<string, string> = {
      interview: `🎤 Interview Scheduled! ${app.companyName} wants to interview you for "${app.jobTitle}". Check your mail!`,
      accepted: `🎊 Offer Received! Congratulations! ${app.companyName} has accepted your application for "${app.jobTitle}".`,
      rejected: `📩 Application Update: Unfortunately, ${app.companyName} decided not to move forward with your application for "${app.jobTitle}".`,
      applied: `📋 Status Update: Your application for "${app.jobTitle}" has been reviewed.`,
    };
    if (statusMessages[status]) {
      addNotification(app.candidateId, statusMessages[status], 'hiring');
    }
  }
  const updated = apps.map(a => a.id === appId ? { ...a, status } : a);
  set(KEYS.APPLICATIONS, updated);

  fetch(`http://localhost:3000/api/applications/${appId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).catch(console.error);
}

export function getAllApplicationsForEmployer(employerId: string): Application[] {
  const employerJobIds = getJobsByEmployer(employerId).map(j => j.id);
  return getApplications().filter(a => employerJobIds.includes(a.jobId));
}

// ─── Resume API ───────────────────────────────────────────────────────────────

export function getResume(userId: string): Resume | null {
  return get<Resume | null>(KEYS.RESUME + userId, null);
}

export function saveResume(userId: string, resume: Omit<Resume, 'updatedAt'>) {
  set(KEYS.RESUME + userId, { ...resume, updatedAt: new Date().toISOString() });
}

// ─── User Plan API ────────────────────────────────────────────────────────────

export function getUserPlan(userId: string): UserPlan['plan'] {
  const plan = get<UserPlan | null>(KEYS.USER_PLAN + userId, null);
  return plan?.plan || 'basic';
}

export function setUserPlan(userId: string, plan: UserPlan['plan']) {
  set(KEYS.USER_PLAN + userId, { userId, plan, activatedAt: new Date().toISOString() });
}

// ─── Global Pricing API ────────────────────────────────────────────────────────

export function getPricing(): { pro: number; enterprise: number } {
  return get<{ pro: number; enterprise: number }>(KEYS.PRICING, { pro: 2900, enterprise: 9900 });
}

export function setPricing(pro: number, enterprise: number) {
  set(KEYS.PRICING, { pro, enterprise });
}

// ─── Payments API ─────────────────────────────────────────────────────────────

export function getPayments(): Payment[] {
  const stored = get<Payment[] | null>(KEYS.PAYMENTS, null);
  if (!stored) {
    set(KEYS.PAYMENTS, INITIAL_PAYMENTS);
    return INITIAL_PAYMENTS;
  }
  return stored;
}

export function addPayment(payment: Omit<Payment, 'id' | 'date'>): Payment {
  const payments = getPayments();
  const newPayment: Payment = { ...payment, id: `pay-${Date.now()}`, date: new Date().toISOString() };
  set(KEYS.PAYMENTS, [newPayment, ...payments]);
  
  // Notify User
  addNotification(
    payment.userId,
    `💳 Payment Confirmed! Your ${payment.plan} membership is now active. Receipt sent to ${payment.userEmail}.`,
    'transaction'
  );

  // Notify Admin
  getAllUsers().filter(u => u.role === 'admin').forEach(admin => {
    addNotification(admin.id, `💰 New Revenue: ${payment.amount} received from ${payment.userEmail} for ${payment.plan} plan.`, 'transaction');
  });

  return newPayment;
}

// ─── Notifications API ────────────────────────────────────────────────────────

export function getNotifications(userId: string): Notification[] {
  return get<Notification[]>(KEYS.NOTIFICATIONS, []).filter(n => n.userId === userId);
}

export function addNotification(userId: string, message: string, type: Notification['type'] = 'general') {
  const notifications = get<Notification[]>(KEYS.NOTIFICATIONS, []);
  const newNotif: Notification = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId,
    message,
    type,
    date: new Date().toISOString(),
    read: false,
  };
  set(KEYS.NOTIFICATIONS, [newNotif, ...notifications]);
}

export function markAsRead(notifId: string) {
  const notifications = get<Notification[]>(KEYS.NOTIFICATIONS, []).map(n =>
    n.id === notifId ? { ...n, read: true } : n
  );
  set(KEYS.NOTIFICATIONS, notifications);
}

export function markAllNotificationsRead(userId: string) {
  const notifications = get<Notification[]>(KEYS.NOTIFICATIONS, []).map(n =>
    n.userId === userId ? { ...n, read: true } : n
  );
  set(KEYS.NOTIFICATIONS, notifications);
}

// ─── Feed Posts API ───────────────────────────────────────────────────────────

export function getFeedPosts(): FeedPost[] {
  const stored = get<FeedPost[] | null>(KEYS.FEED, null);
  if (!stored) {
    set(KEYS.FEED, INITIAL_FEED);
    return INITIAL_FEED;
  }
  return stored;
}

export function addFeedPost(post: Omit<FeedPost, 'id' | 'likes' | 'comments' | 'createdAt'>): FeedPost {
  const posts = getFeedPosts();
  const newPost: FeedPost = {
    ...post,
    id: `post-${Date.now()}`,
    likes: 0,
    comments: 0,
    createdAt: new Date().toLocaleString(),
  };
  set(KEYS.FEED, [newPost, ...posts]);
  return newPost;
}

export function likeFeedPost(postId: string, increment: boolean) {
  const posts = getFeedPosts().map(p =>
    p.id === postId ? { ...p, likes: Math.max(0, p.likes + (increment ? 1 : -1)) } : p
  );
  set(KEYS.FEED, posts);
}

// ─── Profile & Certificates API ───────────────────────────────────────────────

export function getProfile(userId: string, role: string): Profile {
  const fallback: Profile = { name: '', description: '', certificates: [] };
  const key = `${KEYS.PROFILE}${role}_${userId}`;
  return get<Profile>(key, fallback);
}

export function saveProfile(userId: string, role: string, profile: Profile) {
  const key = `${KEYS.PROFILE}${role}_${userId}`;
  set(key, profile);

  // Push to MySQL via backend
  fetch(`http://localhost:3000/api/profile/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role,
      bio: profile.description,
      profilePic: profile.profilePic,
      resumeUrl: profile.resumeUrl
    })
  }).catch(console.error);
}

export function addCertificate(userId: string, role: string, cert: Omit<Certificate, 'id' | 'date'>) {
  const certificates = get<Certificate[]>(KEYS.CERTIFICATES, []);
  const newCert: Certificate = {
    ...cert,
    id: `cert-${Date.now()}`,
    date: new Date().toISOString(),
  };
  set(KEYS.CERTIFICATES, [newCert, ...certificates]);

  const profile = getProfile(userId, role);
  profile.certificates = [newCert, ...profile.certificates];
  saveProfile(userId, role, profile);
}

export function getCertificates(userId: string): Certificate[] {
  return get<Certificate[]>(KEYS.CERTIFICATES, []).filter(c => c.userId === userId);
}

// ─── User Management (for Admin) ──────────────────────────────────────────────

export interface UserSummary {
  id: string;
  email: string;
  displayName: string;
  role: string;
  lastLogin: string;
}

export function getAllUsers(): UserSummary[] {
  return get<UserSummary[]>(KEYS.USERS, []);
}

export function trackUser(user: { id: string; email: string; displayName?: string; role: string }) {
  const users = getAllUsers();
  const existing = users.find(u => u.id === user.id);
  const updated: UserSummary = {
    id: user.id,
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    role: user.role,
    lastLogin: new Date().toISOString(),
  };

  if (existing) {
    const newUsers = users.map(u => u.id === user.id ? updated : u);
    set(KEYS.USERS, newUsers);
  } else {
    set(KEYS.USERS, [updated, ...users]);
  }
}
