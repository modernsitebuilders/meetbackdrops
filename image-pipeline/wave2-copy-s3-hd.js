#!/usr/bin/env node
// ============================================================================
// wave2-copy-s3-hd.js
// ----------------------------------------------------------------------------
// Wave 2 step 3 of 6. Server-side copies every HD PNG in the private
// streambackdrops-premium S3 bucket from its legacy key (`{oldSlug}-hd.png`)
// to its new descriptive-slug key (`{newSlug}-hd.png`). Reads:
//   - image-pipeline/slug-migration-map.json (the canonical rename map)
//   - lib/products.js (source of truth for which HD keys actually exist)
//
// Idempotent: HEAD-checks the destination key first. Old keys are NEVER
// deleted — `lib/products.js` will be repointed at the new keys in step 4
// (wave2-apply-map.js).
//
// Reads AWS_* from .env.local at project root (same vars used by
// pages/api/hd-preview-url.js + hd-s3-download.js).
//
// Usage:
//   node image-pipeline/wave2-copy-s3-hd.js --dry-run   # plan, don't copy
//   node image-pipeline/wave2-copy-s3-hd.js             # execute
// ============================================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const fs = require('fs');
const { S3Client, CopyObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const ROOT = path.resolve(__dirname, '..');
const MAP_PATH = path.join(ROOT, 'image-pipeline', 'slug-migration-map.json');
const PRODUCTS_PATH = path.join(ROOT, 'lib', 'products.js');
const LOG_PATH = path.join(ROOT, 'image-pipeline', 'wave2-s3-hd-copy.log');

const BUCKET = 'streambackdrops-premium';
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const REGION = process.env.AWS_REGION;

if (!ACCESS_KEY || !SECRET_KEY || !REGION) {
  console.error('[wave2-copy-s3-hd] Missing AWS_* env. Check .env.local at project root.');
  process.exit(1);
}

const CONCURRENCY = 8;
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

const s3 = new S3Client({
  region: REGION,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

const log = fs.createWriteStream(LOG_PATH, { flags: 'a' });
function logLine(msg) {
  log.write(`${new Date().toISOString()}  ${msg}\n`);
}

async function exists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch (err) {
    if (err.$metadata && err.$metadata.httpStatusCode === 404) return false;
    if (err.name === 'NotFound') return false;
    throw err;
  }
}

async function copyKey(srcKey, dstKey) {
  const copySource = `/${BUCKET}/${srcKey.split('/').map(encodeURIComponent).join('/')}`;
  await s3.send(new CopyObjectCommand({
    Bucket: BUCKET,
    Key: dstKey,
    CopySource: copySource,
    MetadataDirective: 'COPY',
  }));
}

// Build the set of legacy HD keys that actually exist in lib/products.js so we
// only operate on keys the catalog promises. Format: `r2File: '...-hd.png'`.
function parseProductKeys() {
  const src = fs.readFileSync(PRODUCTS_PATH, 'utf8');
  const re = /r2File:\s*['"]([^'"]+)['"]/g;
  const keys = new Set();
  let m;
  while ((m = re.exec(src)) !== null) keys.add(m[1]);
  return keys;
}

async function pool(items, fn, concurrency) {
  let idx = 0;
  const workers = new Array(Math.min(concurrency, items.length)).fill(0).map(async () => {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      await fn(items[i]);
    }
  });
  await Promise.all(workers);
}

async function main() {
  if (!fs.existsSync(MAP_PATH)) {
    console.error(`[wave2-copy-s3-hd] Missing ${MAP_PATH}.`);
    process.exit(1);
  }
  const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  const productKeys = parseProductKeys();
  console.log(`[wave2-copy-s3-hd] Parsed ${productKeys.size} legacy HD keys from lib/products.js`);

  // Wave 2 HD plan: for each map entry where hd === true AND the legacy
  // `{oldSlug}-hd.png` is a known product key, copy to `{newSlug}-hd.png`.
  const ops = [];
  for (const entry of Object.values(map.entries)) {
    if (!entry.hd) continue;
    const oldKey = `${entry.oldSlug}-hd.png`;
    const newKey = `${entry.newSlug}-hd.png`;
    if (!productKeys.has(oldKey)) {
      logLine(`SKIP-NOT-A-PRODUCT  ${oldKey} (hd=true in manifest but not in products.js)`);
      continue;
    }
    ops.push({ entry, oldKey, newKey });
  }

  console.log(`[wave2-copy-s3-hd] ${DRY_RUN ? 'DRY-RUN' : 'EXECUTE'}  bucket=${BUCKET}  ops=${ops.length}  concurrency=${CONCURRENCY}`);
  logLine(`--- run start, mode=${DRY_RUN ? 'DRY' : 'EXEC'}, ops=${ops.length}`);

  const stats = { copied: 0, skipped: 0, planned: 0, missingSrc: 0, failed: 0 };
  let done = 0;
  const t0 = Date.now();

  await pool(ops, async (op) => {
    if (DRY_RUN) {
      stats.planned++;
      logLine(`PLAN  ${op.oldKey}  ->  ${op.newKey}`);
    } else if (await exists(op.newKey)) {
      stats.skipped++;
      logLine(`SKIP  ${op.newKey} (already present)`);
    } else if (!(await exists(op.oldKey))) {
      stats.missingSrc++;
      logLine(`MISS  ${op.oldKey} (source not found)`);
    } else {
      try {
        await copyKey(op.oldKey, op.newKey);
        stats.copied++;
        logLine(`COPY  ${op.oldKey}  ->  ${op.newKey}`);
      } catch (err) {
        stats.failed++;
        logLine(`FAIL  ${op.oldKey}  ->  ${op.newKey}  :: ${err.message || err}`);
      }
    }
    done++;
    if (done % 20 === 0 || done === ops.length) {
      const elapsed = (Date.now() - t0) / 1000;
      const rate = done / elapsed;
      const eta = (ops.length - done) / rate;
      process.stdout.write(`  ${done}/${ops.length}  (${rate.toFixed(1)}/s, eta ${eta.toFixed(0)}s)\n`);
    }
  }, CONCURRENCY);

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n[wave2-copy-s3-hd] Done in ${sec}s`);
  console.log(`  copied=${stats.copied}  skipped=${stats.skipped}  planned=${stats.planned}  missing-src=${stats.missingSrc}  failed=${stats.failed}`);
  logLine(`--- run end, ${JSON.stringify(stats)}`);
  log.end();

  if (stats.failed > 0) process.exit(2);
}

main().catch((err) => {
  console.error('[wave2-copy-s3-hd] Failed:', err);
  process.exit(1);
});
