#!/usr/bin/env node
/**
 * ⚠️  BRAND VOICE GUARDRAIL — READ BEFORE EDITING TEMPLATES BELOW
 *
 * StreamBackdrops is a Virtual Set Design Studio for CORPORATE / EXECUTIVE
 * video presence on Zoom, Teams, and Google Meet.
 *
 * It is NOT a gaming, streamer, Twitch, esports, or livestreamer brand —
 * and has never been one. The literal word "Stream" in the brand name is
 * a legacy company-name relic, NOT a positioning signal.
 *
 * When editing CATEGORY_NOUNS, DESCRIPTION_TEMPLATES, ADJECTIVE_MAP, or
 * ALT_SUFFIXES below, NEVER introduce any of:
 *   gamer / gamers / gaming / Twitch / streamer / streamers / livestreamer /
 *   esports / OBS overlay / stream overlay / gaming stream / gaming PC
 *
 * The approved vocabulary is: designed, studio-designed, high-fidelity,
 * 4K-upscaled, composed for camera, virtual background, virtual set,
 * studio-composed, codec compression, corporate, boardroom, executive.
 *
 * Avoid "architected" as a default verb — it's business-speak. Use
 * "designed" instead. "Engineered" is OK only when paired with a specific
 * technical claim (e.g. "engineered for codec compression").
 *
 * See CLAUDE.md (project root) → "BRAND VOICE — READ FIRST" section for
 * the full rule set, prohibited terms, and required substitutions.
 *
 * ──────────────────────────────────────────────────────────────────────
 *
 * One-shot rewrite of `alt`, `title`, and `description` in
 * image-pipeline/final_manifest.json — for the StreamBackdrops Studio
 * brand pivot.
 *
 * Supersedes rewrite-alt-text.js. The alt-text logic from that script is
 * preserved verbatim, so re-running this against an already-rewritten
 * manifest produces identical alts (idempotent).
 *
 * Usage:
 *   node image-pipeline/rewrite-manifest-copy.js                 # rewrite + backup
 *   node image-pipeline/rewrite-manifest-copy.js --dry-run       # preview, no writes
 *   node image-pipeline/rewrite-manifest-copy.js --sample 10     # print N before/after
 *   node image-pipeline/rewrite-manifest-copy.js --fields=title  # restrict to one or more fields
 *
 * Idempotency: regeneration is deterministic from canonical inputs
 * (category, slug, tags), never from previous values of the field — so
 * running twice gives the same output.
 *
 * Does NOT touch: id, slug, category, folder, image_webp, download_png,
 * tags, hdOnly, or any other field.
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, 'final_manifest.json');

// ─── Category display names (for titles per the user's pattern) ──────────────
const CATEGORY_DISPLAY = {
  'office-spaces':          'Office Spaces',
  'home-office':            'Home Office',
  'bookshelves':            'Bookshelves',
  'wall-shelves':           'Wall Shelves',
  'conference-rooms':       'Conference Rooms',
  'living-rooms':           'Living Rooms',
  'kitchens':               'Kitchens',
  'coffee-shops':           'Coffee Shops',
  'art-galleries':          'Art Galleries',
  'urban-lofts':            'Urban Lofts',
  'gardens-patios':         'Gardens & Patios',
  'historic-spaces':        'Historic Spaces',
  'nature-landscapes':      'Nature & Landscapes',
  'libraries':              'Libraries',
  'bokeh-backgrounds':      'Bokeh',
  'christmas-backgrounds':  'Christmas',
  'easter-backgrounds':     'Easter',
  'valentines-backgrounds': "Valentine's",
  'summer-backgrounds':     'Summer',
  'spring-backgrounds':     'Spring',
  'halloween-backgrounds':  'Halloween',
};

// ─── Per-category noun phrases (shared with alt + description) ───────────────
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

const FALLBACK_NOUNS = ['designed interior', 'composed video set'];

// ─── Adjective normalization (shared with alt) ───────────────────────────────
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

// ─── Alt suffix rotation ─────────────────────────────────────────────────────
const ALT_SUFFIXES = [
  ' — studio-designed 4K virtual background, composed for camera',
  ' — designed 4K virtual background for corporate video calls',
  ' — high-fidelity virtual background engineered for codec compression',
  ' — 4K-upscaled virtual background for Zoom, Teams, and Google Meet',
];

// ─── Description templates ───────────────────────────────────────────────────
// Each template is a function of {adj, noun} → string, ≤160 chars when filled.
// The corpus rotates by slug hash so 117 bookshelves entries don't all read the same.
//
// Char-budget rule of thumb: noun phrases here run 12–32 chars, adjectives 6–14
// chars. Templates below fit in 160 with the longest noun + adjective combo.
const DESCRIPTION_TEMPLATES = [
  ({ adj, noun }) =>
    `Upgrade your video calls with this studio-designed 4K ${noun}. Composed for camera, tuned for codec compression on Zoom, Teams, and Google Meet.`,
  ({ adj, noun }) =>
    `Designed 4K ${noun} engineered for codec compression. A high-fidelity virtual background for corporate Zoom, Teams, and Meet calls.`,
  ({ adj, noun }) =>
    `A high-fidelity, studio-designed ${noun} composed for camera. Professional-grade 4K virtual background for corporate video calls.`,
  ({ adj, noun }) =>
    `${capitalize(adj || 'Studio-designed')}, 4K-upscaled ${noun} from the StreamBackdrops Studio collection. A high-fidelity virtual background for Zoom, Teams, and Meet.`,
  ({ adj, noun }) =>
    `Studio-composed ${noun}, upscaled to 4K and tuned for video codec compression. A high-fidelity virtual background for corporate video calls.`,
];

const DESCRIPTION_MAX = 160;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

function pickByHash(arr, key) {
  return arr[djb2(key) % arr.length];
}

function extractAdjective(entry) {
  // Only scan `tags` — the stable canonical input. Scanning rewritten alt /
  // title would re-apply our own editorial replacements ("Editorial editorial
  // gallery..."), which would break idempotency.
  const tagSet = new Set((entry.tags || []).map((t) => String(t).toLowerCase()));
  for (const raw of Object.keys(ADJECTIVE_MAP)) {
    if (tagSet.has(raw)) return ADJECTIVE_MAP[raw];
  }
  return null;
}

// Avoid "Modern modern corporate office" when the noun phrase already
// contains the chosen adjective.
function adjectiveFitsNoun(adj, noun) {
  if (!adj) return false;
  return !noun.toLowerCase().includes(adj.toLowerCase());
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function prettifySlug(s) {
  return String(s)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Field builders ──────────────────────────────────────────────────────────
function buildAlt(entry) {
  const slug = entry.slug || entry.id || '';
  const nouns = CATEGORY_NOUNS[entry.category] || FALLBACK_NOUNS;
  const noun = pickByHash(nouns, slug);
  const adjective = extractAdjective(entry);
  const useAdj = adjectiveFitsNoun(adjective, noun);
  const suffix = pickByHash(ALT_SUFFIXES, slug + '::s');

  const head = useAdj ? `${capitalize(adjective)} ${noun}` : capitalize(noun);
  let alt = `${head}${suffix}.`;
  if (alt.length > 160) alt = alt.slice(0, 157).trimEnd() + '…';
  return alt;
}

function buildTitle(entry) {
  const display = CATEGORY_DISPLAY[entry.category] || prettifySlug(entry.category);
  return `${display} Virtual Backgrounds, Designed as Sets | StreamBackdrops Studio`;
}

function buildDescription(entry) {
  const slug = entry.slug || entry.id || '';
  const nouns = CATEGORY_NOUNS[entry.category] || FALLBACK_NOUNS;
  const noun = pickByHash(nouns, slug + '::n');
  const rawAdj = extractAdjective(entry);
  const adj = adjectiveFitsNoun(rawAdj, noun) ? rawAdj : null;
  const tmpl = pickByHash(DESCRIPTION_TEMPLATES, slug + '::d');
  let out = tmpl({ adj, noun });

  // Hard cap. Trim at last sentence boundary if possible, else hard-truncate.
  if (out.length > DESCRIPTION_MAX) {
    const lastPeriod = out.lastIndexOf('.', DESCRIPTION_MAX - 1);
    out = lastPeriod > 0
      ? out.slice(0, lastPeriod + 1)
      : out.slice(0, DESCRIPTION_MAX - 1).trimEnd() + '…';
  }
  return out;
}

// ─── Main ────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = { dryRun: false, sample: 0, fields: ['alt', 'title', 'description'] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') flags.dryRun = true;
    else if (a === '--sample') flags.sample = parseInt(args[++i] || '0', 10);
    else if (a.startsWith('--fields=')) {
      flags.fields = a.slice('--fields='.length).split(',').map((s) => s.trim()).filter(Boolean);
    } else if (a === '--fields') {
      flags.fields = (args[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return flags;
}

function main() {
  const flags = parseArgs(process.argv);
  const fieldSet = new Set(flags.fields);

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

  const stats = {
    total: manifest.length,
    perField: { alt: { changed: 0, unchanged: 0 }, title: { changed: 0, unchanged: 0 }, description: { changed: 0, unchanged: 0 } },
    descLengths: [],
    titleLengths: [],
    altLengths: [],
  };
  const sampleDiffs = [];

  const next = manifest.map((entry) => {
    const out = { ...entry };
    const diff = { id: entry.id, category: entry.category, fields: {} };
    let touched = false;

    if (fieldSet.has('alt')) {
      const v = buildAlt(entry);
      stats.altLengths.push(v.length);
      if (v !== entry.alt) {
        stats.perField.alt.changed++;
        diff.fields.alt = { before: entry.alt, after: v };
        touched = true;
      } else stats.perField.alt.unchanged++;
      out.alt = v;
    }

    if (fieldSet.has('title')) {
      const v = buildTitle(entry);
      stats.titleLengths.push(v.length);
      if (v !== entry.title) {
        stats.perField.title.changed++;
        diff.fields.title = { before: entry.title, after: v };
        touched = true;
      } else stats.perField.title.unchanged++;
      out.title = v;
    }

    if (fieldSet.has('description')) {
      const v = buildDescription(entry);
      stats.descLengths.push(v.length);
      if (v !== entry.description) {
        stats.perField.description.changed++;
        diff.fields.description = { before: entry.description, after: v };
        touched = true;
      } else stats.perField.description.unchanged++;
      out.description = v;
    }

    if (touched && sampleDiffs.length < Math.max(flags.sample, 8)) {
      sampleDiffs.push(diff);
    }
    return out;
  });

  console.log(`Manifest: ${stats.total} entries`);
  console.log(`Fields rewritten: ${[...fieldSet].join(', ')}\n`);

  for (const f of fieldSet) {
    const s = stats.perField[f];
    console.log(`  ${f}: changed=${s.changed} unchanged=${s.unchanged}`);
  }

  function lenStats(arr) {
    if (!arr.length) return null;
    return {
      min: Math.min(...arr),
      max: Math.max(...arr),
      mean: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
      over160: arr.filter((n) => n > 160).length,
    };
  }
  console.log('\nLengths:');
  if (fieldSet.has('alt')) console.log('  alt:        ', lenStats(stats.altLengths));
  if (fieldSet.has('title')) console.log('  title:      ', lenStats(stats.titleLengths));
  if (fieldSet.has('description')) console.log('  description:', lenStats(stats.descLengths));

  // Quality probes — make sure we didn't smuggle "Free" into the description.
  const freeInDesc = next.filter((x) => fieldSet.has('description') && /\bfree\b/i.test(x.description || '')).length;
  if (fieldSet.has('description')) {
    console.log(`\n"Free" still present in description: ${freeInDesc}`);
  }

  console.log(`\nSamples (${sampleDiffs.length}):`);
  for (const s of sampleDiffs) {
    console.log(`  [${s.id}] (${s.category})`);
    for (const [k, v] of Object.entries(s.fields)) {
      console.log(`    ${k}.before: ${v.before}`);
      console.log(`    ${k}.after : ${v.after}`);
    }
  }

  if (flags.dryRun) {
    console.log('\n--dry-run set; no files written.');
    return;
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, `final_manifest.copy-rewrite-backup.${ts}.json`);
  fs.writeFileSync(backupPath, raw);
  console.log(`\nBackup written: ${backupPath}`);

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(next, null, 2) + '\n');
  console.log(`Manifest written: ${MANIFEST_PATH}`);
}

main();
