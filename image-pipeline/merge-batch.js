#!/usr/bin/env node
/**
 * merge-batch.js — merge process_new_images_output.json into the two sources
 * of truth: image-pipeline/final_manifest.json and data/categoryData.js.
 *
 * - Appends a manifest stub per image (id/slug/category/folder/webp/png,
 *   empty title/description/alt, tags:[], hdOnly:false). Matches the shape of
 *   prior batches; rewrite-manifest-copy.js fills the SEO copy afterward.
 * - Inserts a { filename, title } line into the correct IMAGES_* array in
 *   categoryData.js, numbering titles sequentially within each array.
 *
 * Idempotent: a slug already present in the manifest is skipped (manifest +
 * categoryData both), so re-running is safe.
 *
 *   node image-pipeline/merge-batch.js --dry-run
 *   node image-pipeline/merge-batch.js
 */

const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');
const OUT_PATH = path.join(__dirname, 'process_new_images_output.json');
const FM_PATH = path.join(__dirname, 'final_manifest.json');
const CD_PATH = path.join(ROOT, 'data/categoryData.js');
const TS = new Date().toISOString().replace(/[:.]/g, '-');

// category (+folder for merged) → { array, label }
function target(entry) {
  const map = {
    'neutral-backgrounds': { array: 'IMAGES_NEUTRAL_BACKGROUNDS', label: 'Neutral & Plain Walls' },
    'home-office':         { array: 'IMAGES_HOME_OFFICE',         label: 'Home Office' },
    'office-spaces':       { array: 'IMAGES_OFFICE_SPACES',       label: 'Office Space' },
  };
  if (entry.category === 'wall-shelves') {
    return entry.folder === 'wall-shelves-dark'
      ? { array: 'IMAGES_WALL_SHELVES_DARK', label: 'Wall Shelves Dark' }
      : { array: 'IMAGES_WALL_SHELVES_BRIGHT', label: 'Wall Shelves Bright' };
  }
  return map[entry.category];
}

const batch = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(FM_PATH, 'utf8'));
const haveSlug = new Set(manifest.map((e) => e.slug));

// ── 1. Manifest stubs ────────────────────────────────────────────────────────
let added = 0;
const newStubs = [];
for (const e of batch) {
  if (haveSlug.has(e.slug)) continue;
  newStubs.push({
    id: `${e.category}:${e.slug}`,
    slug: e.slug,
    category: e.category,
    folder: e.folder,
    image_webp: e.image_webp,
    download_png: e.download_png,
    title: '',
    description: '',
    alt: '',
    tags: [],
    hdOnly: false,
  });
  haveSlug.add(e.slug);
  added++;
}

// ── 2. categoryData.js array inserts ─────────────────────────────────────────
let cd = fs.readFileSync(CD_PATH, 'utf8');

// group new (not-yet-present) entries by target array
const existingFilenames = new Set([...cd.matchAll(/filename:\s*'([^']+)'/g)].map((m) => m[1]));
const byArray = {};
for (const e of batch) {
  if (existingFilenames.has(e.image_webp)) continue;
  const t = target(e);
  if (!t) { console.warn(`  ⚠ no target array for ${e.slug} (${e.category})`); continue; }
  (byArray[t.array] ||= { label: t.label, items: [] }).items.push(e);
}

for (const [array, { label, items }] of Object.entries(byArray)) {
  const re = new RegExp(`(const ${array}\\s*=\\s*\\[)([\\s\\S]*?)(\\n\\];)`);
  const m = cd.match(re);
  if (!m) { console.error(`  ✗ array ${array} not found in categoryData.js`); process.exit(1); }
  const body = m[2];
  const startN = (body.match(/filename:/g) || []).length; // existing count in this array
  const lines = items.map((e, i) =>
    `  { filename: '${e.image_webp}', title: '${label} Background ${startN + i + 1}' },`
  ).join('\n');
  const insertion = (body.trimEnd().endsWith(',') || body.trim() === '' ? '' : '') + '\n' + lines;
  cd = cd.replace(re, `$1${body}${lines ? '\n' + lines : ''}$3`);
  console.log(`  + ${array}: +${items.length} (numbered ${startN + 1}..${startN + items.length})`);
}

// ── Report / write ───────────────────────────────────────────────────────────
console.log(`\nManifest stubs to add: ${added}`);
console.log(`categoryData entries to add: ${Object.values(byArray).reduce((a, b) => a + b.items.length, 0)}`);

if (DRY) { console.log('\n--dry-run; no files written.'); process.exit(0); }

fs.copyFileSync(FM_PATH, FM_PATH + `.merge-batch-backup.${TS}.json`);
fs.copyFileSync(CD_PATH, CD_PATH + `.merge-batch-backup.${TS}`);
fs.writeFileSync(FM_PATH, JSON.stringify([...manifest, ...newStubs], null, 2) + '\n');
fs.writeFileSync(CD_PATH, cd);
console.log(`\n✓ wrote final_manifest.json (+${added}) and data/categoryData.js (backups @ ${TS})`);
