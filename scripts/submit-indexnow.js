#!/usr/bin/env node
/**
 * Submit page URLs to IndexNow so Bing (and other IndexNow participants) crawl
 * newly published pages quickly, instead of waiting for an organic recrawl.
 *
 * Why this exists: the site publishes new image / category / collection pages
 * every `npm run add-images` batch, but nothing was pinging IndexNow — so Bing
 * Webmaster Tools flagged "recently published pages were not submitted via
 * IndexNow." This script closes that gap.
 *
 * The IndexNow key file MUST stay live at:
 *   https://meetbackdrops.com/c558eb0813634eceb45913b9e7934dba.txt
 * (it lives in public/, so it deploys automatically). The filename and its
 * single-line body are both the key — do not rename or edit it.
 *
 * Usage:
 *   node scripts/submit-indexnow.js                 # submit every page URL from the sitemaps
 *   node scripts/submit-indexnow.js --dry-run       # print what would be sent, send nothing
 *   node scripts/submit-indexnow.js --limit 50      # cap how many URLs are sent (testing)
 *   node scripts/submit-indexnow.js --urls a,b,c    # submit only these absolute URLs
 *   node scripts/submit-indexnow.js --urls-file new-pages.txt   # newline-delimited URL list
 *
 * The targeted forms (--urls / --urls-file) let the add-images pipeline submit
 * just the pages it published in a batch, rather than re-sweeping the whole site.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const HOST = 'meetbackdrops.com';
const SITE_ORIGIN = `https://${HOST}`;
const KEY = 'c558eb0813634eceb45913b9e7934dba';
const KEY_LOCATION = `${SITE_ORIGIN}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

// Leaf sitemaps that contain real page <loc> entries (NOT the sitemap.xml index,
// and NOT the nested <image:loc> asset URLs on assets.streambackdrops.com).
const LEAF_SITEMAPS = [
  'sitemap-pages.xml',
  'sitemap-images.xml',
  'sitemap-image-pages.xml',
  'sitemap-collections.xml',
];

// IndexNow accepts up to 10,000 URLs per request; batch smaller for clear
// per-batch progress and to stay well under any payload limits.
const BATCH_SIZE = 1000;

function parseArgs(argv) {
  const args = { dryRun: false, limit: Infinity, urls: null, urlsFile: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--limit') args.limit = parseInt(argv[++i], 10);
    else if (a === '--urls') args.urls = argv[++i];
    else if (a === '--urls-file') args.urlsFile = argv[++i];
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!Number.isFinite(args.limit) && args.limit !== Infinity) {
    throw new Error('--limit requires a number');
  }
  return args;
}

// Pull <loc>…</loc> values. The regex deliberately matches only the <loc> tag,
// so nested <image:loc> asset URLs (different host) are never picked up.
function extractLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) locs.push(m[1].trim());
  return locs;
}

function collectFromSitemaps() {
  const urls = new Set();
  for (const file of LEAF_SITEMAPS) {
    const p = path.join(PUBLIC_DIR, file);
    if (!fs.existsSync(p)) {
      console.warn(`  ! missing sitemap, skipping: ${file}`);
      continue;
    }
    const locs = extractLocs(fs.readFileSync(p, 'utf8'));
    let kept = 0;
    for (const u of locs) {
      // Only our own pages — guards against ever pinging IndexNow with a host
      // that doesn't match the key (the API rejects mismatched hosts).
      if (u.startsWith(SITE_ORIGIN)) {
        urls.add(u);
        kept++;
      }
    }
    console.log(`  ${file.padEnd(24)} ${kept} URLs`);
  }
  return [...urls];
}

function collectFromArgs(args) {
  const urls = new Set();
  if (args.urlsFile) {
    const raw = fs.readFileSync(path.resolve(args.urlsFile), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const u = line.trim();
      if (u) urls.add(u);
    }
  }
  if (args.urls) {
    for (const u of args.urls.split(',')) {
      const t = u.trim();
      if (t) urls.add(t);
    }
  }
  const list = [...urls];
  const bad = list.filter((u) => !u.startsWith(SITE_ORIGIN));
  if (bad.length) {
    throw new Error(
      `These URLs are not on ${SITE_ORIGIN} and would be rejected by IndexNow:\n  ${bad.join('\n  ')}`
    );
  }
  return list;
}

async function submitBatch(urlList) {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  let body = '';
  try {
    body = await res.text();
  } catch {
    /* ignore */
  }
  return { status: res.status, ok: res.ok, body };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let urls;
  if (args.urls || args.urlsFile) {
    console.log('Collecting URLs from arguments…');
    urls = collectFromArgs(args);
  } else {
    console.log('Collecting URLs from sitemaps…');
    urls = collectFromSitemaps();
  }

  if (Number.isFinite(args.limit)) urls = urls.slice(0, args.limit);

  console.log(`\n${urls.length} unique URL(s) to submit to IndexNow.`);
  if (urls.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  if (args.dryRun) {
    console.log('\n--dry-run: not submitting. First 10 URLs:');
    for (const u of urls.slice(0, 10)) console.log(`  ${u}`);
    if (urls.length > 10) console.log(`  …and ${urls.length - 10} more`);
    return;
  }

  console.log(`Key location: ${KEY_LOCATION}\n`);

  let failed = 0;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const n = Math.floor(i / BATCH_SIZE) + 1;
    const total = Math.ceil(urls.length / BATCH_SIZE);
    process.stdout.write(`Batch ${n}/${total} (${batch.length} URLs)… `);
    try {
      const { status, ok, body } = await submitBatch(batch);
      // IndexNow returns 200 (accepted) or 202 (accepted, pending validation).
      if (ok) {
        console.log(`OK (HTTP ${status})`);
      } else {
        failed += batch.length;
        console.log(`FAILED (HTTP ${status}) ${body ? '- ' + body.slice(0, 200) : ''}`);
      }
    } catch (err) {
      failed += batch.length;
      console.log(`ERROR - ${err.message}`);
    }
  }

  const ok = urls.length - failed;
  console.log(`\nDone. ${ok}/${urls.length} URL(s) accepted by IndexNow.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
