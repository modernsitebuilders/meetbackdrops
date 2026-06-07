#!/usr/bin/env node
// ============================================================================
// build-slug-migration-map.js
// ----------------------------------------------------------------------------
// Wave 2 step 1 of 6. Derives new descriptive slugs from each manifest entry's
// alt text + 8-char SHA-256 of the live webp bytes, asserts global uniqueness,
// and writes image-pipeline/slug-migration-map.json. That file is the source
// of truth for every later cutover step (R2 copy, S3 HD copy, in-repo data
// rewrite, page-redirect layer, Cloudflare purge).
//
// Read-only against production R2 — never mutates anything.
//
// Usage:
//   node image-pipeline/build-slug-migration-map.js               # full run
//   node image-pipeline/build-slug-migration-map.js --limit 10    # first 10
//   node image-pipeline/build-slug-migration-map.js --resume      # keep already-hashed entries
// ============================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const OUTPUT_PATH = path.join(ROOT, 'image-pipeline', 'slug-migration-map.json');
const ASSET_ORIGIN = 'https://assets.streambackdrops.com';
const CONCURRENCY = 16;
const DESCRIPTIVE_MAX_CHARS = 60;
const HASH_LEN = 8;

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','of','in','on','at','by','with','to','for',
  'from','as','is','are','was','were','be','been','being','this','that','these',
  'those','it','its','has','have','had','do','does','did','will','would','can',
  'could','should','may','might','must','also','featuring','ideal','perfect',
]);

// ─── CLI ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function argValue(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}
const LIMIT = (() => {
  const v = argValue('--limit');
  return v ? Number(v) : null;
})();
const RESUME = args.includes('--resume');

// ─── Slug derivation ────────────────────────────────────────────────────────
function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function buildDescriptive(alt, title, category, oldSlug) {
  let tokens = tokenize(alt).filter((t) => !STOP_WORDS.has(t));
  let source = 'alt';

  if (tokens.length < 2) {
    tokens = tokenize(title).filter((t) => !STOP_WORDS.has(t));
    source = 'title';
  }
  if (tokens.length < 2) {
    tokens = tokenize(category).concat(tokenize(oldSlug)).filter((t) => !STOP_WORDS.has(t));
    source = 'fallback-category-slug';
  }

  const picked = [];
  let length = 0;
  for (const tok of tokens) {
    const next = picked.length === 0 ? tok.length : length + 1 + tok.length;
    if (next > DESCRIPTIVE_MAX_CHARS) break;
    picked.push(tok);
    length = next;
  }
  if (picked.length === 0) {
    // Last resort: hard-cap on category-slug fallback so we never return empty.
    const fallback = (category + '-' + oldSlug).toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, DESCRIPTIVE_MAX_CHARS);
    return { descriptive: fallback || 'image', source: 'fallback-empty' };
  }

  return { descriptive: picked.join('-'), source };
}

// ─── R2 hash ────────────────────────────────────────────────────────────────
async function hashFromR2(folder, imageWebp) {
  const url = `${ASSET_ORIGIN}/webp/${folder}/${imageWebp}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`R2 ${res.status} for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const hex = crypto.createHash('sha256').update(buf).digest('hex');
  return { hash8: hex.slice(0, HASH_LEN), bytes: buf.length };
}

