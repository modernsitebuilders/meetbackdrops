#!/usr/bin/env node
// ============================================================================
// wave2-apply-map.js
// ----------------------------------------------------------------------------
// Wave 2 step 4 of 6. Rewrites every in-repo data file to point at the new
// descriptive slugs from slug-migration-map.json. Writes a timestamped backup
// of every file before touching it.
//
// Modifies:
//   - image-pipeline/final_manifest.json
//   - data/categoryData.js
//   - public/data/image-metadata-complete.json
//   - public/data/image-scores-static.json
//   - lib/products.js
//   - data/blogMetadata.js
//   - scripts/generate-hd-products.js   (patch: prefer manifest.index over slug-regex)
//   - lib/hdProducts.js                 (regenerated via the patched script)
//
// Does NOT touch lib/categories-config.js (counts re-verified at end).
// Does NOT touch lib/hdImages.js (it just re-exports from hdProducts).
//
// Usage:
//   node image-pipeline/wave2-apply-map.js --dry-run    # report planned diffs
//   node image-pipeline/wave2-apply-map.js              # execute
// ============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MAP_PATH = path.join(ROOT, 'image-pipeline', 'slug-migration-map.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

const TARGETS = {
  manifest:           path.join(ROOT, 'image-pipeline', 'final_manifest.json'),
  categoryData:       path.join(ROOT, 'data', 'categoryData.js'),
  metadataComplete:   path.join(ROOT, 'public', 'data', 'image-metadata-complete.json'),
  scoresStatic:       path.join(ROOT, 'public', 'data', 'image-scores-static.json'),
  products:           path.join(ROOT, 'lib', 'products.js'),
  blogMetadata:       path.join(ROOT, 'data', 'blogMetadata.js'),
  genHdScript:        path.join(ROOT, 'scripts', 'generate-hd-products.js'),
  categoriesConfig:   path.join(ROOT, 'lib', 'categories-config.js'),
};

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function backupPath(target) {
  return target + `.wave2-backup.${ts()}` + (target.endsWith('.json') ? '.json' : '');
}

function backupAndWrite(target, newContents) {
  if (DRY_RUN) {
    console.log(`  [dry-run] would rewrite ${path.relative(ROOT, target)}`);
    return;
  }
  const orig = fs.readFileSync(target, 'utf8');
  if (orig === newContents) {
    console.log(`  unchanged: ${path.relative(ROOT, target)}`);
    return;
  }
  const bak = backupPath(target);
  fs.writeFileSync(bak, orig);
  fs.writeFileSync(target, newContents);
  console.log(`  rewrote ${path.relative(ROOT, target)} (backup: ${path.basename(bak)})`);
}

function trailingNumber(slug) {
  const m = String(slug).match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
}

// ─── Load map ───────────────────────────────────────────────────────────────
if (!fs.existsSync(MAP_PATH)) {
  console.error(`Missing ${MAP_PATH}. Run build-slug-migration-map.js first.`);
  process.exit(1);
}
const migration = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
const entries = Object.values(migration.entries);

const byOldSlug = new Map();
const byOldWebp = new Map();
const byOldPng  = new Map();
for (const e of entries) {
  byOldSlug.set(e.oldSlug, e);
  byOldWebp.set(e.oldWebp, e);
  byOldPng.set(e.oldPng, e);
}
console.log(`[apply-map] Loaded ${entries.length} migration entries. mode=${DRY_RUN ? 'DRY' : 'EXEC'}`);

// ─── 1. final_manifest.json ─────────────────────────────────────────────────
function rewriteManifest() {
  console.log('\n[1/8] Rewriting final_manifest.json');
  const arr = JSON.parse(fs.readFileSync(TARGETS.manifest, 'utf8'));
  let touched = 0;
  for (const m of arr) {
    const map = byOldSlug.get(m.slug);
    if (!map) {
      console.log(`  WARN: manifest slug "${m.slug}" not in migration map`);
      continue;
    }
    m.slug = map.newSlug;
    m.image_webp = map.newWebp;
    m.download_png = map.newPng;
    // Preserve the legacy trailing number on the entry so generate-hd-products
    // can keep producing "Bookshelf #1" labels after the slug stops ending in
    // a digit. Computed from the old slug, which always ended in a number.
    const idx = trailingNumber(map.oldSlug);
    if (idx != null) m.index = idx;
    touched++;
  }
  backupAndWrite(TARGETS.manifest, JSON.stringify(arr, null, 2) + '\n');
  console.log(`  ${touched}/${arr.length} entries rewritten`);
}

