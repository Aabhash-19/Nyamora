import fs from 'node:fs';
import path from 'node:path';

const coversDir = path.resolve(process.cwd(), 'public/covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// 52 covers
const PALETTES = [
  { bg1: '#1e1b4b', bg2: '#312e81', accent: '#c084fc', text: '#f5d0fe' },
  { bg1: '#18181b', bg2: '#27272a', accent: '#a855f7', text: '#faf5ff' },
  { bg1: '#0f172a', bg2: '#1e293b', accent: '#818cf8', text: '#e0e7ff' },
  { bg1: '#3b0764', bg2: '#581c87', accent: '#f472b6', text: '#fdf2f8' },
  { bg1: '#1c1917', bg2: '#292524', accent: '#fb923c', text: '#fff7ed' },
  { bg1: '#064e3b', bg2: '#065f46', accent: '#34d399', text: '#ecfdf5' },
  { bg1: '#4a044e', bg2: '#701a75', accent: '#e879f9', text: '#fdf4ff' }
];

for (let i = 101; i <= 152; i++) {
  const p = PALETTES[i % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 850" width="600" height="850">
  <defs>
    <linearGradient id="grad-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}" />
      <stop offset="60%" stop-color="${p.bg2}" />
      <stop offset="100%" stop-color="#0b0b10" />
    </linearGradient>
    <pattern id="grid-${i}" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${p.accent}" stroke-width="0.75" stroke-opacity="0.15" />
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="600" height="850" fill="url(#grad-${i})" />
  <rect width="600" height="850" fill="url(#grid-${i})" />
  
  <!-- Framing & Border -->
  <rect x="25" y="25" width="550" height="800" rx="16" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.4" />
  <rect x="35" y="35" width="530" height="780" rx="12" fill="none" stroke="${p.accent}" stroke-width="0.75" stroke-opacity="0.25" />
  
  <!-- Header Branding -->
  <text x="60" y="80" fill="${p.accent}" font-family="sans-serif" font-size="14" font-weight="700" letter-spacing="3">NYAMORA ARCHIVE</text>
  <text x="540" y="80" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="end" font-weight="600">REF #NYM-${i}</text>
  
  <!-- Artistic Emblem / Geometric centerpiece -->
  <g transform="translate(300, 360)">
    <circle r="120" fill="none" stroke="${p.accent}" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="8 6" />
    <circle r="90" fill="${p.bg2}" fill-opacity="0.5" stroke="${p.accent}" stroke-width="1" />
    <polygon points="0,-70 60,35 -60,35" fill="none" stroke="${p.accent}" stroke-width="2" stroke-opacity="0.6" />
    <polygon points="0,70 60,-35 -60,-35" fill="none" stroke="${p.text}" stroke-width="1.5" stroke-opacity="0.5" />
    <circle r="14" fill="${p.accent}" />
    <!-- Cat silhouette / Host emblem -->
    <path d="M -18,-10 L -28,-30 L -8,-20 Z M 18,-10 L 28,-30 L 8,-20 Z" fill="${p.accent}" />
  </g>
  
  <!-- Title & Meta Banner -->
  <rect x="50" y="580" width="500" height="180" rx="12" fill="#0b0b10" fill-opacity="0.85" stroke="${p.accent}" stroke-width="1" stroke-opacity="0.4" />
  <text x="300" y="630" fill="${p.text}" font-family="sans-serif" font-size="22" font-weight="800" text-anchor="middle">CATALOGUE ENTRY ${i}</text>
  <text x="300" y="665" fill="#e2e8f0" font-family="sans-serif" font-size="15" font-weight="500" text-anchor="middle">OFFICIAL LICENSED METADATA</text>
  <text x="300" y="700" fill="${p.accent}" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">NYAMORA CURATED COLLECTION</text>
  <text x="300" y="730" fill="#64748b" font-family="sans-serif" font-size="11" text-anchor="middle">RIGHTS CLEARED • ADULT-ACCESS ONLY</text>
  
  <!-- Footer -->
  <text x="300" y="805" fill="#475569" font-family="monospace" font-size="10" text-anchor="middle">SECURE METADATA REGISTER • COPYRIGHT COMPLIANT</text>
</svg>`;

  fs.writeFileSync(path.join(coversDir, `nym-${i}.jpg`), svg, 'utf8');
}

console.log('Successfully generated 52 cover placeholder assets in public/covers/');
