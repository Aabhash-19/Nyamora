import fs from 'node:fs';
import path from 'node:path';

const coversDir = path.resolve(process.cwd(), 'public/covers');
const pagesDir = path.resolve(process.cwd(), 'public/pages');

if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

// Palette themes for authentic doujin cover styling
const PALETTES = [
  { bg1: '#2b0938', bg2: '#581c87', accent: '#e879f9', border: '#c084fc', text: '#fdf4ff', glow: 'rgba(232, 121, 249, 0.4)' },
  { bg1: '#091e3a', bg2: '#1e3a8a', accent: '#60a5fa', border: '#38bdf8', text: '#eff6ff', glow: 'rgba(96, 165, 250, 0.4)' },
  { bg1: '#360917', bg2: '#831843', accent: '#f472b6', border: '#fb7185', text: '#fff1f2', glow: 'rgba(244, 114, 182, 0.4)' },
  { bg1: '#062d22', bg2: '#065f46', accent: '#34d399', border: '#4ade80', text: '#ecfdf5', glow: 'rgba(52, 211, 153, 0.4)' },
  { bg1: '#1a102f', bg2: '#371b58', accent: '#a855f7', border: '#818cf8', text: '#faf5ff', glow: 'rgba(168, 85, 247, 0.4)' },
  { bg1: '#2e1005', bg2: '#7c2d12', accent: '#fb923c', border: '#f97316', text: '#fff7ed', glow: 'rgba(251, 146, 60, 0.4)' },
  { bg1: '#171720', bg2: '#272738', accent: '#c084fc', border: '#a855f7', text: '#f3e8ff', glow: 'rgba(192, 132, 252, 0.4)' }
];

export function generateCoverSvg(id, title, jpTitle, circle, artist, event, tags, palette) {
  const p = palette;
  const tagChips = tags.slice(0, 3).map((t, idx) => `
    <rect x="${50 + idx * 110}" y="740" width="100" height="26" rx="6" fill="#13131c" fill-opacity="0.8" stroke="${p.accent}" stroke-width="1" />
    <text x="${100 + idx * 110}" y="757" fill="${p.accent}" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">#${t}</text>
  `).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 850" width="600" height="850">
  <defs>
    <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}" />
      <stop offset="50%" stop-color="${p.bg2}" />
      <stop offset="100%" stop-color="#0b0b12" />
    </linearGradient>
    <radialGradient id="glow-${id}" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${p.bg1}" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow-${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="black" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Full Background -->
  <rect width="600" height="850" fill="url(#bg-${id})" />
  <circle cx="300" cy="380" r="240" fill="url(#glow-${id})" />

  <!-- Manga Frame Lines -->
  <rect x="25" y="25" width="550" height="800" rx="12" fill="none" stroke="${p.border}" stroke-width="2" stroke-opacity="0.5" />
  <rect x="35" y="35" width="530" height="780" rx="8" fill="none" stroke="${p.border}" stroke-width="1" stroke-opacity="0.25" />

  <!-- Top Badges / Convention -->
  <rect x="45" y="55" width="120" height="28" rx="8" fill="#111119" fill-opacity="0.9" stroke="${p.border}" stroke-width="1" />
  <text x="105" y="74" fill="${p.accent}" font-family="sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1">${event}</text>

  <rect x="435" y="55" width="120" height="28" rx="8" fill="#e11d48" fill-opacity="0.85" />
  <text x="495" y="74" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="2">ADULT 18+</text>

  <!-- Central Character Silhouette / Artwork Emblem -->
  <g transform="translate(300, 360)">
    <circle r="140" fill="#0b0b14" fill-opacity="0.6" stroke="${p.accent}" stroke-width="2" stroke-dasharray="8 6" />
    <circle r="120" fill="none" stroke="${p.border}" stroke-width="1.5" />
    <!-- Seductive Nyamora Cat Motif Centerpiece -->
    <path d="M -50,-40 C -70,-80 -30,-120 0,-140 C 30,-120 70,-80 50,-40 C 90,0 70,60 0,90 C -70,60 -90,0 -50,-40 Z" fill="${p.accent}" fill-opacity="0.25" stroke="${p.accent}" stroke-width="2" filter="url(#shadow-${id})" />
    <path d="M -30,-60 L -50,-110 L -10,-85 Z M 30,-60 L 50,-110 L 10,-85 Z" fill="${p.accent}" />
    <!-- Stylized Heart & Rose Emblem -->
    <circle cx="0" cy="10" r="32" fill="${p.bg2}" stroke="${p.border}" stroke-width="2" />
    <path d="M -12,8 C -22,-6 0,-18 0,4 C 0,-18 22,-6 12,8 L 0,22 Z" fill="${p.accent}" />
    <text x="0" y="70" fill="${p.text}" font-family="sans-serif" font-size="13" font-weight="700" text-anchor="middle" letter-spacing="3">${circle}</text>
  </g>

  <!-- Title Plate Banner -->
  <g transform="translate(50, 520)">
    <rect width="500" height="200" rx="16" fill="#0b0b14" fill-opacity="0.9" stroke="${p.accent}" stroke-width="1.5" filter="url(#shadow-${id})" />
    
    <!-- Japanese Title -->
    <text x="250" y="45" fill="${p.accent}" font-family="sans-serif" font-size="16" font-weight="800" text-anchor="middle" letter-spacing="2">${jpTitle}</text>
    
    <!-- English Canonical Title (Multi-line safe) -->
    <text x="250" y="85" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="900" text-anchor="middle">${title.length > 34 ? title.substring(0, 32) + '...' : title}</text>
    
    <!-- Line separator -->
    <line x1="80" y1="110" x2="420" y2="110" stroke="${p.border}" stroke-width="1" stroke-opacity="0.5" />
    
    <!-- Author & Circle Attribution -->
    <text x="250" y="140" fill="${p.text}" font-family="sans-serif" font-size="14" font-weight="700" text-anchor="middle">Circle: ${circle} [Artist: ${artist}]</text>
    <text x="250" y="170" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="600" text-anchor="middle">NYAMORA VERIFIED ADULT DOUJIN ARCHIVE</text>
  </g>

  <!-- Tags Bar -->
  ${tagChips}

  <!-- Footer ID -->
  <text x="300" y="805" fill="#64748b" font-family="monospace" font-size="11" text-anchor="middle">OFFICIAL LICENSED METADATA • ID: #${id.toUpperCase()}</text>