// ─── 2. data/categoryData.js ────────────────────────────────────────────────
// Each per-category array holds { filename: 'art-gallery-01.webp', title: '...' }.
// Replace each `filename: '<oldWebp>'` literal with the new webp. Titles stay.
function rewriteCategoryData() {
  console.log('\n[2/8] Rewriting data/categoryData.js');
  const src = fs.readFileSync(TARGETS.categoryData, 'utf8');
  let touched = 0, unknown = 0;
  const out = src.replace(/filename:\s*'([^']+\.webp)'/g, (m, oldWebp) => {
    const e = byOldWebp.get(oldWebp);
    if (!e) {
      unknown++;
      return m;
    }
    touched++;
    return `filename: '${e.newWebp}'`;
  });
  backupAndWrite(TARGETS.categoryData, out);
  console.log(`  ${touched} filename literals rewritten, ${unknown} legacy/unknown (kept as-is)`);
}

// ─── 3. public/data/image-metadata-complete.json ────────────────────────────
function rewriteMetadataComplete() {
  console.log('\n[3/8] Rewriting public/data/image-metadata-complete.json');
  const arr = JSON.parse(fs.readFileSync(TARGETS.metadataComplete, 'utf8'));
  let touched = 0, unknown = 0;
  for (const item of arr) {
    if (!item) continue;
    const e = item.filename ? byOldWebp.get(item.filename) : null;
    if (!e) { unknown++; continue; }
    item.filename = e.newWebp;
    item.downloadName = e.newPng;
    touched++;
  }
  backupAndWrite(TARGETS.metadataComplete, JSON.stringify(arr, null, 2) + '\n');
  console.log(`  ${touched}/${arr.length} entries rewritten, ${unknown} legacy/unknown (kept as-is)`);
}

// ─── 4. public/data/image-scores-static.json ────────────────────────────────
// `scores` is keyed by either {slug}.webp or {slug}.png. Preserve values, swap keys.
function rewriteScores() {
  console.log('\n[4/8] Rewriting public/data/image-scores-static.json');
  const json = JSON.parse(fs.readFileSync(TARGETS.scoresStatic, 'utf8'));
  const oldScores = json.scores || {};
  const newScores = {};
  let touched = 0, unknown = 0;
  for (const [key, val] of Object.entries(oldScores)) {
    const e = byOldWebp.get(key) || byOldPng.get(key);
    if (!e) {
      newScores[key] = val; // preserve unknown rows
      unknown++;
      continue;
    }
    const newKey = key.endsWith('.png') ? e.newPng : e.newWebp;
    newScores[newKey] = val;
    touched++;
  }
  json.scores = newScores;
  json.totalImages = entries.length;
  json.wave2RekeyedAt = new Date().toISOString();
  backupAndWrite(TARGETS.scoresStatic, JSON.stringify(json, null, 2) + '\n');
  console.log(`  ${touched} score keys rewritten, ${unknown} legacy/unknown (preserved as-is)`);
}

// ─── 5. lib/products.js ─────────────────────────────────────────────────────
// For each HD migration entry, swap three substrings per record:
//   outer key: '<oldSlug>-hd':   → '<newSlug>-hd':
//   id:        id: '<oldSlug>-hd'  → id: '<newSlug>-hd'
//   r2File:    r2File: '<oldSlug>-hd.png' → r2File: '<newSlug>-hd.png'
function rewriteProducts() {
  console.log('\n[5/8] Rewriting lib/products.js');
  let src = fs.readFileSync(TARGETS.products, 'utf8');
  let touched = 0;
  for (const e of entries) {
    if (!e.hd) continue;
    const oldHd = `${e.oldSlug}-hd`;
    const newHd = `${e.newSlug}-hd`;
    const before = src;
    src = src
      .split(`'${oldHd}':`).join(`'${newHd}':`)
      .split(`id: '${oldHd}'`).join(`id: '${newHd}'`)
      .split(`r2File: '${oldHd}.png'`).join(`r2File: '${newHd}.png'`);
    if (src !== before) touched++;
  }
  backupAndWrite(TARGETS.products, src);
  console.log(`  ${touched} HD product entries renamed`);
}

