#!/usr/bin/env node
/**
 * Merge vision-grounded title/description/alt/tags from
 * ai_metadata.vision-v1.json into final_manifest.json.
 *
 * For each entry in final_manifest.json that has a matching slug in the
 * vision file, replace those four fields. Other fields (id, slug, category,
 * folder, image_webp, download_png, hdOnly) are untouched.
 *
 * Backs up final_manifest.json first.
 *
 * Usage:
 *   node image-pipeline/merge-vision-into-manifest.js              # live
 *   node image-pipeline/merge-vision-into-manifest.js --dry-run    # diff only
 */

const fs = require('fs');
const path = require('path');

const FM_PATH = path.join(__dirname, 'final_manifest.json');
const VIS_PATH = path.join(__dirname, 'ai_metadata.vision-v1.json');
const DRY_RUN = process.argv.includes('--dry-run');
const TS = new Date().toISOString().replace(/[:.]/g, '-');

function main() {
  const fm = JSON.parse(fs.readFileSync(FM_PATH, 'utf8'));
  const vis = JSON.parse(fs.readFileSync(VIS_PATH, 'utf8'));

  let merged = 0, missing = 0;
  const missingSlugs = [];

  for (const entry of fm) {
    const v = vis[entry.slug];
    if (!v) { missing++; missingSlugs.push(entry.slug); continue; }
    entry.title = v.title;
    entry.description = v.description;
    entry.alt = v.alt;
    entry.tags = v.tags;
    merged++;
  }

  console.log(`▶  Merge plan`);
  console.log(`  manifest entries     : ${fm.length}`);
  console.log(`  vision entries       : ${Object.keys(vis).length}`);
  console.log(`  merged (replaced 4f) : ${merged}`);
  console.log(`  missing from vision  : ${missing}`);
  if (missingSlugs.length) {
    console.log(`  missing slugs (first 5): ${missingSlugs.slice(0, 5).join(', ')}`);
  }

  // Validation pass on the merged output
  const violations = { titleOver: 0, titleUnder: 0, descOver: 0, descUnder: 0, brandMissing: 0, tagsBad: 0 };
  const FORBIDDEN = /\b(gamer|gamers|gaming|twitch|streamer|streamers|livestreamer|esports|obs|stunning|amazing|premium|ultimate|stock)\b/i;
  let voiceViolations = 0;

  for (const e of fm) {
    if (e.title.length > 95) violations.titleOver++;
    if (e.title.length < 30) violations.titleUnder++;
    if (!e.title.includes('| MeetBackdrops')) violations.brandMissing++;
    if (e.description.length > 160) violations.descOver++;
    if (e.description.length < 110) violations.descUnder++;
    const n = (e.tags || []).length;
    if (n < 8 || n > 12) violations.tagsBad++;
    const checkText = [e.title, e.description, e.alt].join(' ');
    if (FORBIDDEN.test(checkText)) voiceViolations++;
  }

  console.log(`\n▶  Post-merge validation`);
  console.log(`  title >95c           : ${violations.titleOver}`);
  console.log(`  title <30c           : ${violations.titleUnder}`);
  console.log(`  missing brand suffix : ${violations.brandMissing}`);
  console.log(`  desc >160c           : ${violations.descOver}`);
  console.log(`  desc <110c           : ${violations.descUnder}`);
  console.log(`  tags outside 8-12    : ${violations.tagsBad}`);
  console.log(`  brand-voice violations: ${voiceViolations}`);

  if (DRY_RUN) {
    console.log(`\n🧪 DRY RUN — no changes written.`);
    return;
  }

  // Backup + write
  const backup = `${FM_PATH}.merge-vision-backup.${TS}.json`;
  fs.copyFileSync(FM_PATH, backup);
  console.log(`\n  backed up → ${path.basename(backup)}`);

  fs.writeFileSync(FM_PATH, JSON.stringify(fm, null, 2));
  console.log(`  ✅ wrote final_manifest.json (${merged} entries replaced)`);
}

main();
