#!/usr/bin/env node
// Builds the Zoom App Marketplace listing COVER image (banner).
// Spec: 1824 (w) x 176 (h) px, < 2MB, JPG/PNG. The left edge is partially
// covered by the app logo, so we keep that zone dark and text clear of it.
// Output: zoom-gallery-output/cover-meetbackdrops-1824x176.{jpg,png}
// Usage: node scripts/zoom-cover-image.js

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'zoom-gallery-output');
const R2_BASE = 'https://assets.streambackdrops.com';

const W = 1824;
const H = 176;

// Brand palette (locked — see CLAUDE.md)
const DARK = '#0d1424';   // near wordmark-dark, slightly cooler for the gradient
const GOLD = '#E0A82E';

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'image-pipeline/final_manifest.json'), 'utf8'));
const scores = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/image-scores-static.json'), 'utf8')).scores;
const scoreFor = (webp) => scores[webp]?.score || 0;

const SEASONAL = new Set(['valentines-backgrounds', 'christmas-backgrounds', 'easter-backgrounds', 'halloween-backgrounds', 'spring-backgrounds', 'summer-backgrounds']);

// Diverse, corporate-leaning mix so the banner reads as a *range* of sets.
const PICK_CATEGORIES = ['office-spaces', 'living-rooms', 'bookshelves', 'gardens-patios', 'home-office'];

function bestInCategory(cat, used) {
  return manifest
    .filter((m) => m.category === cat && !m.hdOnly && !SEASONAL.has(m.category) && !used.has(m.slug))
    .sort((a, b) => scoreFor(b.image_webp) - scoreFor(a.image_webp))[0];
}

const used = new Set();
const picks = [];
for (const cat of PICK_CATEGORIES) {
  const e = bestInCategory(cat, used);
  if (e) { picks.push(e); used.add(e.slug); }
}
// Backfill to 5 from the global top-scored if any category came up empty.
if (picks.length < 5) {
  const rest = manifest
    .filter((m) => !m.hdOnly && !SEASONAL.has(m.category) && !used.has(m.slug))
    .sort((a, b) => scoreFor(b.image_webp) - scoreFor(a.image_webp));
  for (const e of rest) { if (picks.length >= 5) break; picks.push(e); used.add(e.slug); }
}

// Cell geometry: 5 cells spanning the full width.
const N = picks.length;
const base = Math.floor(W / N);
const widths = Array.from({ length: N }, (_, i) => (i === N - 1 ? W - base * (N - 1) : base));
const offsets = widths.reduce((acc, w, i) => { acc.push(i === 0 ? 0 : acc[i - 1] + widths[i - 1]); return acc; }, []);

async function fetchCell(entry, cellW) {
  const url = `${R2_BASE}/webp/${entry.folder}/${entry.image_webp}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return sharp(buf).resize(cellW, H, { fit: 'cover', position: 'centre' }).toBuffer();
}

// Gradient + tagline overlay. Dark on the left (for the logo + text legibility),
// fading to fully transparent so the right-hand environments stay vivid.
function overlaySvg() {
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${DARK}" stop-opacity="0.96"/>
      <stop offset="0.30" stop-color="${DARK}" stop-opacity="0.82"/>
      <stop offset="0.58" stop-color="${DARK}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- subtle global darken for cohesion across mixed images -->
  <rect width="${W}" height="${H}" fill="#000000" fill-opacity="0.16"/>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <!-- gold hairline along the bottom for brand finish -->
  <rect x="0" y="${H - 3}" width="${W}" height="3" fill="${GOLD}"/>
  <!-- tagline: clear of the far-left logo zone (x < ~300) -->
  <text x="360" y="84" font-family="Helvetica, Arial, sans-serif" font-size="36" font-weight="700" fill="#FFFFFF" letter-spacing="0.2">Virtual backgrounds, designed as sets.</text>
  <text x="362" y="122" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="600" fill="${GOLD}" letter-spacing="3">ZOOM  ·  MICROSOFT TEAMS  ·  GOOGLE MEET</text>
</svg>`);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Cover montage from ${N} environments:`);
  picks.forEach((p, i) => console.log(`  ${i + 1}. [${p.category}] ${p.slug} (score ${scoreFor(p.image_webp)})`));

  const cells = await Promise.all(picks.map((p, i) => fetchCell(p, widths[i])));
  const composites = cells.map((input, i) => ({ input, left: offsets[i], top: 0 }));
  composites.push({ input: overlaySvg(), left: 0, top: 0 });

  const canvas = sharp({ create: { width: W, height: H, channels: 3, background: DARK } }).composite(composites);

  const jpgPath = path.join(OUT_DIR, 'cover-meetbackdrops-1824x176.jpg');
  const pngPath = path.join(OUT_DIR, 'cover-meetbackdrops-1824x176.png');
  await canvas.clone().jpeg({ quality: 90 }).toFile(jpgPath);
  await canvas.clone().png({ compressionLevel: 9 }).toFile(pngPath);

  for (const p of [jpgPath, pngPath]) {
    const kb = (fs.statSync(p).size / 1024).toFixed(0);
    console.log(`  → ${path.relative(ROOT, p)} (${kb} KB)`);
  }
  console.log('\nDone. Upload the .jpg as the Cover Image (1824x176).');
})();
