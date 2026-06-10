#!/usr/bin/env node
// Fetches top-scored backgrounds from R2 and resizes to 1200x780 for Zoom App Gallery.
// Output: zoom-gallery-output/ in the project root.
// Usage: node scripts/zoom-gallery-images.js

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'zoom-gallery-output');
const R2_BASE = 'https://assets.streambackdrops.com';
const TARGET_W = 1200;
const TARGET_H = 780;

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/image-scores-static.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'image-pipeline/final_manifest.json'), 'utf8'));

const slugMap = new Map(manifest.map((m) => [m.image_webp, m]));

const SEASONAL = new Set(['valentines-backgrounds', 'christmas-backgrounds', 'easter-backgrounds', 'halloween-backgrounds', 'spring-backgrounds', 'summer-backgrounds']);

const top6 = Object.entries(data.scores)
  .sort((a, b) => b[1].score - a[1].score)
  .map(([file, s]) => ({ file, score: s.score, entry: slugMap.get(file) }))
  .filter((x) => x.entry && !SEASONAL.has(x.entry.category))
  .slice(0, 6);

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`Generating ${top6.length} images → ${OUT_DIR}\n`);

for (const [i, { file, score, entry }] of top6.entries()) {
  const url = `${R2_BASE}/webp/${entry.folder}/${file}`;
  const outFile = path.join(OUT_DIR, `zoom-gallery-${String(i + 1).padStart(2, '0')}-${entry.slug}.jpg`);

  process.stdout.write(`[${i + 1}/6] ${entry.slug} (score ${score})… `);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`FAILED: HTTP ${response.status} for ${url}`);
    continue;
  }
  const buffer = Buffer.from(await response.arrayBuffer());

  await sharp(buffer)
    .resize(TARGET_W, TARGET_H, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 92 })
    .toFile(outFile);

  console.log(`done → ${path.basename(outFile)}`);
}

console.log('\nAll done. Upload the files in zoom-gallery-output/ to the Zoom App Listing.');
