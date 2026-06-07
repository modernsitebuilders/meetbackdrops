#!/usr/bin/env node
// ============================================================================
// wave2-sweep-stragglers.js
// ----------------------------------------------------------------------------
// Catches hardcoded {category}-NN filenames in app code that wave2-apply-map.js
// didn't sweep (per-category SEO hero filenames in lib/seo/seo.js and the
// WALL_SHELVES_HUB_FEATURED array in pages/category/[slug]/index.js).
//
// Idempotent. Backs up each file.
//
// Usage:
//   node image-pipeline/wave2-sweep-stragglers.js --dry-run
//   node image-pipeline/wave2-sweep-stragglers.js
// ============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAP_PATH = path.join(ROOT, 'image-pipeline', 'slug-migration-map.json');

const TARGETS = [
  path.join(ROOT, 'lib', 'seo', 'seo.js'),
  path.join(ROOT, 'pages', 'category', '[slug]', 'index.js'),
];

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
const byOldWebp = new Map();
const byOldStem = new Map();
for (const e of Object.values(map.entries)) {
  byOldWebp.set(e.oldWebp, e);
  byOldStem.set(e.oldSlug, e);
}

function ts() { return new Date().toISOString().replace(/[:.]/g, '-'); }

for (const target of TARGETS) {
  const src = fs.readFileSync(target, 'utf8');

  let touched = 0, unknown = 0;
  // Replace `filename: '<old>.webp'` literals.
  let out = src.replace(/(filename:\s*['"])([a-z0-9-]+\.webp)(['"])/g, (m, lhs, oldWebp, rhs) => {
    const e = byOldWebp.get(oldWebp);
    if (!e) { unknown++; return m; }
    touched++;
    return `${lhs}${e.newWebp}${rhs}`;
  });

  console.log(`${path.relative(ROOT, target)}: ${touched} rewritten, ${unknown} unknown`);

  if (DRY_RUN) continue;
  if (out !== src) {
    fs.writeFileSync(target + '.wave2-sweep-backup.' + ts(), src);
    fs.writeFileSync(target, out);
    console.log(`  -> wrote (with backup)`);
  }
}