</svg>`;
}

export function generatePageSvg(id, pageNum, totalPages, title, artist, palette) {
  const p = palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1150" width="800" height="1150">
  <defs>
    <linearGradient id="page-bg-${id}-${pageNum}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#14141e" />
      <stop offset="100%" stop-color="#09090f" />
    </linearGradient>
  </defs>

  <!-- Page Paper Background -->
  <rect width="800" height="1150" fill="url(#page-bg-${id}-${pageNum})" />

  <!-- Manga Panels Layout -->
  <rect x="40" y="40" width="720" height="1070" rx="4" fill="none" stroke="#2a2a3e" stroke-width="2" />

  <!-- Header Header -->
  <text x="50" y="30" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="600">${title} — ${artist}</text>
  <text x="750" y="30" fill="${p.accent}" font-family="monospace" font-size="12" font-weight="700" text-anchor="end">PAGE ${pageNum} / ${totalPages}</text>

  <!-- Panel 1 (Top Hero Panel) -->
  <rect x="60" y="60" width="680" height="380" rx="6" fill="#181826" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.6" />
  <circle cx="400" cy="250" r="120" fill="${p.bg2}" fill-opacity="0.3" />
  <text x="400" y="240" fill="${p.text}" font-family="sans-serif" font-size="24" font-weight="800" text-anchor="middle">STORY SCENE • ACT ${pageNum}</text>
  <text x="400" y="275" fill="#94a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">High Resolution Manga Page Content</text>

  <!-- Dialogue Bubble -->
  <path d="M 220,160 Q 250,110 360,110 Q 470,110 470,160 Q 470,200 390,200 L 350,225 L 360,200 Q 220,200 220,160 Z" fill="#ffffff" stroke="#000000" stroke-width="2" />
  <text x="345" y="155" fill="#000000" font-family="sans-serif" font-size="13" font-weight="700" text-anchor="middle">"Are you really ready for this...?"</text>
  <text x="345" y="175" fill="#e11d48" font-family="sans-serif" font-size="11" font-weight="800" text-anchor="middle">♡ ♡ ♡</text>

  <!-- Panel 2 (Middle Left) -->
  <rect x="60" y="460" width="330" height="340" rx="6" fill="#161622" stroke="#2f2f45" stroke-width="1.5" />
  <text x="225" y="630" fill="${p.accent}" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle">Close-Up Illustration</text>
  <text x="225" y="655" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">Tender Dramatic Moment</text>

  <!-- Panel 3 (Middle Right) -->
  <rect x="410" y="460" width="330" height="340" rx="6" fill="#161622" stroke="#2f2f45" stroke-width="1.5" />
  <text x="575" y="630" fill="${p.accent}" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle">Passionate Embrace</text>
  <text x="575" y="655" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">Heartfelt Confession</text>

  <!-- Panel 4 (Bottom Wide Climax Panel) -->
  <rect x="60" y="820" width="680" height="260" rx="6" fill="#1a1a2a" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.8" />
  <text x="400" y="945" fill="${p.text}" font-family="sans-serif" font-size="20" font-weight="800" text-anchor="middle">CLIMACTIC INTIMATE MOMENT</text>
  <text x="400" y="980" fill="#94a3b8" font-family="sans-serif" font-size="13" text-anchor="middle">Nyamora Official High-Definition Reader Page</text>

  <!-- Watermark Footer -->
  <text x="400" y="1125" fill="#475569" font-family="sans-serif" font-size="10" text-anchor="middle">NYAMORA ADULT READER • ALL RIGHTS RESERVED TO ORIGINAL CIRCLE</text>
</svg>`;
}
