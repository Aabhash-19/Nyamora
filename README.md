<div align="center">

<img src="docs/screenshots/nyan-chan-avatar.jpg" alt="Nyan-chan — Host of Nyamora" width="220" style="border-radius: 50%; box-shadow: 0 0 35px rgba(168, 85, 247, 0.45); border: 3px solid #a855f7;" />

# Nyamora (ニャモラ)
### AI-Powered Doujinshi Discovery Platform & Standalone PWA

[![Live Production WebApp](https://img.shields.io/badge/Live%20WebApp-nyamora.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://nyamora.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase%20%7C%20Neon-336791?style=for-the-badge&logo=postgresql)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-iOS%20%26%20Android%20Installable-a855f7?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

<p align="center">
  <em>"Looking for something sweet... or deliciously wicked tonight? Whisper your desires to me, darling~ ♡"</em><br />
  — <strong>Nyan-chan (ニャンちゃん)</strong>, Hostess & AI Concierge of Nyamora
</p>

---

</div>

## 📖 Overview

**Nyamora (ニャモラ)** is a high-performance, full-stack doujinshi discovery platform and progressive web application (PWA). Engineered with **Next.js 15 App Router**, **TypeScript**, and **Tailwind CSS**, Nyamora bridges natural language comprehension with deep archive retrieval. 

Featuring our signature persona guide **Nyan-chan**, Nyamora translates freeform, nuanced conversational requests into dead-accurate multi-tag structured queries, strict trope exclusions, real-time archive synchronisation, and fluid edge-rendered reading across mobile phones, iPads, and desktops.

---

## 📸 Interface & Visual Walkthrough

### 1. Discover Homepage
The central discovery hub featuring the editorial banner, real-time archive status, trending category pills, and quick natural-language query bar.

<div align="center">
  <img src="docs/screenshots/hero-home.jpg" alt="Nyamora Discover Homepage" width="90%" style="border-radius: 16px; border: 1px solid #2e2640; box-shadow: 0 8px 30px rgba(0,0,0,0.6);" />
</div>

<br />

### 2. Seductive AI Search Concierge Workspace
Nyan-chan interprets natural language desires and converts them into structured Abstract Syntax Trees (AST) with strict trope negations, surfacing verified grounded results with zero hallucination.

<div align="center">
  <img src="docs/screenshots/ai-search-workspace.jpg" alt="AI Search Workspace with Grounded Retrieval" width="90%" style="border-radius: 16px; border: 1px solid #2e2640; box-shadow: 0 8px 30px rgba(0,0,0,0.6);" />
</div>

<br />

### 3. Conversational Dialogue & Dynamic Suggestions
Interactive chat bubbles with violet narrative actions and real-time suggestion chips.

<div align="center">
  <img src="docs/screenshots/nyan-chan-concierge.jpg" alt="Nyan-chan Dialogue Concierge" width="70%" style="border-radius: 16px; border: 1px solid #2e2640; box-shadow: 0 8px 30px rgba(0,0,0,0.6);" />
</div>

<br />

### 4. Nyamora 18+ Birthday Verification Gate & Cloudflare Turnstile
Nyamora's native modal featuring Nyan-chan talking in reactive speech bubbles, strict date-of-birth 18+ age verification, and Cloudflare Turnstile human check.

<div align="center">
  <img src="docs/screenshots/age-verification-gate.png" alt="Nyamora 18+ Verification & Cloudflare Turnstile" width="55%" style="border-radius: 16px; border: 1px solid #2e2640; box-shadow: 0 8px 30px rgba(0,0,0,0.6);" />
</div>

---

## ✨ Core Features & Architectural Highlights

### 🤖 1. Nyan-chan AI Concierge (Powered by Groq LLM)
- **Seductive, Teasing Persona**: Designed with an affectionate, flirtatious catgirl aesthetic featuring italicized narrative actions highlighted in vivid violet accents.
- **Natural Language to AST Parser**: Translates complex human prompts (e.g., *"give me wholesome romance without ugly bastard or cheating in English"*) into strict JSON search payloads:
  - `include_tags`: Extracted positive genre tags, parodies, and characters.
  - `exclude_tags`: Mandatory negations strictly filtered out server-side.
  - `language`: Target language filtering (`english`, `japanese`, `chinese`).
- **Grounded Retrieval**: All candidate recommendations are verified against live archive databases before being presented, eliminating generative hallucinations.

### 🌐 2. Live nhentai API v2 Integration & Image Proxy
- Direct connection to live archive APIs with automatic fallback to high-dimensional semantic vectors.
- Multi-CDN image proxying (`/api/nhentai/image`) that bypasses client hotlinking restrictions and guarantees fast, reliable page loading.
- Instant access to over 660,000+ galleries, trending releases, popular rankings, and character tags.

### 🔍 3. Hybrid Semantic Search & Reciprocal Rank Fusion (RRF)
- Combines lexical token search (exact titles, creator names, tag matching) with cosine-similarity vector embeddings.
- RRF algorithms blend lexical scores with semantic embeddings to surface works that match the conceptual *vibe* of a query even when exact words differ.
- **Strict Server-Side Exclusion Enforcement**: Any item carrying an excluded tag (e.g. `ugly-bastard`, `netorare`, `scat`) is strictly pruned prior to serialization.

### 📱 4. Standalone Progressive Web App (PWA) & Touch Reader
- **Installable Native App**: Configured via Web App Manifest (`manifest.webmanifest`) and `appleWebApp` metadata. Installable on **iOS (Safari)** via *"Add to Home Screen"* and **Android (Chrome)** via *"Install App"*. Runs borderless in full standalone window.
- **Frosted Mobile Bottom Navigation Bar**: One-thumb access to *Discover*, *Browse*, *AI Search*, *Community*, and *Library* with iPhone safe-area padding (`env(safe-area-inset-bottom)`).
- **Touch-Swipe Manga Reader**:
  - Full-screen distraction-free reader with automatic bottom bar hiding.
  - Native touch swipe detection: swipe left or right on mobile/iPad to turn pages effortlessly.
  - Left/right viewport tap zones and keyboard arrow key navigation (`←`, `→`, `Space`).
  - Fit-Height and Fit-Width viewport toggles.

### 🛡️ 5. 18+ Birthday Verification Gate & Cloudflare Turnstile
- Strict Age Verification Gate requiring Date of Birth calculation ($18+$ check) for both **Register** and **Guest** modes.
- Integrated Cloudflare Turnstile check (*"Verify you are human"*) to eliminate automated bots and scrapers.
- Dismissal without age confirmation redirects off-site to protect minors.

### ☁️ 6. Cross-Device Cloud Sync (PostgreSQL / Supabase)
- **Multi-Device Session Portability**: Create an account on your iPhone, and log into the same account on your iPad or PC with persistent synchronization.
- **Synchronized Cloud Library**: Bookmarks and reading progress update across devices in real time.
- **Security-First Architecture**: Passwords hashed using Node's cryptographic `scrypt` with unique salts. Authenticated via tamper-proof signed session tokens and HTTP-only cookies.
- **Dual-Mode Engine**: Operates with zero configuration using in-memory fallbacks, and instantly transitions to full PostgreSQL persistence when `DATABASE_URL` is configured.

### 💬 7. Curated Community Subreddit Hub
- Quick-launch directory linking directly to major fan and doujin discussion subreddits (`r/nhentai`, `r/netorare`, `r/wholesomehentai`, `r/doujinshi`, `r/goodanimemes`, etc.).
- Categorized with filter chips and outbound redirection with strictly zero on-site scraping.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) |
| **Frontend Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) |
| **Styling & Design** | [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom Charcoal/Violet Aesthetic (`#0b0b10`, `#a855f7`) |
| **AI LLM Inference** | [Groq API](https://groq.com/) (Qwen 2.5 32B / Llama 3.3 70B Versatile) |
| **Database & Persistence**| [PostgreSQL](https://www.postgresql.org/) ([Supabase](https://supabase.com/)  via `pg.Pool` |
| **Bot Deterrence** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) |
| **App Architecture** | Progressive Web App (PWA) with Standalone Display Mode |

---

## 📁 Repository Structure

```text
Nyamora/
├── public/
│   ├── avatars/             # Nyan-chan high-resolution character illustrations
│   ├── apple-touch-icon.png # iOS home screen icon
│   └── manifest.json        # PWA metadata
├── docs/
│   └── screenshots/         # Screenshots showcasing platform features
├── src/
│   ├── ai/
│   │   └── nyan-chan.ts     # Nyan-chan persona engine & prompt structuring
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/chat/     # Conversational AI concierge endpoint
│   │   │   ├── auth/        # Register, Login, and Session verification endpoints
│   │   │   ├── catalogue/   # Gallery catalogue search & retrieval
│   │   │   ├── library/     # Cloud bookmarking & reading progress APIs
│   │   │   ├── nhentai/     # Live API v2 proxy & image relays
│   │   │   └── reader/      # Reader metadata and page decoders
│   │   ├── ai-search/       # Dedicated AI concierge workspace page
│   │   ├── browse/          # Advanced filtering & catalogue grid
│   │   ├── community/       # Community subreddit redirect directory
│   │   ├── item/[id]/       # Gallery detail & metadata view
│   │   ├── reader/[id]/     # Touch-swipe web reader page
│   │   ├── layout.tsx       # Root layout with PWA meta & ThemeProvider
│   │   ├── manifest.ts      # Next.js dynamic PWA manifest route
│   │   └── page.tsx         # Discover homepage
│   ├── components/
│   │   ├── AdultAccessModal.tsx # 18+ Birthday Gate & Cloudflare verification
│   │   ├── Header.tsx           # Responsive navigation header
│   │   ├── MobileBottomNav.tsx  # Frosted glass mobile bottom navigation
│   │   ├── NyanChanFloating.tsx # Persistent floating concierge widget
│   │   └── NyanMessageText.tsx  # Custom markdown renderer with violet actions
│   ├── lib/
│   │   ├── auth.ts          # scrypt password hashing & session token engine
│   │   ├── db.ts            # In-memory relational database & vector index
│   │   ├── postgres.ts      # PostgreSQL connection pool & automatic table migration
│   │   ├── user-store.ts    # User repository with cross-device sync
│   │   └── sources/         # Modular manga source providers (nhentai API v2)
│   ├── search/
│   │   └── hybrid-search.ts # Lexical BM25 + Vector embedding search
│   └── tests/               # Automated unit & integration test suites
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x`, `v22.x`, or `v26.x`
- **npm**: `v10.x` or higher
- **Groq API Key**: (Get one for free at [console.groq.com](https://console.groq.com))
- **PostgreSQL Database** *(Optional for multi-device cloud sync)*: [Supabase](https://supabase.com)

### 1. Clone & Install
```bash
git clone https://github.com/Aabhash-19/Nyamora.git
cd Nyamora
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# AI Concierge Inference
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_MODEL="qwen/qwen-2.5-32b"

# Optional Cloud Database for Multi-Device Sync (Supabase / Neon)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

# Optional Secret for Session Signing
JWT_SECRET="your-custom-secret-string"
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Run Test Suite
```bash
npm test
```
Executes comprehensive automated test suites covering natural language parsing, strict tag negations, vector embeddings, nhentai normalization, and cryptographic user authentication.

---

## 🌐 Live Production Deployment

Nyamora is deployed and running live on **Vercel Edge** with **Supabase PostgreSQL**:

👉 **[https://nyamora.vercel.app](https://nyamora.vercel.app)**

- **Zero Inactivity Cold Starts**: Hosted across Vercel’s global Edge network, keeping pages, PWA assets, and reader views warm 24/7 with instant 50–100ms loading.
- **Continuous Deployment (CI/CD)**: Every commit to the `main` branch automatically builds and deploys to production in under 60 seconds.
- **Cloud Database Sync**: Backed by managed PostgreSQL on Supabase ensuring persistent multi-device accounts, bookmarks, and reading progress synchronization.
- **Installable PWA**: Open [https://nyamora.vercel.app](https://nyamora.vercel.app) on your iPhone/iPad Safari or Android Chrome and tap **"Add to Home Screen"** to install Nyamora with our custom Nyan-chan icon.

---

## 🔒 Privacy, Safety & Legal Notice

- **No Minors Permitted**: Nyamora strictly enforces an adult entrance gate ($18+$ Date of Birth verification) prior to browsing or reading.
- **Zero-Storage Hotlinking**: Reader images and metadata are dynamically relayed via lawful public APIs and reverse proxies; Nyamora does not host or pirate media files on persistent disk storage.
- **Attributed Community**: All community links direct out to external third-party platforms with strictly zero thread scraping or on-site mirroring.

---

<div align="center">
  <p>Crafted with 💜 for doujinshi enthusiasts worldwide.</p>
  <sub>Nyamora &copy; 2026. All rights reserved.</sub>
</div>
