#!/usr/bin/env node
// Measures each manifest image's actual pixels and writes per-image visual
// facts to data/imageVisualFacts.json: overall brightness, colour temperature,
// dominant colours, and how busy the centre of the frame is (where the person
// sits). Image pages turn these into the "About this background" block, so the
// copy there comes from the image itself rather than from a shared template.
//
// Incremental: slugs already in the file are skipped, so a batch run only
// downloads its new images. Pass --all to re-measure everything.
//
//   node scripts/generate-image-visual-facts.js [--all] [--limit N]

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const MANIFEST = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const OUT = path.join(ROOT, 'data', 'imageVisualFacts.json');
const CDN = 'https://assets.streambackdrops.com';
const CONCURRENCY = 12;

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;

// Named colours in plain English. Nearest match in RGB is good enough at this
// granularity, and the list stays short so names read naturally on the page.
const NAMED = [
  ['black', [20, 20, 20]], ['charcoal', [55, 55, 60]], ['grey', [128, 128, 128]],
  ['light grey', [195, 195, 195]], ['white', [240, 240, 236]], ['cream', [235, 225, 200]],
  ['beige', [205, 185, 155]], ['tan', [180, 145, 105]], ['brown', [120, 80, 50]],
  ['dark brown', [65, 42, 28]], ['amber', [210, 140, 50]], ['gold', [200, 165, 80]],
  ['orange', [220, 110, 40]], ['terracotta', [180, 90, 60]], ['red', [170, 40, 40]],
  ['burgundy', [100, 25, 35]], ['pink', [220, 160, 170]], ['olive', [110, 110, 60]],
  ['sage', [150, 165, 130]], ['green', [60, 120, 60]], ['forest green', [35, 70, 45]],
  ['teal', [40, 110, 115]], ['sky blue', [140, 185, 220]], ['blue', [50, 90, 160]],
  ['navy', [25, 35, 70]], ['slate blue', [90, 105, 135]], ['purple', [100, 70, 130]],
];

function nearestName([r, g, b]) {
  let best = null;
  let bestD = Infinity;
  for (const [name, [nr, ng, nb]] of NAMED) {
    const d = (r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2;
    if (d < bestD) { bestD = d; best = name; }
  }
  return best;
}

async function measure(buf) {
  // 160×90 is plenty for averages and keeps the stats fast.
  const W = 160, H = 90;
  const { data } = await sharp(buf).resize(W, H, { fit: 'fill' }).removeAlpha().raw()
    .toBuffer({ resolveWithObject: true });

  let lumSum = 0, rSum = 0, bSum = 0;
  const buckets = new Map();
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[i] = l;
    lumSum += l; rSum += r; bSum += b;
    const name = nearestName([r, g, b]);
    buckets.set(name, (buckets.get(name) || 0) + 1);
  }
  const n = W * H;

  // Edge density in the centre third (x 33–67%, y 20–100%): the region a
  // seated person covers, where busy detail is what shows around hair and
  // shoulders when the virtual-background cutout is imperfect.
  let edges = 0, cells = 0;
  for (let y = Math.floor(H * 0.2); y < H - 1; y++) {
    for (let x = Math.floor(W / 3); x < Math.floor((2 * W) / 3); x++) {
      const i = y * W + x;
      const g = Math.abs(lum[i] - lum[i + 1]) + Math.abs(lum[i] - lum[i + W]);
      if (g > 24) edges++;
      cells++;
    }
  }

  const colours = [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([, c]) => c / n >= 0.08)
    .slice(0, 3)
    .map(([name]) => name);

  return {
    brightness: Math.round(lumSum / n),            // 0–255
    warmth: Math.round((rSum - bSum) / n),         // >0 warm, <0 cool
    colours,
    centreDetail: Math.round((edges / cells) * 100), // % of centre pixels on an edge
  };
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  const out = ALL ? {} : { ...existing };

  const todo = manifest.filter((e) => ALL || !out[e.slug]).slice(0, LIMIT);
  console.log(`${todo.length} images to measure (${Object.keys(out).length} already done)`);

  let done = 0, failed = 0;
  const queue = [...todo];
  async function worker() {
    while (queue.length) {
      const e = queue.shift();
      const url = `${CDN}/webp/${e.folder || e.category}/${e.image_webp}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        out[e.slug] = await measure(Buffer.from(await res.arrayBuffer()));
      } catch (err) {
        failed++;
        console.warn(`  ✗ ${e.slug}: ${err.message}`);
      }
      if (++done % 200 === 0) console.log(`  ${done}/${todo.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Drop slugs no longer in the manifest so the file tracks it exactly.
  const live = new Set(manifest.map((e) => e.slug));
  const sorted = {};
  for (const k of Object.keys(out).sort()) if (live.has(k)) sorted[k] = out[k];
  fs.writeFileSync(OUT, JSON.stringify(sorted) + '\n');
  console.log(`✓ wrote ${Object.keys(sorted).length} entries to data/imageVisualFacts.json (${failed} failed)`);
  if (failed) process.exitCode = 1;
}

main();
