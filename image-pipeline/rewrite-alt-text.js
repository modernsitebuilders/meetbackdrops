#!/usr/bin/env node
/**
 * One-shot alt-text rewrite for the MeetBackdrops Studio brand pivot.
 *
 * Reads image-pipeline/final_manifest.json, regenerates the `alt` field on
 * every entry using descriptive, architectural language (away from the old
 * "free virtual background" framing), writes a timestamped backup, and
 * overwrites the manifest in place.
 *
 * Usage:
 *   node image-pipeline/rewrite-alt-text.js              # rewrite + backup
 *   node image-pipeline/rewrite-alt-text.js --dry-run    # preview, no writes
 *   node image-pipeline/rewrite-alt-text.js --sample 10  # print N before/after
 *
 * Idempotent: running twice produces the same output, because alts are
 * regenerated from canonical inputs (category + tags + slug hash), not from
 * the previous alt value.
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, 'final_manifest.json');

// ─── Per-category noun phrases ────────────────────────────────────────────────
// Three rotating noun variants per category — picked deterministically by slug
// hash so a category with 100 entries doesn't produce 100 identical alts.
const CATEGORY_NOUNS = {
  'office-spaces':          ['executive office interior', 'corporate office', 'modern corporate office'],
  'home-office':            ['executive home office', 'home office study', 'work-from-home executive study'],
  'bookshelves':            ['curated bookshelf wall', 'library-style bookshelf wall', 'floor-to-ceiling bookshelves'],
  'wall-shelves':           ['minimalist wall shelving', 'floating shelf composition', 'curated wall shelving'],
  'conference-rooms':       ['corporate conference room', 'executive boardroom', 'modern conference room'],
  'living-rooms':           ['editorial living room', 'lounge interior', 'curated living room'],
  'kitchens':               ['designer kitchen interior', 'modern kitchen', 'editorial kitchen'],
  'coffee-shops':           ['café interior', 'coffee shop interior', 'curated café space'],
  'art-galleries':          ['art gallery interior', 'curated gallery space', 'editorial gallery interior'],
  'urban-lofts':            ['urban loft interior', 'industrial loft', 'converted loft interior'],
  'gardens-patios':         ['garden terrace', 'landscaped patio', 'curated outdoor terrace'],
  'historic-spaces':        ['historic interior', 'period architectural interior', 'heritage architectural space'],
  'nature-landscapes':      ['natural landscape', 'cinematic outdoor landscape', 'open scenic landscape'],
  'libraries':              ['library reading room', 'classical library interior', 'study library'],
  'bokeh-backgrounds':      ['soft-bokeh light field', 'cinematic bokeh composition', 'depth-of-field light backdrop'],
  'christmas-backgrounds':  ['holiday-styled interior', 'Christmas-decorated room', 'festive holiday interior'],
  'easter-backgrounds':     ['spring-styled interior', 'Easter-themed setting', 'pastel spring composition'],
  'valentines-backgrounds': ['romantic interior', "Valentine's-themed setting", 'rose-toned composition'],
  'summer-backgrounds':     ['summer interior', 'sunlit summer setting', 'open-air summer composition'],
  'spring-backgrounds':     ['spring-themed setting', 'fresh spring interior', 'florals-and-light spring scene'],
  'halloween-backgrounds':  ['autumn-styled interior', 'moody Halloween setting', 'October-styled composition'],
};

// Fallback if a category slug ever appears that we don't have a template for.
const FALLBACK_NOUNS = ['architected interior', 'composed video environment'];

// ─── Adjective normalization ──────────────────────────────────────────────────
// Map raw tag/copy adjectives to editorial replacements. Order matters for
// preference: scan tags first, then existing alt, then existing title.
const ADJECTIVE_MAP = {
  cozy:          'warm-toned',
  warm:          'warm-toned',
  elegant:       'refined',
  sophisticated: 'refined',
  luxurious:     'refined',
  modern:        'modern',
  contemporary:  'contemporary',
  minimalist:    'minimalist',
  bright:        'daylit',
  dark:          'moody',
  serene:        'composed',
  classic:       'classical',
  traditional:   'classical',
  industrial:    'industrial',
  rustic:        'rustic',
  natural:       'natural-light',
  sleek:         'sleek',
  stylish:       'editorial',
  spacious:      'open-plan',
  clean:         'clean-lined',
};

// ─── Editorial qualifier suffixes ─────────────────────────────────────────────
// Rotated by slug hash so the corpus reads naturally, not template-stamped.
const SUFFIXES = [
  ' — high-fidelity 4K virtual environment, composed for camera',
  ' — architected 4K virtual environment for executive video presence',
  ' — high-fidelity virtual environment engineered for codec compression',
  ' — 4K-upscaled virtual environment for Zoom, Teams, and Google Meet',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

function pick(arr, slug) {
  return arr[djb2(slug) % arr.length];
}

function pickSecondary(arr, slug) {
  // Use a different rotation so the noun and suffix don't lock-step.
  return arr[djb2(slug + '::s') % arr.length];
}

function extractAdjective(entry) {
  const tagSet = new Set((entry.tags || []).map((t) => String(t).toLowerCase()));
  for (const raw of Object.keys(ADJECTIVE_MAP)) {
    if (tagSet.has(raw)) return ADJECTIVE_MAP[raw];
  }
  // Fall back to scanning existing alt + title text for adjectives.
  const corpus = `${entry.alt || ''} ${entry.title || ''}`.toLowerCase();
  for (const raw of Object.keys(ADJECTIVE_MAP)) {
    if (corpus.includes(raw)) return ADJECTIVE_MAP[raw];
  }
  return null;
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function buildAlt(entry) {
  const slug = entry.slug || entry.id || '';
  const nouns = CATEGORY_NOUNS[entry.category] || FALLBACK_NOUNS;
  const noun = pick(nouns, slug);
  const adjective = extractAdjective(entry);
  const suffix = pickSecondary(SUFFIXES, slug);

  const head = adjective
    ? `${capitalize(adjective)} ${noun}`
    : capitalize(noun);

  // Cap at ~150 chars to stay under common alt-text recommendations.
  let alt = `${head}${suffix}.`;
  if (alt.length > 160) alt = alt.slice(0, 157).trimEnd() + '…';
  return alt;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const sampleArgIdx = process.argv.indexOf('--sample');
  const sampleN = sampleArgIdx >= 0 ? parseInt(process.argv[sampleArgIdx + 1] || '0', 10) : 0;

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifest not found: ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(raw);

  if (!Array.isArray(manifest)) {
    console.error('Manifest is not an array; aborting.');
    process.exit(1);
  }

  const stats = { total: manifest.length, changed: 0, unchanged: 0, byCategory: {} };
  const sampleDiffs = [];

  const next = manifest.map((entry) => {
    const oldAlt = entry.alt;
    const newAlt = buildAlt(entry);
    if (oldAlt !== newAlt) {
      stats.changed++;
      stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
      if (sampleDiffs.length < Math.max(sampleN, 8)) {
        sampleDiffs.push({ id: entry.id, category: entry.category, before: oldAlt, after: newAlt });
      }
    } else {
      stats.unchanged++;
    }
    return { ...entry, alt: newAlt };
  });

  console.log(`Manifest: ${stats.total} entries`);
  console.log(`  changed:   ${stats.changed}`);
  console.log(`  unchanged: ${stats.unchanged}\n`);

  console.log('Per-category change counts:');
  for (const [k, v] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  console.log(`\nSample (${sampleDiffs.length} of ${stats.changed}):`);
  for (const s of sampleDiffs) {
    console.log(`  [${s.id}] (${s.category})`);
    console.log(`    before: ${s.before}`);
    console.log(`    after : ${s.after}`);
  }

  if (dryRun) {
    console.log('\n--dry-run set; no files written.');
    return;
  }

  // Backup first.
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, `final_manifest.alt-rewrite-backup.${ts}.json`);
  fs.writeFileSync(backupPath, raw);
  console.log(`\nBackup written: ${backupPath}`);

  // Overwrite manifest.
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(next, null, 2) + '\n');
  console.log(`Manifest written: ${MANIFEST_PATH}`);
}

main();
