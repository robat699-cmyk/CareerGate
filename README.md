# 💼 CareerGate — AI-Powered Job Marketplace & Talent Verification Platform

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Category](https://img.shields.io/badge/Platform-Job%20Marketplace%20%26%20ATS-purple.svg)
![TypeScript](https://img.shields.io/badge/Fullstack-React%20%2B%20TypeScript%20%2B%20Express-3178C6.svg)
![Payments](https://img.shields.io/badge/Billing-Stripe%20Integrated-635BFF.svg)
![Database](https://img.shields.io/badge/Backend-Firebase%20%2F%20Firestore-FFA611.svg)

**Full-lifecycle recruitment and career ecosystem uniting candidates and employers with AI-driven ATS resume scoring, role-based workflows, automated job matching, and integrated subscription tiers.**

</div>

---

## 🎯 Overview

**CareerGate** modernizes talent acquisition and applicant tracking by combining a comprehensive employer candidate-management suite with intelligent candidate career tools. Built on a modular full-stack architecture with React, TypeScript, Express, and Firestore, CareerGate automates the friction points of modern recruiting: resume qualification, interview coordination, application filtering, and recruiter subscription billing.

---

## 🌟 Core System Capabilities

### 👨‍💼 For Employers & Recruiters
- **Streamlined Job Publishing & Pipeline**: Rich markdown job posting modal with custom screening questions, salary bandwidths, and target skill tags.
- **Applicant Tracking System (ATS)**: Automated candidate filtering, status pipelines (Applied → Screening → Interview → Offer), and resume score matching.
- **Enterprise Moderation & Access Control**: Granular admin dashboards for recruiter verification, job posting moderation, and user lifecycle governance.
- **Monetization & Plans**: Integrated Stripe subscription checkout for premium job listing slots and featured candidate visibility.

### 👩‍💻 For Candidates & Job Seekers
- **Interactive AI Resume Builder**: Dynamic resume creation supporting custom experience, education, and skill blocks with Gemini AI ATS optimization suggestions.
- **One-Click Application Portal**: Direct role applications stored seamlessly with candidate profiles, portfolios, and contact credentials.
- **Real-Time Notifications**: Instant updates on application reviews, interview scheduling, and employer messages.

---

## 🛠️ Technology Architecture

| Dimension | Technologies |
|---|---|
| **Frontend Platform** | React, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion |
| **Backend & APIs** | Node.js, Express, tsx runtime, RESTful modular controllers |
| **Database & Security** | Google Firebase / Cloud Firestore with strictly validated `firestore.rules` |
| **Authentication** | Passport.js (Google OAuth2.0), JWT authentication, bcrypt password hashing |
| **Payments & Invoicing** | Stripe API (@stripe/stripe-js) with webhook verification |
| **AI ATS Integration** | Google GenAI (@google/genai) for automated applicant resume parsing |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js (v18+)
- Firebase Account & Firestore Project
- Stripe Developer Account (optional for payment sandbox)

### Installation
```bash
# Clone the repository
git clone https://github.com/robat699-cmyk/CareerGate.git
cd CareerGate

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Populate your VITE_FIREBASE_* configs, GEMINI_API_KEY, and STRIPE keys

# Start development environment
npm run dev
```

---

## 🔒 Security & Data Integrity
- Role-Based Access Control (RBAC) enforced across both server endpoints and Firestore security rules.
- Strict session management and encrypted credential storage.
- Client-side input validation and payload sanitization adhering to OWASP guidelines.

---

<div align="center">
  <sub>Developed & Maintained by <a href="https://github.com/robat699-cmyk">It's TAWHIDUR (@robat699-cmyk)</a></sub>
</div>
