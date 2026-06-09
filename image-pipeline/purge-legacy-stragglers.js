#!/usr/bin/env node
// ============================================================================
// purge-legacy-stragglers.js
// ----------------------------------------------------------------------------
// One-off follow-up to Wave 2. The 15 manifest entries that still carried
// legacy `{category}-NN` slugs turned out to be byte-identical duplicates of
// canonical entries already living under different category folders (the new
// vision-based classifier reclassified them after Wave 2). Per the decision
// to treat the canonical entry as authoritative, this script:
//
//   1. Removes the 15 legacy entries from image-pipeline/final_manifest.json.
//   2. Removes the matching `filename: '<legacy>.webp'` lines from
//      data/categoryData.js.
//   3. Removes the 15 product entries from lib/products.js.
//   4. Removes 3 orphan score keys (easter-background-95/105/108) from
//      public/data/image-scores-static.json — stale rows for deleted images.
//
// After this runs:
//   - node scripts/generate-hd-products.js   regenerates lib/hdProducts.js
//   - npm run generate:sitemaps              rebuilds the image sitemaps
//   - npm run build                          full validation gate
//
// The legacy R2 / S3 keys are NOT deleted — they remain reachable as silent
// fallbacks per the earlier decision.
//
// Backs up every file before touching it.
//
// Usage:
//   node image-pipeline/purge-legacy-stragglers.js --dry-run
//   node image-pipeline/purge-legacy-stragglers.js
// ============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const STRAGGLER_SLUGS = [
  'urban-loft-16',
  'home-offices-07', 'home-offices-22', 'home-offices-23', 'home-offices-29',
  'nature-landscape-14', 'nature-landscape-21', 'nature-landscape-22',
  'easter-background-49', 'easter-background-73', 'easter-background-88',
  'spring-background-01', 'spring-background-36', 'spring-background-43', 'spring-background-73',
];
const STRAGGLER_SET = new Set(STRAGGLER_SLUGS);

const ORPHAN_SCORE_KEYS = [
  'easter-background-95.webp',
  'easter-background-105.webp',
  'easter-background-108.webp',
];

const TARGETS = {
  manifest:     path.join(ROOT, 'image-pipeline', 'final_manifest.json'),
  categoryData: path.join(ROOT, 'data', 'categoryData.js'),
  products:     path.join(ROOT, 'lib', 'products.js'),
  scoresStatic: path.join(ROOT, 'public', 'data', 'image-scores-static.json'),
};

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function backupAndWrite(target, newContents) {
  const orig = fs.readFileSync(target, 'utf8');
  if (orig === newContents) {
    console.log(`  unchanged: ${path.relative(ROOT, target)}`);
    return;
  }
  if (DRY_RUN) {
    console.log(`  [dry-run] would rewrite ${path.relative(ROOT, target)}`);
    return;
  }
  const bak = target + `.straggler-purge-backup.${ts()}` + (target.endsWith('.json') ? '.json' : '');
  fs.writeFileSync(bak, orig);
  fs.writeFileSync(target, newContents);
  console.log(`  rewrote ${path.relative(ROOT, target)}  (backup: ${path.basename(bak)})`);
}

function purgeManifest() {
  console.log('\n[1/4] image-pipeline/final_manifest.json');
  const arr = JSON.parse(fs.readFileSync(TARGETS.manifest, 'utf8'));
  const before = arr.length;
  const filtered = arr.filter((e) => !STRAGGLER_SET.has(e.slug));
  const removed = before - filtered.length;
  console.log(`  removed ${removed} entries (${before} -> ${filtered.length})`);
  if (removed !== STRAGGLER_SLUGS.length) {
    console.warn(`  WARN: expected to remove ${STRAGGLER_SLUGS.length}, removed ${removed}`);
  }
  backupAndWrite(TARGETS.manifest, JSON.stringify(filtered, null, 2) + '\n');
}

function purgeCategoryData() {
  console.log('\n[2/4] data/categoryData.js');
  const src = fs.readFileSync(TARGETS.categoryData, 'utf8');
  const lines = src.split('\n');
  let removed = 0;
  // Match lines like:  { filename: 'urban-loft-16.webp', title: 'Urban Loft Background 16' },
  const filtered = lines.filter((line) => {
    const m = line.match(/filename:\s*'([a-z0-9-]+)\.webp'/);
    if (!m) return true;
    if (STRAGGLER_SET.has(m[1])) { removed++; return false; }
    return true;
  });
  console.log(`  removed ${removed} filename entries`);
  backupAndWrite(TARGETS.categoryData, filtered.join('\n'));
}

function purgeProducts() {
  console.log('\n[3/4] lib/products.js');
  const src = fs.readFileSync(TARGETS.products, 'utf8');
  const lines = src.split('\n');
  let removed = 0;
  const filtered = lines.filter((line) => {
    // Match lines like:  'urban-loft-16-hd': { id: 'urban-loft-16-hd', ... },
    const m = line.match(/^\s*'([a-z0-9-]+)-hd':\s*\{/);
    if (!m) return true;
    if (STRAGGLER_SET.has(m[1])) { removed++; return false; }
    return true;
  });
  console.log(`  removed ${removed} HD product entries`);
  backupAndWrite(TARGETS.products, filtered.join('\n'));
}

function purgeOrphanScores() {
  console.log('\n[4/4] public/data/image-scores-static.json');
  const json = JSON.parse(fs.readFileSync(TARGETS.scoresStatic, 'utf8'));
  const oldScores = json.scores || {};
  let removed = 0;
  for (const key of ORPHAN_SCORE_KEYS) {
    if (oldScores[key]) { delete oldScores[key]; removed++; }
  }
  console.log(`  removed ${removed} orphan score keys`);
  json.scores = oldScores;
  json.stragglersPurgedAt = new Date().toISOString();
  backupAndWrite(TARGETS.scoresStatic, JSON.stringify(json, null, 2) + '\n');
}

purgeManifest();
purgeCategoryData();
purgeProducts();
purgeOrphanScores();

console.log(`\n[done] ${DRY_RUN ? 'DRY-RUN complete.' : 'Purged.'}`);
console.log(`Next:  node scripts/generate-hd-products.js  &&  npm run generate:sitemaps  &&  npm run build`);