// ─── Concurrency pool ───────────────────────────────────────────────────────
async function pool(items, fn, concurrency) {
  const queue = items.slice();
  const results = new Array(items.length);
  let idx = 0;
  const workers = new Array(Math.min(concurrency, queue.length)).fill(0).map(async () => {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      try {
        results[i] = await fn(items[i], i);
      } catch (err) {
        results[i] = { __error: err.message || String(err) };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(manifest)) throw new Error('final_manifest.json is not an array');

  let priorMap = {};
  if (RESUME && fs.existsSync(OUTPUT_PATH)) {
    const prior = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    priorMap = prior.entries || {};
    console.log(`[build-map] Resuming with ${Object.keys(priorMap).length} prior entries.`);
  }

  let items = manifest;
  if (LIMIT != null) items = items.slice(0, LIMIT);
  console.log(`[build-map] Processing ${items.length} of ${manifest.length} manifest entries (concurrency=${CONCURRENCY}).`);

  let done = 0;
  const total = items.length;
  const t0 = Date.now();

  const results = await pool(items, async (entry) => {
    const oldSlug = entry.slug;
    const folder = entry.folder;
    const oldWebp = entry.image_webp;
    const oldPng = entry.download_png;

    let hash8;
    if (RESUME && priorMap[oldSlug] && priorMap[oldSlug].hash8) {
      hash8 = priorMap[oldSlug].hash8;
    } else {
      const { hash8: h } = await hashFromR2(folder, oldWebp);
      hash8 = h;
    }

    const { descriptive, source } = buildDescriptive(entry.alt, entry.title, entry.category, oldSlug);
    const newSlug = `${descriptive}-${hash8}`;
    const newWebp = `${newSlug}.webp`;
    const newPng = `${newSlug}.png`;

    done++;
    if (done % 25 === 0 || done === total) {
      const elapsed = (Date.now() - t0) / 1000;
      const rate = done / elapsed;
      const eta = (total - done) / rate;
      console.log(`  ${done}/${total}  (${rate.toFixed(1)}/s, eta ${eta.toFixed(0)}s)`);
    }

    return {
      oldSlug,
      oldWebp,
      oldPng,
      category: entry.category,
      folder,
      hash8,
      descriptiveSource: source,
      descriptive,
      newSlug,
      newWebp,
      newPng,
      hd: entry.hd === true,
      hdOnly: entry.hdOnly === true,
      oldId: entry.id,
    };
  }, CONCURRENCY);

  // ─── Validate ───
  const errors = [];
  const newSlugSeen = new Map(); // newSlug -> oldSlug
  const fallbacks = [];

  for (const r of results) {
    if (r && r.__error) {
      errors.push(r.__error);
      continue;
    }
    if (newSlugSeen.has(r.newSlug)) {
      errors.push(`COLLISION: ${r.newSlug} from ${r.oldSlug} clashes with ${newSlugSeen.get(r.newSlug)}`);
    } else {
      newSlugSeen.set(r.newSlug, r.oldSlug);
    }
    if (r.descriptiveSource !== 'alt') fallbacks.push(`${r.oldSlug} -> ${r.descriptive} (${r.descriptiveSource})`);
  }

  if (errors.length) {
    console.error(`\n[build-map] ${errors.length} ERROR(S):`);
    for (const e of errors.slice(0, 30)) console.error('  ' + e);
    if (errors.length > 30) console.error(`  ... ${errors.length - 30} more`);
    process.exit(2);
  }

  // ─── Write ───
  const entries = {};
  for (const r of results) entries[r.oldSlug] = r;

  const output = {
    _generated_at: new Date().toISOString(),
    _generator: 'build-slug-migration-map.js',
    _slug_recipe: {
      source: 'alt text, fall back to title then category+slug',
      stop_words: Array.from(STOP_WORDS),
      max_descriptive_chars: DESCRIPTIVE_MAX_CHARS,
      hash: `SHA-256(webp bytes), first ${HASH_LEN} hex chars`,
      shape: '{descriptive}-{hash8}',
    },
    _count: results.length,
    _fallbacks: fallbacks,
    entries,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n[build-map] Wrote ${OUTPUT_PATH}`);
  console.log(`[build-map] ${results.length} entries, ${fallbacks.length} non-alt fallbacks, 0 collisions, in ${sec}s.`);
  if (fallbacks.length) {
    console.log(`[build-map] Fallbacks (first 10):`);
    for (const f of fallbacks.slice(0, 10)) console.log('  ' + f);
  }

  // Sample preview
  console.log(`\n[build-map] Sample (first 3):`);
  for (const r of results.slice(0, 3)) {
    console.log(`  ${r.oldSlug.padEnd(28)}  ->  ${r.newSlug}`);
  }
}

main().catch((err) => {
  console.error('[build-map] Failed:', err);
  process.exit(1);
});
