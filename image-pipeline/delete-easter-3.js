#!/usr/bin/env node
/**
 * Atomic delete of easter-background-108, -95, -105 (cross/crucifix images).
 *
 * Removes from:
 *   1. R2 webp:  webp/easter-backgrounds/{slug}.webp        (3 keys)
 *   2. R2 PNG:   {slug}.png                                  (3 keys)
 *   3. final_manifest.json
 *   4. ai_metadata.vision-v1.json
 *   5. data/categoryData.js                                  (IMAGES_EASTER array entries)
 *   6. public/data/image-metadata-complete.json
 *   7. lib/categories-config.js                              (easter-backgrounds.count, TOTAL_IMAGES)
 *
 * Backs up every mutated file first to *.delete-easter-backup.{ts}.json
 *
 * Dry-run: --dry-run prints actions without executing.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { S3Client, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const ROOT = path.join(__dirname, '..');
const SLUGS = ['easter-background-108', 'easter-background-95', 'easter-background-105'];
const DRY_RUN = process.argv.includes('--dry-run');
const TS = new Date().toISOString().replace(/[:.]/g, '-');

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

async function r2Head(key) {
  try {
    await R2.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
    return true;
  } catch (e) { return false; }
}

async function r2Delete(key) {
  if (DRY_RUN) { console.log(`  [DRY] DELETE ${key}`); return true; }
  await R2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
  return true;
}

function backupFile(filePath) {
  const backup = filePath + `.delete-easter-backup.${TS}`;
  if (DRY_RUN) { console.log(`  [DRY] backup → ${path.basename(backup)}`); return; }
  fs.copyFileSync(filePath, backup);
  console.log(`  backed up → ${path.basename(backup)}`);
}

function writeFile(filePath, content) {
  if (DRY_RUN) { console.log(`  [DRY] would write ${filePath} (${content.length} bytes)`); return; }
  fs.writeFileSync(filePath, content);
}

async function main() {
  console.log(`${DRY_RUN ? '🧪 DRY RUN' : '🗑️  LIVE DELETE'} — easter-background-{108, 95, 105}\n`);

  // 1 + 2. R2 deletions
  console.log('▶  R2 file deletions');
  const r2Keys = [];
  for (const slug of SLUGS) {
    r2Keys.push(`webp/easter-backgrounds/${slug}.webp`);
    r2Keys.push(`${slug}.png`);
  }
  for (const key of r2Keys) {
    const exists = await r2Head(key);
    if (!exists) { console.log(`  skip (not found): ${key}`); continue; }
    await r2Delete(key);
    console.log(`  ${DRY_RUN ? '[DRY] ' : '✓ '}deleted ${key}`);
  }

  // 3. final_manifest.json
  console.log('\n▶  final_manifest.json');
  const fmPath = path.join(__dirname, 'final_manifest.json');
  backupFile(fmPath);
  const fm = JSON.parse(fs.readFileSync(fmPath, 'utf8'));
  const beforeFm = fm.length;
  const newFm = fm.filter(e => !SLUGS.includes(e.slug));
  console.log(`  ${beforeFm} → ${newFm.length} entries (removed ${beforeFm - newFm.length})`);
  writeFile(fmPath, JSON.stringify(newFm, null, 2));

  // 4. ai_metadata.vision-v1.json
  console.log('\n▶  ai_metadata.vision-v1.json');
  const aimPath = path.join(__dirname, 'ai_metadata.vision-v1.json');
  if (fs.existsSync(aimPath)) {
    backupFile(aimPath);
    const aim = JSON.parse(fs.readFileSync(aimPath, 'utf8'));
    const before = Object.keys(aim).length;
    for (const s of SLUGS) delete aim[s];
    const after = Object.keys(aim).length;
    console.log(`  ${before} → ${after} entries (removed ${before - after})`);
    writeFile(aimPath, JSON.stringify(aim, null, 2));
  }

  // 5. data/categoryData.js — remove the 3 lines like
  //    { filename: 'easter-background-108.webp', title: 'Easter Background 108' },
  console.log('\n▶  data/categoryData.js');
  const cdPath = path.join(ROOT, 'data/categoryData.js');
  backupFile(cdPath);
  let cdSrc = fs.readFileSync(cdPath, 'utf8');
  let cdRemoved = 0;
  for (const slug of SLUGS) {
    // Match the full line including trailing newline. We use a tolerant regex
    // so reformatting (whitespace shifts) doesn't break it.
    const re = new RegExp(`\\s*\\{\\s*filename:\\s*['"]${slug}\\.webp['"]\\s*,[^}]*\\}\\s*,?\\n?`, 'g');
    const before = cdSrc.length;
    cdSrc = cdSrc.replace(re, '\n');
    if (cdSrc.length !== before) cdRemoved++;
  }
  console.log(`  removed ${cdRemoved}/${SLUGS.length} entries`);
  writeFile(cdPath, cdSrc);

  // 6. public/data/image-metadata-complete.json
  console.log('\n▶  public/data/image-metadata-complete.json');
  const imcPath = path.join(ROOT, 'public/data/image-metadata-complete.json');
  backupFile(imcPath);
  const imc = JSON.parse(fs.readFileSync(imcPath, 'utf8'));
  const beforeImc = Object.keys(imc).length;
  // Legacy file uses numeric string keys ("0","1"...) with filename inside.
  // Find every key whose entry.filename matches one of our slugs and delete it.
  const targets = new Set(SLUGS.map(s => `${s}.webp`));
  for (const [k, v] of Object.entries(imc)) {
    if (v && v.filename && targets.has(v.filename)) delete imc[k];
  }
  const afterImc = Object.keys(imc).length;
  console.log(`  ${beforeImc} → ${afterImc} entries (removed ${beforeImc - afterImc})`);
  writeFile(imcPath, JSON.stringify(imc, null, 2));

  // 7. lib/categories-config.js — bump easter-backgrounds.count from 83 → 80,
  //    bump TOTAL_IMAGES from 1140 → 1137
  console.log('\n▶  lib/categories-config.js');
  const ccPath = path.join(ROOT, 'lib/categories-config.js');
  backupFile(ccPath);
  let ccSrc = fs.readFileSync(ccPath, 'utf8');
  // Strict replace — relies on the actual literal values shown earlier
  ccSrc = ccSrc.replace(
    /("easter-backgrounds":\s*\{[\s\S]*?"count":\s*)83(\s*,)/,
    `$1${83 - SLUGS.length}$2`,
  );
  ccSrc = ccSrc.replace(
    /(export const TOTAL_IMAGES\s*=\s*)1140(;)/,
    `$1${1140 - SLUGS.length}$2`,
  );
  writeFile(ccPath, ccSrc);
  console.log(`  easter count 83 → 80, TOTAL_IMAGES 1140 → 1137`);

  console.log(`\n${DRY_RUN ? '🧪 DRY RUN — no actual changes' : '✅ DELETE COMPLETE'}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
