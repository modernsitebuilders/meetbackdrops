#!/usr/bin/env node
/**
 * sync-counts.js — make lib/categories-config.js counts authoritative from the
 * manifest. Sets every CATEGORIES[slug].count to the manifest's per-category
 * count and TOTAL_IMAGES to the manifest length. Deterministic; no human input.
 *
 *   node image-pipeline/sync-counts.js --dry-run
 *   node image-pipeline/sync-counts.js
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');
const FM_PATH = path.join(__dirname, 'final_manifest.json');
const CC_PATH = path.join(ROOT, 'lib/categories-config.js');

const fm = JSON.parse(fs.readFileSync(FM_PATH, 'utf8'));
const counts = {};
for (const e of fm) counts[e.category] = (counts[e.category] || 0) + 1;

let cc = fs.readFileSync(CC_PATH, 'utf8');
const changes = [];

for (const [slug, n] of Object.entries(counts)) {
  // match:  "slug": { ... "count": <num> ... }
  const re = new RegExp(`("${slug.replace(/[-]/g, '\\-')}":\\s*\\{[\\s\\S]*?"count":\\s*)(\\d+)`);
  const m = cc.match(re);
  if (!m) { changes.push(`  (no CATEGORIES entry for ${slug} — skipped)`); continue; }
  if (Number(m[2]) !== n) {
    changes.push(`  ${slug}: ${m[2]} → ${n}`);
    cc = cc.replace(re, `$1${n}`);
  }
}

const totalRe = /(export const TOTAL_IMAGES = )(\d+)/;
const tm = cc.match(totalRe);
if (tm && Number(tm[2]) !== fm.length) {
  changes.push(`  TOTAL_IMAGES: ${tm[2]} → ${fm.length}`);
  cc = cc.replace(totalRe, `$1${fm.length}`);
}

console.log(changes.length ? 'Count changes:\n' + changes.join('\n') : 'Counts already in sync.');
if (!DRY && changes.length) {
  fs.writeFileSync(CC_PATH, cc);
  console.log('✓ wrote lib/categories-config.js');
} else if (DRY) {
  console.log('(--dry-run; no write)');
}
