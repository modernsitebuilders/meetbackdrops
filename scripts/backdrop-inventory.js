// scripts/backdrop-inventory.js
//
// Library supply snapshot, sourced from the PRIMARY manifest
// (image-pipeline/final_manifest.json). Prints live per-category counts,
// flags drift against the declared counts in lib/categories-config.js,
// and reports tag coverage — the current-supply table to weigh against
// image-pipeline/expansion-briefing.md when planning a Midjourney batch.
//
// Usage: node scripts/backdrop-inventory.js   (or: npm run backdrop-inventory)

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'image-pipeline/final_manifest.json');
const CONFIG_PATH = path.join(ROOT, 'lib/categories-config.js');

// ── Load the manifest (source of truth) ──────────────────────────────────────
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// ── Load categories-config.js (ESM) from a CommonJS script ───────────────────
// The file is authored as ES modules; strip `export ` and evaluate it in a
// function scope so we can read the declared config without a build step.
function loadConfig() {
  const src = fs.readFileSync(CONFIG_PATH, 'utf8').replace(/export\s+/g, '');
  // eslint-disable-next-line no-new-func
  return new Function(
    `${src}\n; return { CATEGORIES, TOTAL_IMAGES };`
  )();
}
const { CATEGORIES, TOTAL_IMAGES } = loadConfig();

console.log('\n🖼️  MEETBACKDROPS INVENTORY  (source: final_manifest.json)\n');

const totalImages = manifest.length;
console.log(`📊 TOTAL IMAGES IN MANIFEST: ${totalImages}`);
console.log(`📊 CONFIG TOTAL_IMAGES:      ${TOTAL_IMAGES}` +
  (TOTAL_IMAGES !== totalImages ? `   ⚠️  drift: ${TOTAL_IMAGES - totalImages}` : '   ✅'));
console.log();

// ── Live counts by category ──────────────────────────────────────────────────
const liveCounts = {};
for (const img of manifest) {
  const cat = img.category || '(uncategorized)';
  liveCounts[cat] = (liveCounts[cat] || 0) + 1;
}

console.log('📁 IMAGES BY CATEGORY  (live = manifest, config = declared count):\n');
console.log(`  ${'slug'.padEnd(24)} ${'live'.padStart(5)} ${'config'.padStart(7)}  ${'drift'.padStart(6)}  name`);
console.log(`  ${'-'.repeat(24)} ${'-'.repeat(5)} ${'-'.repeat(7)}  ${'-'.repeat(6)}  ${'-'.repeat(20)}`);

const sorted = Object.entries(liveCounts).sort((a, b) => b[1] - a[1]);
for (const [slug, live] of sorted) {
  const config = CATEGORIES[slug];
  const declared = config ? config.count : null;
  const name = config ? config.name : '(NOT IN CONFIG)';
  const drift = declared == null ? '—' : (declared - live === 0 ? '·' : (declared - live > 0 ? `+${declared - live}` : `${declared - live}`));
  console.log(`  ${slug.padEnd(24)} ${String(live).padStart(5)} ${String(declared ?? '—').padStart(7)}  ${drift.padStart(6)}  ${name}`);
}

// ── Configured categories with no images in the manifest ─────────────────────
const emptyConfigured = Object.keys(CATEGORIES).filter(slug => !liveCounts[slug]);
console.log('\n⚠️  CONFIGURED CATEGORIES WITH NO MANIFEST IMAGES:\n');
if (emptyConfigured.length === 0) {
  console.log('  ✅ Every configured category has images');
} else {
  for (const slug of emptyConfigured) {
    console.log(`  ❌ ${slug.padEnd(24)} ${CATEGORIES[slug].name}`);
  }
}

// ── Manifest categories not present in config ────────────────────────────────
const orphanCats = Object.keys(liveCounts).filter(slug => !CATEGORIES[slug]);
if (orphanCats.length) {
  console.log('\n⚠️  MANIFEST CATEGORIES NOT IN CONFIG:\n');
  for (const slug of orphanCats) {
    console.log(`  ❓ ${slug.padEnd(24)} ${liveCounts[slug]} images`);
  }
}

// ── Tag coverage (manifest uses `tags`; drives collection facets) ────────────
console.log('\n🔑 TAG STATISTICS:\n');
const allTags = [];
let emptyTagEntries = 0;
for (const img of manifest) {
  if (Array.isArray(img.tags) && img.tags.length) {
    allTags.push(...img.tags);
  } else {
    emptyTagEntries++;
  }
}
const uniqueTags = new Set(allTags);
console.log(`  Total tags:            ${allTags.length}`);
console.log(`  Unique tags:           ${uniqueTags.size}`);
console.log(`  Avg tags per image:    ${(allTags.length / totalImages).toFixed(1)}`);
console.log(`  Entries with EMPTY tags: ${emptyTagEntries}` +
  (emptyTagEntries ? '   ⚠️  back-fill with vision-full.js --slugs-file' : '   ✅'));

// ── Alt-text coverage ────────────────────────────────────────────────────────
const withAlt = manifest.filter(img => img.alt && img.alt.length > 10).length;
console.log('\n📝 ALT TEXT:\n');
console.log(`  Images with descriptive alt text: ${withAlt}/${totalImages} (${Math.round(withAlt / totalImages * 100)}%)`);

// ── Top tags ─────────────────────────────────────────────────────────────────
console.log('\n🔥 TOP 20 TAGS:\n');
const tagCounts = {};
for (const t of allTags) tagCounts[t] = (tagCounts[t] || 0) + 1;
Object.entries(tagCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([tag, count], i) => {
    console.log(`  ${String(i + 1).padEnd(3)} ${tag.padEnd(30)} ${count} images`);
  });

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n📊 SUMMARY:');
console.log(`  Total images (manifest):   ${totalImages}`);
console.log(`  Categories with images:    ${Object.keys(liveCounts).length}`);
console.log(`  Configured categories:     ${Object.keys(CATEGORIES).length}`);
console.log(`  Empty configured categories: ${emptyConfigured.length}`);
console.log(`  Entries with empty tags:   ${emptyTagEntries}`);
console.log();
