# Nyamora (ニャモラ) — AI-Powered Doujin Discovery Platform

> **Product Vision:** A polished, privacy-conscious adult doujin discovery platform featuring rich catalogue exploration, hybrid semantic search, a grounded non-explicit AI concierge (**Nyan-chan**), lawful reading options, and clearly attributed outbound community references.

---

## 🌟 Key Highlights & Architectural Features

- **Original Editorial Aesthetic**: Distinctive charcoal/near-black theme (`#0b0b10`) with vibrant violet/indigo accents (`#8b5cf6`, `#a855f7`) and a fully supported clean light mode toggle. No copying of third-party layouts or branding.
- **Nyan-chan Host & AI Discovery Concierge**: Cat-eared host and catalogue guide. Grounded strictly in stored metadata; parses natural language into structured AST queries with strict negation/exclusion handling; strictly non-explicit and non-roleplay.
- **Hybrid Semantic Search Engine**: Combines full-text lexical token matching (exact title, creator, and tag boosting) with high-dimensional vector semantic similarity via **Reciprocal Rank Fusion (RRF)**.
- **Strict Server-Side Tag Exclusions**: Mandatory support for negations ("without", "not", "avoid", "-tag"). Any record with an excluded tag is strictly removed before results are returned.
- **Two Distinct Reading Architectures**:
  1. *Licensed Hosted Reader*: Rights-gated and disabled by default. Page-by-page viewer with fit-width/height, fullscreen, keyboard shortcuts, and private progress tracking.
  2. *Authorized External Destinations*: Canonical outbound links to verified partner stores (DLsite, official circles).
- **Outbound-Only Community Hub**: Curated Reddit cards linking directly to reddit.com. Strictly zero scraping or on-site thread mirroring.
- **Zero-Credential Deterministic Demo Mode**: Ships with 52 rich rights-cleared fictional catalogue entries across multiple creators, genres, tags, and languages (English, Japanese, Chinese). Fully functional out of the box without external API keys.
- **Compliance Console & Rights Register**: Operator dashboard for inspecting source provenance, licensing terms, territory clearance, toggling item quarantine, and viewing immutable audit trails.

---

## 🚀 Quickstart & Development

### 1. Requirements
- Node.js `v20+` or `v22+` (Node `v26.5` tested and supported)
- npm `10+`

### 2. Installation
```bash
git clone <repository_url>
cd Nyamora
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
```bash
npm test
```
Executes comprehensive automated tests for:
- Natural-language query parsing and concept extraction
- Minus syntax and tag exclusion
- Strict negation enforcement (guaranteeing 0 excluded tags appear in results)
- Vector embedding and cosine similarity scoring
- Rights and eligibility quarantine gates
- Grounded Nyan-chan recommendation facts

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 📂 Repository Structure

```
├── public/
│   ├── avatars/              # Nyan-chan host avatars (normal, smiling, ahegao)
│   └── covers/               # 52 stylized editorial SVG book cover assets
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # Route handlers (catalogue, search, ai, reader, admin)
│   │   ├── browse/           # Filterable catalogue grid/list with pagination
│   │   ├── item/[id]/        # Detail page with provenance & rights inspect
│   │   ├── ai-search/        # Dedicated conversational AI Search workspace
│   │   ├── reader/[id]/      # Rights-gated interactive reader
│   │   ├── community/        # Outbound Reddit references hub
│   │   ├── library/          # Private bookmarks, history & data export
│   │   └── admin/            # Compliance dashboard & audit log
│   ├── components/           # UI components (Header, Footer, Card, Theme, Modal)
│   ├── types/                # Canonical domain types & interfaces
│   ├── lib/                  # Database singleton, vector engine, theme provider
│   ├── catalogue/            # 52 seed records, creators, tags, provenance, rights
│   ├── search/               # Hybrid lexical + vector + RRF search service
│   ├── ai/                   # Nyan-chan concierge service & query parser
│   ├── connectors/           # Provider-agnostic adapter interfaces
│   └── tests/                # Automated test runner suites
├── .env.example              # Environment variables template
├── tsconfig.json             # TypeScript configuration
└── tailwind.config.ts        # Design tokens & color system
```

---

## 🛡️ Strict Boundaries & Safety Rules

1. **Underage Content**: Zero tolerance. Never index, recommend, display, or facilitate sexual content involving minors, minor-coded characters, or ambiguous-age subjects.
2. **Third-Party Rights**: No scraping, mirroring, or redistributing third-party manga/files/images without explicit rights.
3. **No Scraping Reddit**: Reddit references are curated outbound links that redirect to Reddit. Discussions are never mirrored on-site.
4. **Nyan-chan AI Boundaries**: Nyan-chan is an editorial discovery concierge. She does not engage in explicit sexual roleplay, does not generate graphic explicit text, and never invents unverified catalogue records.
