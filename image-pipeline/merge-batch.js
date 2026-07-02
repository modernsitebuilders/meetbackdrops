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

// category (+folder for merged) → { array, label }. Covers every canonical
// category, so whatever the pipeline classifies into routes to the right array.
function target(entry) {
  const map = {
    'office-spaces':          { array: 'IMAGES_OFFICE_SPACES',          label: 'Office Space' },
    'home-office':            { array: 'IMAGES_HOME_OFFICE',            label: 'Home Office' },
    'neutral-backgrounds':    { array: 'IMAGES_NEUTRAL_BACKGROUNDS',    label: 'Neutral & Plain Walls' },
    'living-rooms':           { array: 'IMAGES_LIVING_ROOMS',           label: 'Living Room' },
    'kitchens':               { array: 'IMAGES_KITCHENS',               label: 'Kitchen' },
    'coffee-shops':           { array: 'IMAGES_COFFEE_SHOPS',           label: 'Coffee Shop' },
    'art-galleries':          { array: 'IMAGES_ART_GALLERIES',          label: 'Art Gallery' },
    'urban-lofts':            { array: 'IMAGES_URBAN_LOFTS',            label: 'Urban Loft' },
    'gardens-patios':         { array: 'IMAGES_GARDENS_PATIOS',         label: 'Garden Patio' },
    'historic-spaces':        { array: 'IMAGES_HISTORIC_SPACES',        label: 'Historic Space' },
    'nature-landscapes':      { array: 'IMAGES_NATURE_LANDSCAPES',      label: 'Nature Landscape' },
    'libraries':              { array: 'IMAGES_LIBRARIES',              label: 'Library' },
    'bokeh-backgrounds':      { array: 'IMAGES_BOKEH_BACKGROUNDS',      label: 'Bokeh' },
    'christmas-backgrounds':  { array: 'IMAGES_CHRISTMAS_BACKGROUNDS',  label: 'Christmas' },
    'halloween-backgrounds':  { array: 'IMAGES_HALLOWEEN_BACKGROUNDS',  label: 'Halloween' },
    'valentines-backgrounds': { array: 'IMAGES_VALENTINES_BACKGROUNDS', label: 'Valentines' },
    'easter-backgrounds':     { array: 'IMAGES_EASTER_BACKGROUNDS',     label: 'Easter' },
    'spring-backgrounds':     { array: 'IMAGES_SPRING_BACKGROUNDS',     label: 'Spring' },
    'summer-backgrounds':     { array: 'IMAGES_SUMMER_BACKGROUNDS',     label: 'Summer' },
    'fall-backgrounds':       { array: 'IMAGES_FALL_BACKGROUNDS',       label: 'Fall' },
  };
  if (entry.category === 'bookshelves') {
    return entry.folder === 'bookshelves-dark'
      ? { array: 'IMAGES_BOOKSHELVES_DARK', label: 'Bookshelves Dark' }
      : { array: 'IMAGES_BOOKSHELVES_BRIGHT', label: 'Bookshelves Bright' };
  }
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
  // The vision-driven pipeline already produced full copy + tags, so carry them
  // through. (Falls back to empty if an older stub-only output is used.)
  newStubs.push({
    id: e.id || `${e.category}:${e.slug}`,
    slug: e.slug,
    category: e.category,
    folder: e.folder,
    image_webp: e.image_webp,
    download_png: e.download_png,
    title: e.title || '',
    description: e.description || '',
    alt: e.alt || '',
    tags: Array.isArray(e.tags) ? e.tags : [],
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
