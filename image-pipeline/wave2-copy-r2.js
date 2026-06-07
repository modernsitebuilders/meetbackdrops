#!/usr/bin/env node
// ============================================================================
// wave2-copy-r2.js
// ----------------------------------------------------------------------------
// Wave 2 step 2 of 6. Server-side copies every webp + free PNG from its legacy
// key to its new descriptive-slug key on the streambackdrops-images R2 bucket.
// Reads slug-migration-map.json (produced by build-slug-migration-map.js).
//
// Idempotent: HEAD-checks the destination key first and skips if already
// copied. Safe to re-run after failures. Old keys are NEVER deleted.
//
// Usage:
//   node image-pipeline/wave2-copy-r2.js --dry-run   # plan, don't copy
//   node image-pipeline/wave2-copy-r2.js             # execute
//   node image-pipeline/wave2-copy-r2.js --limit 10  # subset
// ============================================================================

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const fs = require('fs');
const path = require('path');
const { S3Client, CopyObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const ROOT = path.resolve(__dirname, '..');
const MAP_PATH = path.join(ROOT, 'image-pipeline', 'slug-migration-map.json');
const LOG_PATH = path.join(ROOT, 'image-pipeline', 'wave2-r2-copy.log');

const BUCKET = process.env.R2_BUCKET;
const ENDPOINT = process.env.R2_ENDPOINT;
const ACCESS_KEY = process.env.R2_ACCESS_KEY;
const SECRET_KEY = process.env.R2_SECRET_KEY;

if (!BUCKET || !ENDPOINT || !ACCESS_KEY || !SECRET_KEY) {
  console.error('[wave2-copy-r2] Missing R2_* env. Check image-pipeline/.env');
  process.exit(1);
}

const CACHE_CONTROL = 'public, max-age=31536000, immutable';
const CONCURRENCY = 12;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 ? Number(args[i + 1]) : null;
})();

const s3 = new S3Client({
  region: 'auto',
  endpoint: ENDPOINT,
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
  // R2 / S3 CopySource encoding: URL-encoded `bucket/key`.
  const copySource = `/${BUCKET}/${srcKey.split('/').map(encodeURIComponent).join('/')}`;
  await s3.send(new CopyObjectCommand({
    Bucket: BUCKET,
    Key: dstKey,
    CopySource: copySource,
    CacheControl: CACHE_CONTROL,
    MetadataDirective: 'REPLACE', // so CacheControl actually overrides
  }));
}

async function processEntry(entry, stats) {
  const ops = [
    {
      kind: 'webp',
      src: `webp/${entry.folder}/${entry.oldWebp}`,
      dst: `webp/${entry.folder}/${entry.newWebp}`,
    },
    {
      kind: 'png',
      src: entry.oldPng,
      dst: entry.newPng,
    },
  ];

  for (const op of ops) {
    if (DRY_RUN) {
      stats.planned++;
      logLine(`PLAN  ${op.kind}  ${op.src}  ->  ${op.dst}`);
      continue;
    }

    // Idempotent: skip if dst already exists.
    if (await exists(op.dst)) {
      stats.skipped++;
      logLine(`SKIP  ${op.kind}  ${op.dst} (already present)`);
      continue;
    }

    // Verify source exists. Missing-source is logged but not fatal — a few
    // legacy PNGs may be absent for HD-only entries.
    if (!(await exists(op.src))) {
      stats.missingSrc++;
      logLine(`MISS  ${op.kind}  ${op.src} (source not found)`);
      continue;
    }

    try {
      await copyKey(op.src, op.dst);
      stats.copied++;
      logLine(`COPY  ${op.kind}  ${op.src}  ->  ${op.dst}`);
    } catch (err) {
      stats.failed++;
      logLine(`FAIL  ${op.kind}  ${op.src}  ->  ${op.dst}  :: ${err.message || err}`);
    }
  }
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
    console.error(`[wave2-copy-r2] Missing ${MAP_PATH}. Run build-slug-migration-map.js first.`);
    process.exit(1);
  }
  const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  const entries = Object.values(map.entries);
  const items = LIMIT != null ? entries.slice(0, LIMIT) : entries;

  console.log(`[wave2-copy-r2] ${DRY_RUN ? 'DRY-RUN' : 'EXECUTE'}  bucket=${BUCKET}  entries=${items.length}  concurrency=${CONCURRENCY}`);
  logLine(`--- run start, mode=${DRY_RUN ? 'DRY' : 'EXEC'}, entries=${items.length}`);

  const stats = { copied: 0, skipped: 0, planned: 0, missingSrc: 0, failed: 0 };
  let done = 0;
  const total = items.length;
  const t0 = Date.now();

  await pool(items, async (entry) => {
    await processEntry(entry, stats);
    done++;
    if (done % 50 === 0 || done === total) {
      const elapsed = (Date.now() - t0) / 1000;
      const rate = done / elapsed;
      const eta = (total - done) / rate;
      process.stdout.write(`  ${done}/${total}  (${rate.toFixed(1)}/s, eta ${eta.toFixed(0)}s)\n`);
    }
  }, CONCURRENCY);

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n[wave2-copy-r2] Done in ${sec}s`);
  console.log(`  copied=${stats.copied}  skipped=${stats.skipped}  planned=${stats.planned}  missing-src=${stats.missingSrc}  failed=${stats.failed}`);
  logLine(`--- run end, ${JSON.stringify(stats)}`);
  log.end();

  if (stats.failed > 0) process.exit(2);
}

main().catch((err) => {
  console.error('[wave2-copy-r2] Failed:', err);
  process.exit(1);
});