// ─── 6. data/blogMetadata.js ────────────────────────────────────────────────
// 20 hardcoded "https://assets.streambackdrops.com/webp/{folder}/{slug}.webp" URLs.
function rewriteBlogMetadata() {
  console.log('\n[6/8] Rewriting data/blogMetadata.js');
  let src = fs.readFileSync(TARGETS.blogMetadata, 'utf8');
  let touched = 0, kept = 0;
  src = src.replace(
    /(https:\/\/assets\.streambackdrops\.com\/webp\/)([a-z0-9-]+)\/([a-z0-9-]+)\.webp/g,
    (m, base, folder, oldStem) => {
      const oldWebp = `${oldStem}.webp`;
      const e = byOldWebp.get(oldWebp);
      if (!e) { kept++; return m; }
      touched++;
      return `${base}${e.folder}/${e.newWebp}`;
    }
  );
  backupAndWrite(TARGETS.blogMetadata, src);
  console.log(`  ${touched} blog OG URLs rewritten, ${kept} legacy URLs kept (slug not in manifest)`);
}

// ─── 7. Patch scripts/generate-hd-products.js ───────────────────────────────
// New slugs end in -<hex hash>, so the existing trailingNumber regex returns
// null. Prefer manifest entry's `index` field when present.
function patchGenerateHdScript() {
  console.log('\n[7/8] Patching scripts/generate-hd-products.js');
  let src = fs.readFileSync(TARGETS.genHdScript, 'utf8');
  const before = src;
  src = src.replace(
    /const n = trailingNumber\(slug\);\n  if \(n == null\) \{/,
    'const n = (manifestEntry.index != null) ? manifestEntry.index : trailingNumber(slug);\n  if (n == null) {'
  );
  if (src === before) {
    console.log('  (already patched or pattern not found)');
    return;
  }
  backupAndWrite(TARGETS.genHdScript, src);
  console.log('  patched: prefers manifestEntry.index when present');
}

// ─── 8. Regenerate lib/hdProducts.js + verify categories-config ─────────────
function regenerateHdProducts() {
  console.log('\n[8/8] Regenerating lib/hdProducts.js via patched script');
  if (DRY_RUN) {
    console.log('  [dry-run] would run: node scripts/generate-hd-products.js');
    return;
  }
  try {
    const out = execSync('node scripts/generate-hd-products.js', { cwd: ROOT, encoding: 'utf8' });
    process.stdout.write(out);
  } catch (err) {
    console.error('  FAIL:', err.stdout || err.message);
    throw err;
  }
}

function verifyCounts() {
  console.log('\n[verify] Cross-check counts vs lib/categories-config.js');
  const arr = JSON.parse(fs.readFileSync(TARGETS.manifest, 'utf8'));
  const byCat = {};
  for (const e of arr) byCat[e.category] = (byCat[e.category] || 0) + 1;

  const cfg = fs.readFileSync(TARGETS.categoriesConfig, 'utf8');
  const countRe = /['"]([a-z0-9-]+)['"]\s*:\s*\{[^}]*?["']?count["']?\s*:\s*(\d+)/g;
  let mismatch = 0, checked = 0;
  let m;
  while ((m = countRe.exec(cfg)) !== null) {
    const cat = m[1];
    const declared = Number(m[2]);
    const actual = byCat[cat] || 0;
    checked++;
    if (declared !== actual) {
      console.log(`  MISMATCH ${cat}: config=${declared} manifest=${actual}`);
      mismatch++;
    }
  }
  console.log(`  ${checked} categories checked, ${mismatch} mismatches`);
}

// ─── Run ────────────────────────────────────────────────────────────────────
rewriteManifest();
rewriteCategoryData();
rewriteMetadataComplete();
rewriteScores();
rewriteProducts();
rewriteBlogMetadata();
patchGenerateHdScript();
regenerateHdProducts();
verifyCounts();

console.log(`\n[apply-map] ${DRY_RUN ? 'DRY-RUN complete.' : 'Done.'}`);
