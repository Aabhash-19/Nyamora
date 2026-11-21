import fs from 'node:fs';
import path from 'node:path';
import { generateCoverSvg, generatePageSvg } from './generate-covers.mjs';
import { AUTHENTIC_DOUJINS } from '../src/catalogue/authentic-doujins.ts';

const coversDir = path.resolve(process.cwd(), 'public/covers');
const pagesDir = path.resolve(process.cwd(), 'public/pages');

if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

const PALETTES = [
  { bg1: '#2b0938', bg2: '#581c87', accent: '#e879f9', border: '#c084fc', text: '#fdf4ff' },
  { bg1: '#091e3a', bg2: '#1e3a8a', accent: '#60a5fa', border: '#38bdf8', text: '#eff6ff' },
  { bg1: '#360917', bg2: '#831843', accent: '#f472b6', border: '#fb7185', text: '#fff1f2' },
  { bg1: '#062d22', bg2: '#065f46', accent: '#34d399', border: '#4ade80', text: '#ecfdf5' },
  { bg1: '#1a102f', bg2: '#371b58', accent: '#a855f7', border: '#818cf8', text: '#faf5ff' },
  { bg1: '#2e1005', bg2: '#7c2d12', accent: '#fb923c', border: '#f97316', text: '#fff7ed' },
  { bg1: '#171720', bg2: '#272738', accent: '#c084fc', border: '#a855f7', text: '#f3e8ff' }
];

console.log(`Processing ${AUTHENTIC_DOUJINS.length} authentic doujin records...`);

for (const item of AUTHENTIC_DOUJINS) {
  const palette = PALETTES[parseInt(item.id.replace('nym-', ''), 10) % PALETTES.length];

  // 1. Cover SVG
  const coverSvg = generateCoverSvg(
    item.id,
    item.title,
    item.jpTitle,
    item.circle,
    item.artist,
    item.event,
    item.tags,
    palette
  );
  fs.writeFileSync(path.join(coversDir, `${item.id}.svg`), coverSvg, 'utf8');
  fs.writeFileSync(path.join(coversDir, `${item.id}.jpg`), coverSvg, 'utf8');

  // 2. Multi-page Reader Spreads (Pages 1 to 5 for every work)
  const itemPageDir = path.join(pagesDir, item.id);
  if (!fs.existsSync(itemPageDir)) fs.mkdirSync(itemPageDir, { recursive: true });

  for (let p = 1; p <= 5; p++) {
    const pageSvg = generatePageSvg(item.id, p, 5, item.title, item.artist, palette);
    fs.writeFileSync(path.join(itemPageDir, `p0${p}.svg`), pageSvg, 'utf8');
  }
}

console.log('Successfully generated authentic covers and multi-page reader files for all 52 works!');
