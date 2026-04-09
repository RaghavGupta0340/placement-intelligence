# PlaceIQ — AI-Powered Placement Intelligence Dashboard

> 🧠 Transforming campus placements with AI-powered analytics, smart matching, and autonomous decision-making.

Built for the HackAI Season 2 — Problem Statement 1.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys (see below)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 API Keys Required

| Key | Where to get it |
|-----|----------------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as above |

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19
- **Styling**: Vanilla CSS (Dark glassmorphism design system)
- **Charts**: Recharts
- **AI Engine**: Google Gemini API (Function Calling / Agentic AI)
- **ML Logic**: Custom cosine similarity + weighted scoring (JavaScript)
- **Deployment**: Vercel

## ✨ Features

- 📊 **Dashboard Overview** — KPI cards, trend charts, placement funnel
- 👤 **Student Management** — Profiles, skill radar, application history
- 🏢 **Company Tracking** — Requirements, packages, deadlines
- 📋 **Application Tracking** — Status pipeline with AI scores
- 🤖 **AI Company Matching** — Cosine similarity skill matching engine
- 📈 **Selection Predictions** — ML-powered probability scoring
- 🔔 **Smart Alerts** — Autonomous AI-generated notifications
- 📊 **Analytics Dashboard** — 6 chart types, AI insights
- 💬 **AI Agent Chat** — Floating agentic chat with function calling

## 🧠 Agentic AI Architecture

The AI agent uses Gemini's function calling to **autonomously**:
1. Match students to companies based on skill vectors
2. Predict selection probability using weighted scoring
3. Generate alerts for TPC about at-risk students
4. Suggest next actions (apply, upskill, mock interview)
5. Analyze placement trends and provide insights

## 📁 Project Structure

```
app/
├── page.js                    # Landing page
├── login/page.js              # Auth page
├── dashboard/
│   ├── page.js                # Overview dashboard
│   ├── students/              # Student list + profiles
│   ├── companies/             # Company cards
│   ├── applications/          # Application tracking
│   ├── matching/              # AI matching engine
│   ├── predictions/           # Selection predictions
│   ├── alerts/                # Smart alerts
│   └── analytics/             # Analytics dashboard
└── api/agent/route.js         # Agentic AI API endpoint

lib/
├── ai/matching.js             # ML matching + prediction engine
├── ai/gemini.js               # Gemini API client
├── data/seed.js               # Synthetic Indian placement data
└── utils.js                   # Helpers

components/
└── ai/AgentChat.js            # Floating AI chat widget
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

---

Built with ❤️ for HackAI Season 2
