#!/usr/bin/env node
// ============================================================================
// cf-purge.js
// ----------------------------------------------------------------------------
// Wave 2 step 6 of 6. Purges Cloudflare edge cache for every URL that the
// rename changed. Run AFTER the Wave 2 commit has been deployed to production.
//
// Reads from image-pipeline/.env:
//   CLOUDFLARE_API_TOKEN   - Token with "Zone.Cache Purge" permission
//   CLOUDFLARE_ZONE_ID     - Zone ID for meetbackdrops.com
//
// What gets purged:
//   - Old R2 asset URLs         (https://assets.streambackdrops.com/webp/{folder}/{oldWebp})
//   - Old R2 root PNG URLs      (https://assets.streambackdrops.com/{oldPng})
//
// NOT purged here:
//   - meetbackdrops.com pages, sitemaps, category indexes — that domain is
//     served by Vercel, not Cloudflare. Vercel invalidates HTML on redeploy
//     and per the `revalidate: 86400` ISR settings; nothing for us to purge.
//   - New asset URLs — R2 cache headers are `immutable` and edges populate
//     on first request.
//
// Cloudflare API accepts up to 30 URLs per purge_cache call (single-file mode).
//
// Usage:
//   node image-pipeline/cf-purge.js --dry-run    # print URL list, don't call CF
//   node image-pipeline/cf-purge.js              # execute
// ============================================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const MAP_PATH = path.join(ROOT, 'image-pipeline', 'slug-migration-map.json');

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

const ASSET = 'https://assets.streambackdrops.com';
const BATCH = 30;
const REQUEST_PAUSE_MS = 250; // be polite to the CF API

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

if (!DRY_RUN && (!TOKEN || !ZONE_ID)) {
  console.error('[cf-purge] Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID.');
  console.error('           Add both to image-pipeline/.env and rerun.');
  console.error('           (dry-run mode works without them.)');
  process.exit(1);
}

if (!fs.existsSync(MAP_PATH)) {
  console.error(`[cf-purge] Missing ${MAP_PATH}.`);
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
const entries = Object.values(map.entries);

// ─── Build URL set ──────────────────────────────────────────────────────────
// Scoped to the streambackdrops.com Cloudflare zone only — that's the zone
// that fronts assets.streambackdrops.com (the R2 asset CDN).
function collectUrls() {
  const urls = new Set();
  for (const e of entries) {
    urls.add(`${ASSET}/webp/${e.folder}/${e.oldWebp}`);
    urls.add(`${ASSET}/${e.oldPng}`);
  }
  return Array.from(urls);
}

// ─── CF call ────────────────────────────────────────────────────────────────
async function purgeBatch(batch) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: batch }),
    }
  );
  const body = await res.json();
  if (!res.ok || body.success !== true) {
    const errs = (body.errors || []).map((e) => `${e.code}:${e.message}`).join('; ');
    throw new Error(`CF API ${res.status} ${errs || JSON.stringify(body)}`);
  }
  return body;
}

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const urls = collectUrls();
  console.log(`[cf-purge] zone=streambackdrops.com  ${DRY_RUN ? 'DRY-RUN' : 'EXECUTE'}  total=${urls.length}  batches=${Math.ceil(urls.length / BATCH)}`);

  if (DRY_RUN) {
    console.log('\n[cf-purge] Sample URLs (first 10):');
    for (const u of urls.slice(0, 10)) console.log('  ' + u);
    console.log('  ...');
    console.log('\n[cf-purge] DRY-RUN complete. No CF calls made.');
    return;
  }

  let purged = 0;
  let batchNum = 0;
  const total = urls.length;
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH);
    batchNum++;
    try {
      await purgeBatch(batch);
      purged += batch.length;
      console.log(`  batch ${batchNum}  +${batch.length}  (${purged}/${total})`);
    } catch (err) {
      console.error(`  batch ${batchNum}  FAIL  ${err.message}`);
      console.error('  first URL in failing batch: ' + batch[0]);
      // Continue to next batch — a single-batch failure shouldn't kill the run.
    }
    await sleep(REQUEST_PAUSE_MS);
  }

  console.log(`\n[cf-purge] Done. purged=${purged}/${total}`);
}

main().catch((err) => {
  console.error('[cf-purge] Failed:', err);
  process.exit(1);
});
