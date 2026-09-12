#!/usr/bin/env node
/**
 * Slug-preserving recategorization.
 *
 * For every entry whose vision TITLE clearly indicates a different category
 * than its catalog slot, move it: update final_manifest.category/folder,
 * move the line between IMAGES_X arrays in data/categoryData.js, recompute
 * counts in lib/categories-config.js, and copy the webp to the new R2 folder
 * (old location stays put — CDN cache + passive 301 source).
 *
 * SLUGS NEVER CHANGE. PNG (root) and HD (S3) keys are slug-based, so they're
 * unaffected by moves.
 *
 * Title-strict filter: a move is allowed only when the suggested category's
 * fingerprint keyword appears in the VISION TITLE itself (not just desc/tags).
 * This kills false positives like urban-loft-29 ("palm tree" in tag, but title
 * says "Modern Concrete Boardroom" — won't be moved to summer).
 *
 * Usage:
 *   node image-pipeline/recategorize.js --dry-run   # show plan, no writes
 *   node image-pipeline/recategorize.js             # execute (also copies R2)
 *
 * Explicit, human-directed moves (bypasses the audit + title-strict filter —
 * a reviewer looked at the images and decided; see CLAUDE.md: the pipeline's
 * call is raised to the human, and this is how their decision is applied):
 *   node image-pipeline/recategorize.js --moves-file moves.txt --dry-run
 *   node image-pipeline/recategorize.js --moves-file moves.txt
 * where moves.txt is one `slug,new-category` per line (# comments allowed).
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { S3Client, CopyObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FM_PATH = path.join(__dirname, 'final_manifest.json');
const VIS_PATH = path.join(__dirname, 'ai_metadata.vision-v1.json');
const CD_PATH = path.join(ROOT, 'data/categoryData.js');
const CC_PATH = path.join(ROOT, 'lib/categories-config.js');

const DRY_RUN = process.argv.includes('--dry-run');
const mfIdx = process.argv.indexOf('--moves-file');
const MOVES_FILE = mfIdx >= 0 ? process.argv[mfIdx + 1] : null;
const TS = new Date().toISOString().replace(/[:.]/g, '-');

// Category → default folder. For bookshelves/wall-shelves, incoming entries
// default to the *-bright sub-folder (visually most common).
const CATEGORY_TO_FOLDER = {
  'bookshelves': 'bookshelves-bright',
  'wall-shelves': 'wall-shelves-bright',
  'office-spaces': 'office-spaces',
  'home-office': 'home-office',
  'neutral-backgrounds': 'neutral-backgrounds',
  'living-rooms': 'living-rooms',
  'kitchens': 'kitchens',
  'coffee-shops': 'coffee-shops',
  'art-galleries': 'art-galleries',
  'urban-lofts': 'urban-lofts',
  'gardens-patios': 'gardens-patios',
  'historic-spaces': 'historic-spaces',
  'nature-landscapes': 'nature-landscapes',
  'libraries': 'libraries',
  'conference-rooms': 'conference-rooms',
  'christmas-backgrounds': 'christmas-backgrounds',
  'halloween-backgrounds': 'halloween-backgrounds',
  'valentines-backgrounds': 'valentines-backgrounds',
  'easter-backgrounds': 'easter-backgrounds',
  'spring-backgrounds': 'spring-backgrounds',
  'summer-backgrounds': 'summer-backgrounds',
  'bokeh-backgrounds': 'bokeh-backgrounds',
};

// Category → IMAGES_X array name in data/categoryData.js
const CATEGORY_TO_ARRAY = {
  'bookshelves': 'IMAGES_BOOKSHELVES_BRIGHT', // default for incoming
  'wall-shelves': 'IMAGES_WALL_SHELVES_BRIGHT',
  'office-spaces': 'IMAGES_OFFICE_SPACES',
  'home-office': 'IMAGES_HOME_OFFICE',
  'neutral-backgrounds': 'IMAGES_NEUTRAL_BACKGROUNDS',
  'living-rooms': 'IMAGES_LIVING_ROOMS',
  'kitchens': 'IMAGES_KITCHENS',
  'coffee-shops': 'IMAGES_COFFEE_SHOPS',
  'art-galleries': 'IMAGES_ART_GALLERIES',
  'urban-lofts': 'IMAGES_URBAN_LOFTS',
  'gardens-patios': 'IMAGES_GARDENS_PATIOS',
  'historic-spaces': 'IMAGES_HISTORIC_SPACES',
  'nature-landscapes': 'IMAGES_NATURE_LANDSCAPES',
  'libraries': 'IMAGES_LIBRARIES',
  'conference-rooms': 'IMAGES_CONFERENCE_ROOMS',
  'christmas-backgrounds': 'IMAGES_CHRISTMAS_BACKGROUNDS',
  'halloween-backgrounds': 'IMAGES_HALLOWEEN_BACKGROUNDS',
  'valentines-backgrounds': 'IMAGES_VALENTINES_BACKGROUNDS',
  'easter-backgrounds': 'IMAGES_EASTER_BACKGROUNDS',
  'spring-backgrounds': 'IMAGES_SPRING_BACKGROUNDS',
  'summer-backgrounds': 'IMAGES_SUMMER_BACKGROUNDS',
  'bokeh-backgrounds': 'IMAGES_BOKEH_BACKGROUNDS',
};

// Fingerprint keywords per category — must be findable in the vision TITLE
// for a move to qualify (title-strict mode).
const TITLE_FINGERPRINT = {
  'office-spaces':        ['office', 'workspace', 'workstation', 'cubicle'],
  'home-office':          ['home office', 'study'],
  'bookshelves':          ['bookshelf', 'bookshelves', 'bookcase'],
  'wall-shelves':         ['wall shelf', 'wall shelves', 'floating shelf', 'display shelf'],
  'conference-rooms':     ['boardroom', 'conference', 'meeting room'],
  'neutral-backgrounds':  ['plain wall', 'blank wall', 'bare wall', 'neutral wall', 'minimalist wall', 'empty wall', 'plaster wall'],
  'living-rooms':         ['living room', 'lounge', 'sofa', 'sitting area'],
  'kitchens':             ['kitchen', 'countertop'],
  'coffee-shops':         ['café', 'cafe', 'coffee shop', 'espresso'],
  'art-galleries':        ['gallery', 'art gallery', 'exhibition', 'museum'],
  'urban-lofts':          ['loft', 'industrial loft', 'exposed brick'],
  'gardens-patios':       ['garden', 'patio', 'terrace', 'courtyard'],
  'historic-spaces':      ['historic', 'heritage', 'period', 'vaulted', 'columned', 'archway'],
  'nature-landscapes':    ['landscape', 'mountain', 'forest', 'meadow', 'wilderness', 'scenic', 'horizon', 'lake', 'river'],
  'libraries':            ['library', 'reading room', 'archive'],
  'bokeh-backgrounds':    ['bokeh', 'depth of field', 'blurred lights'],
  'christmas-backgrounds': ['christmas', 'wreath', 'garland', 'stocking', 'christmas tree'],
  'easter-backgrounds':   ['easter', 'bunny', 'bunnies', 'rabbit', 'tulip', 'tulips', 'lily', 'lilies', 'pastel egg'],
  'valentines-backgrounds': ['valentine', "valentine's", 'romantic', 'heart', 'hearts', 'cupid'],
  'summer-backgrounds':   ['beach', 'beachfront', 'beachside', 'poolside', 'cabana', 'tropical', 'coastal', 'seaside'],
  'spring-backgrounds':   ['spring', 'cherry blossom', 'daffodil', 'sunroom'],
  'halloween-backgrounds': ['halloween', 'pumpkin', 'jack-o-lantern', 'spooky'],
};

function hasTitleMatch(title, category) {
  const fp = TITLE_FINGERPRINT[category] || [];
  const lower = (title || '').toLowerCase();
  return fp.some(kw => new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(lower));
}

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

async function r2Copy(srcKey, dstKey) {
  if (DRY_RUN) return true;
  await R2.send(new CopyObjectCommand({
    Bucket: process.env.R2_BUCKET,
    CopySource: encodeURIComponent(process.env.R2_BUCKET + '/' + srcKey),
    Key: dstKey,
    MetadataDirective: 'COPY',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return true;
}

async function main() {
  const fm = JSON.parse(fs.readFileSync(FM_PATH, 'utf8'));

  const moves = [];

  if (MOVES_FILE) {
    // ── Explicit mode ──────────────────────────────────────────────────────
    // A human reviewed the images and chose these destinations. No heuristic
    // filter applies; we only validate that the slug and category are real.
    const fmMap = Object.fromEntries(fm.map(e => [e.slug, e]));
    const lines = fs.readFileSync(MOVES_FILE, 'utf8').split('\n')
      .map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const problems = [];
    for (const line of lines) {
      const [slug, newCategory] = line.split(',').map(x => (x || '').trim());
      if (!slug || !newCategory) { problems.push(`malformed line: ${line}`); continue; }
      const e = fmMap[slug];
      if (!e) { problems.push(`slug not in manifest: ${slug}`); continue; }
      if (!CATEGORY_TO_FOLDER[newCategory]) { problems.push(`unknown category: ${newCategory}`); continue; }
      if (!CATEGORY_TO_ARRAY[newCategory]) { problems.push(`no categoryData array for: ${newCategory}`); continue; }
      if (!CATEGORY_TO_ARRAY[e.category]) { problems.push(`no categoryData array for source: ${e.category} (${slug})`); continue; }
      if (e.category === newCategory) { problems.push(`already in ${newCategory}: ${slug}`); continue; }
      moves.push({
        slug,
        oldCategory: e.category,
        oldFolder: e.folder,
        newCategory,
        newFolder: CATEGORY_TO_FOLDER[newCategory],
        title: e.title,
        filename: e.image_webp,
      });
    }
    if (problems.length) {
      console.error(`\n✗ ${problems.length} problem(s) in ${MOVES_FILE} — nothing written:`);
      problems.forEach(p => console.error(`    ${p}`));
      process.exit(1);
    }
    console.log(`▶  Move plan (explicit, --moves-file ${MOVES_FILE})`);
    console.log(`  moves requested  : ${lines.length}`);
    console.log(`  all validated    : ${moves.length}`);
    console.log();
    for (const m of moves) {
      console.log(`    ${m.oldCategory.padEnd(22)} → ${m.newCategory}   ${(m.title || '').replace(' | MeetBackdrops', '')}`);
    }
    console.log();
  } else {

  const vis = JSON.parse(fs.readFileSync(VIS_PATH, 'utf8'));
  const audit = JSON.parse(fs.readFileSync(path.join(__dirname, 'category-audit-report.json'), 'utf8'));

  // Build move list with TITLE-STRICT filter
  for (const r of audit) {
    if (!r.mismatch) continue;
    const v = vis[r.slug];
    if (!v) continue;
    if (!hasTitleMatch(v.title, r.visionSuggested)) continue;
    // Additionally: skip if title ALSO matches the CURRENT category (ambiguous)
    if (hasTitleMatch(v.title, r.catalogCategory)) continue;

    const fmEntry = fm.find(e => e.slug === r.slug);
    if (!fmEntry) continue;

    moves.push({
      slug: r.slug,
      oldCategory: fmEntry.category,
      oldFolder: fmEntry.folder,
      newCategory: r.visionSuggested,
      newFolder: CATEGORY_TO_FOLDER[r.visionSuggested],
      title: v.title,
      filename: fmEntry.image_webp,
    });
  }

  console.log(`▶  Move plan (title-strict filter)`);
  console.log(`  total candidates : ${audit.filter(r => r.mismatch).length}`);
  console.log(`  passing filter   : ${moves.length}`);
  console.log();
  }

  if (!moves.length) { console.log('Nothing to move.'); return; }

  // Group by destination
  const byNew = {};
  for (const m of moves) {
    if (!byNew[m.newCategory]) byNew[m.newCategory] = [];
    byNew[m.newCategory].push(m);
  }
  console.log(`  Destination breakdown:`);
  for (const [cat, arr] of Object.entries(byNew).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`    + ${cat.padEnd(28)} ${arr.length} incoming`);
  }
  console.log();

  // Count net effect
  const oldCounts = {}, newCounts = {};
  for (const e of fm) { oldCounts[e.category] = (oldCounts[e.category] || 0) + 1; }
  // simulate
  const sim = fm.map(e => ({ ...e }));
  for (const m of moves) {
    const e = sim.find(x => x.slug === m.slug);
    e.category = m.newCategory; e.folder = m.newFolder;
  }
  for (const e of sim) { newCounts[e.category] = (newCounts[e.category] || 0) + 1; }

  console.log(`  Net category-count changes:`);
  const allCats = new Set([...Object.keys(oldCounts), ...Object.keys(newCounts)]);
  for (const c of [...allCats].sort()) {
    const a = oldCounts[c] || 0;
    const b = newCounts[c] || 0;
    const delta = b - a;
    if (delta !== 0) console.log(`    ${c.padEnd(28)} ${String(a).padStart(4)} → ${String(b).padStart(4)}  (${delta > 0 ? '+' : ''}${delta})`);
  }
  console.log();

  if (DRY_RUN) {
    console.log(`🧪 DRY RUN — no changes written.`);
    return;
  }

  // ── Apply ────────────────────────────────────────────────────────────────
  fs.copyFileSync(FM_PATH, FM_PATH + `.recategorize-backup.${TS}.json`);
  fs.copyFileSync(CD_PATH, CD_PATH + `.recategorize-backup.${TS}`);
  fs.copyFileSync(CC_PATH, CC_PATH + `.recategorize-backup.${TS}`);
  console.log(`✓ backed up 3 files (${TS})\n`);

  // 1. Update final_manifest.json (category + folder per moved entry)
  const fmMap = Object.fromEntries(fm.map(e => [e.slug, e]));
  for (const m of moves) {
    fmMap[m.slug].category = m.newCategory;
    fmMap[m.slug].folder = m.newFolder;
  }
  fs.writeFileSync(FM_PATH, JSON.stringify(fm, null, 2));
  console.log(`✓ updated final_manifest.json (${moves.length} entries)`);

  // 2. Move lines between IMAGES_X arrays in data/categoryData.js
  let cdSrc = fs.readFileSync(CD_PATH, 'utf8');
  let cdMoved = 0;
  for (const m of moves) {
    const oldArr = CATEGORY_TO_ARRAY[m.oldCategory];
    const newArr = CATEGORY_TO_ARRAY[m.newCategory];
    if (!oldArr || !newArr) continue;
    // Match the entry line tolerantly
    const lineRe = new RegExp(`(\\n\\s*\\{\\s*filename:\\s*['"]${m.slug}\\.webp['"]\\s*,[^}]*\\}\\s*,?)`, 'g');
    const match = lineRe.exec(cdSrc);
    if (!match) continue;
    const entryLine = match[1].trim().replace(/,$/, '') + ',';
    // Remove from current location
    cdSrc = cdSrc.replace(lineRe, '');
    // Insert into destination array (just before the closing bracket)
    const insertRe = new RegExp(`(const ${newArr}\\s*=\\s*\\[[\\s\\S]*?)(\\n\\];)`);
    cdSrc = cdSrc.replace(insertRe, `$1\n  ${entryLine}$2`);
    cdMoved++;
  }
  fs.writeFileSync(CD_PATH, cdSrc);
  console.log(`✓ moved ${cdMoved}/${moves.length} entries in data/categoryData.js`);

  // 3. Update counts in lib/categories-config.js
  // Delegate to sync-counts.js, which recomputes EVERY count and TOTAL_IMAGES
  // from the manifest. A previous hand-rolled regex here silently failed to
  // decrement source categories (it matched on the old value, which is brittle
  // against formatting), leaving config counts drifted from the manifest.
  // CLAUDE.md: counts are derived from the manifest, never bumped by hand.
  execFileSync(process.execPath, [path.join(__dirname, 'sync-counts.js')], { stdio: 'inherit' });

  // 4. R2: copy webps to new folders
  console.log(`\n▶  Copying webps to new R2 folders...`);
  let copied = 0, skipped = 0, failed = 0;
  for (const m of moves) {
    const srcKey = `webp/${m.oldFolder}/${m.filename}`;
    const dstKey = `webp/${m.newFolder}/${m.filename}`;
    if (srcKey === dstKey) { skipped++; continue; }
    try {
      await r2Copy(srcKey, dstKey);
      copied++;
      if (copied % 20 === 0) process.stdout.write(`  ${copied}...`);
    } catch (e) {
      failed++;
      console.log(`\n  ✗ ${srcKey} → ${dstKey}: ${e.message}`);
    }
  }
  console.log(`\n✓ R2 copies: ${copied} done, ${skipped} skipped, ${failed} failed`);

  console.log(`\n✅ RECATEGORIZATION COMPLETE`);
  console.log(`   Backups: ${TS}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
