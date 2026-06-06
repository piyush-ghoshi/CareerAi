# CareerAI — AI-Powered Career Readiness Suite

> An end-to-end AI career toolkit built for Indian college students to ace campus placements.

![CareerAI Banner](https://img.shields.io/badge/CareerAI-AI%20Powered-3B82F6?style=for-the-badge&logo=sparkles)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-10B981?style=flat-square)

---

## Problem Statement

Indian college students face a unique set of challenges during campus placements:

- **Resumes get rejected** by ATS systems before a human even reads them
- **Interview preparation** is generic and not role-specific
- **Portfolios lack impact** — projects are listed but not presented compellingly
- **Fake job scams** target freshers aggressively on WhatsApp and job boards

There is no single tool that addresses all four problems with real AI intelligence — until now.

---

## Solution

**CareerAI** is a 4-in-1 AI-powered career readiness suite that gives every student access to a personal career coach. Each tool is purpose-built for the Indian campus placement context.

| Tool | What it does |
|------|-------------|
| 🗂 **Resume Analyser** | Upload PDF or paste resume → ATS score, match score, keyword gaps, improvement tips |
| 🎤 **Interview Practice** | Role-specific AI questions → STAR method scoring → model answers → session radar chart |
| 🌐 **Portfolio Reviewer** | GitHub audit → README quality checks → tech relevance bars → impact statement rewrites |
| 🛡 **Scam Detector** | Paste any job posting → instant verdict (SAFE / SUSPICIOUS / SCAM) → red flag analysis |

---

## Demo

> **Live Demo:** Run locally following the setup steps below.

### Resume Analyser
Upload your resume PDF → paste the job description → get match score, ATS score, missing skills, and numbered improvement tips in seconds.

### Interview Practice
Select role + difficulty → get a timed question → write your answer → receive STAR method breakdown, score rings, model answer, and weak areas. Complete 5 questions to unlock a radar chart session summary.

### Portfolio Reviewer
Enter your GitHub URL + describe your projects → get README quality checklist, tech stack relevance bars, before/after impact statement rewrites, and missing project recommendations.

### Scam Detector
Paste any suspicious job posting → AI returns a trust score (0–100), verdict card, flagged text with categories (Financial Scam, Fake Company, etc.), pattern analysis bars, and a verification checklist.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Charts | Recharts (RadarChart) |
| Icons | Lucide React |
| PDF Parsing | pdfjs-dist |
| AI Model | Llama 3.3 70B via Groq API |
| Build Tool | Vite + Rolldown |

---

## How AI is Used

Every feature in CareerAI is AI-native — there is no mock data in production.

1. **Resume Analyser** — Sends resume text + job description to Llama 3.3 70B with a structured ATS expert prompt. Returns match score, ATS score, skill arrays, keyword gaps, and improvement tips as JSON.

2. **Interview Practice** — Two AI calls per question:
   - `generateInterviewQuestion` — generates a role/difficulty-calibrated question with a one-line answering tip
   - `scoreInterviewAnswer` — evaluates the student's answer across clarity, relevance, depth, STAR method compliance, and produces a model answer

3. **Portfolio Reviewer** — Analyses the GitHub URL + project descriptions against target role requirements. Returns README quality checks, tech relevance percentages, before/after impact rewrites, and missing project types.

4. **Scam Detector** — Applies pattern recognition for financial red flags, vague company info, unrealistic salaries, urgency pressure, and data harvesting risk. Returns a 0–100 trust score with flagged text excerpts and verification steps.

All prompts use `response_format: { type: "json_object" }` for reliable structured output. A custom parser handles edge cases and maps API errors to user-friendly messages.

---

## Project Structure

```
src/
├── api/
│   └── claude.js          ← All AI API calls (Groq/Llama)
├── components/
│   ├── Sidebar.jsx         ← Navigation sidebar
│   ├── Topbar.jsx          ← Page header bar
│   ├── ScoreRing.jsx       ← Animated SVG score ring
│   ├── SkeletonLoader.jsx  ← Shimmer loading states
│   ├── Toast.jsx           ← Slide-in notifications
│   ├── TimerBar.jsx        ← Interview countdown timer
│   ├── StarChecker.jsx     ← STAR method checker grid
│   ├── VerifyChecklist.jsx ← Interactive verification list
│   └── EmptyState.jsx      ← Empty state placeholder
├── hooks/
│   ├── useClaude.js        ← API call state (loading/error/result)
│   ├── useTimer.js         ← Countdown timer with urgency states
│   └── useToast.js         ← Toast notification manager
├── pages/
│   ├── Landing.jsx         ← Marketing landing page
│   ├── ResumeAnalyser.jsx  ← PDF upload + ATS analysis
│   ├── InterviewPractice.jsx ← 5-question mock interview
│   ├── PortfolioReviewer.jsx ← GitHub portfolio audit
│   └── ScamDetector.jsx    ← Job scam detection
└── utils/
    ├── constants.js        ← Roles, question types, difficulties
    ├── parsers.js          ← JSON parser + error mapper
    └── prompts.js          ← All AI prompt templates
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com) (takes 2 minutes)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/careerai.git
cd careerai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

Open `.env` and add your Groq API key:
```
VITE_GROQ_API_KEY=gsk_your_key_here
```

```bash
# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Test Data

Use these inputs to quickly test each tool:

**Resume Analyser**
```
Resume: "Rahul Sharma | rahul@email.com
Skills: Python, JavaScript, React, MySQL, Git
Projects: Student Portal (React + Node.js), ML Price Predictor (Python, scikit-learn)
Education: B.Tech CSE, 2025 | CGPA: 8.2"

Job Description: "Software Engineer - React, Node.js, Python, REST APIs, MongoDB, AWS, Docker"
```

**Interview Practice**
- Role: Software Engineer | Type: Behavioural | Difficulty: Medium

**Portfolio Reviewer**
- GitHub: `github.com/yourusername` | Role: Software Engineer

**Scam Detector**
```
"URGENT HIRING - Work From Home - 50000/month. No experience needed.
Pay Rs.499 registration fee. Contact: hr.jobs2025@gmail.com. Limited seats!"
```

---

## Architecture

```
Browser
  └── React App (Vite)
        ├── Pages (4 tools + Landing)
        ├── Reusable Components
        ├── Custom Hooks (useClaude, useTimer, useToast)
        └── API Layer (src/api/claude.js)
              └── Groq API
                    └── Llama 3.3 70B Versatile
```

All AI calls go through a single `callGroq()` base function in `src/api/claude.js`. No API calls are made directly from components — this keeps the AI layer swappable.

---

## Team

Built for the **AFI Hackathon 2026**.

---

## License

MIT
