#!/usr/bin/env node
/**
 * merge-vision-targeted.js — merge vision title/description/alt/tags into
 * final_manifest.json for ONLY the slugs listed in a file (one per line).
 *
 * Unlike merge-vision-into-manifest.js (which merges every matching slug),
 * this is scoped so a partial vision run can't overwrite copy for unrelated
 * entries (e.g. the orphaned pre-slug-migration vision keys).
 *
 *   node image-pipeline/merge-vision-targeted.js /tmp/new61.slugs --dry-run
 *   node image-pipeline/merge-vision-targeted.js /tmp/new61.slugs
 */
const fs = require('fs');
const path = require('path');

const SLUGS_FILE = process.argv[2];
const DRY = process.argv.includes('--dry-run');
if (!SLUGS_FILE) { console.error('usage: merge-vision-targeted.js <slugs-file> [--dry-run]'); process.exit(1); }

const FM_PATH = path.join(__dirname, 'final_manifest.json');
const VIS_PATH = path.join(__dirname, 'ai_metadata.vision-v1.json');
const TS = new Date().toISOString().replace(/[:.]/g, '-');

const want = new Set(fs.readFileSync(SLUGS_FILE, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean));
const fm = JSON.parse(fs.readFileSync(FM_PATH, 'utf8'));
const vis = JSON.parse(fs.readFileSync(VIS_PATH, 'utf8'));

let merged = 0, missingVision = 0;
for (const e of fm) {
  if (!want.has(e.slug)) continue;
  const v = vis[e.slug];
  if (!v) { missingVision++; continue; }
  e.title = v.title;
  e.description = v.description;
  e.alt = v.alt;
  e.tags = v.tags;
  merged++;
}

console.log(`targeted slugs: ${want.size} | merged: ${merged} | missing vision: ${missingVision}`);
if (DRY) { console.log('--dry-run; no write.'); process.exit(0); }

fs.copyFileSync(FM_PATH, `${FM_PATH}.merge-vision-targeted-backup.${TS}.json`);
fs.writeFileSync(FM_PATH, JSON.stringify(fm, null, 2) + '\n');
console.log(`✓ wrote final_manifest.json (backup @ ${TS})`);
