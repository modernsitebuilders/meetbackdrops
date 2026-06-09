#!/usr/bin/env node
// ============================================================================
// sweep-legacy-refs.js
// ----------------------------------------------------------------------------
// One-off follow-up to Wave 2. The original Wave 2 sweep covered only a
// handful of in-repo files (manifest, categoryData, products, blogMetadata
// OG URLs, lib/seo, [slug]/index hub array). Many other files still hold
// legacy `{category}-NN` slugs/filenames: hero images, blog post `image:`
// URLs, free-sample IDs, related-category thumbnails, etc.
//
// This script rewrites every active-code reference using
// slug-migration-map.json as the source of truth. For three slugs that are
// NOT in the migration map (their original images were deleted from the
// catalog), it falls back to hand-picked canonical replacements.
//
// Operates on a fixed allowlist of files (no broad scan). Backs up each
// file before touching it. Idempotent: only writes when content changes.
//
// Usage:
//   node image-pipeline/sweep-legacy-refs.js --dry-run
//   node image-pipeline/sweep-legacy-refs.js
// ============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAP_PATH = path.join(ROOT, 'image-pipeline', 'slug-migration-map.json');
const DRY_RUN = process.argv.includes('--dry-run');

// Files that legitimately reference image slugs/filenames in active code.
// Scripts and `data/blog-content/*.js` are included because they bake their
// values into the production build.
const TARGETS = [
  'pages/image-lookup.js',
  'pages/hd.js',
  'pages/free-sample.js',
  'lib/freeSamples.js',
  'lib/seo/seo.js',
  'components/HDComparisonHero.js',
  'components/BlogHDUpsellCard.js',
  'components/CategoryHub/HubRelatedCategories.js',
  'components/RelatedCategories.js',
  'components/CategoryGrid.js',
  'data/blogPosts.js',
  'data/heroImages.js',
  'data/blogMetadata.js',
  'data/blog-content/hd-virtual-backgrounds.js',
  'data/blog-content/easter-backgrounds.js',
  'data/blog-content/job-interview-backgrounds.js',
  'data/blog-content/christmas-backgrounds.js',
  'data/blog-content/spring-backgrounds.js',
  'scripts/generate-tailwind-12.js',
  'scripts/extract-bundle-images.js',
];

// Three slugs whose source images were dropped between Wave 2 and now.
// Each one is mapped to a hand-picked canonical entry from the same folder
// (verified to exist in the current manifest). The new slug doubles as the
// PNG/webp stem.
const MANUAL_FALLBACKS = {
  'easter-background-01': {
    folder: 'easter-backgrounds',
    newSlug: 'three-shelves-display-pastel-vases-tulips-white-bunny-basket-f7f6f9bc',
  },
  'nature-landscape-01': {
    folder: 'nature-landscapes',
    newSlug: 'wooden-deck-overlooking-mountain-range-trees-bathed-soft-e2f38223',
  },
  'office-spaces-07': {
    folder: 'office-spaces',
    newSlug: 'bright-office-space-white-desk-pastel-file-organizers-potted-c4099bfc',
  },
};

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

// ─── Build replacement table ────────────────────────────────────────────────
const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8')).entries;

// Replacements: each entry is { oldSlug, oldWebp, oldPng, newSlug, newWebp, newPng, folder }
const subs = [];
for (const e of Object.values(map)) {
  subs.push({
    oldSlug: e.oldSlug,
    oldWebp: e.oldWebp,
    oldPng: e.oldPng,
    newSlug: e.newSlug,
    newWebp: e.newWebp,
    newPng: e.newPng,
    folder: e.folder,
  });
}
for (const [oldSlug, fb] of Object.entries(MANUAL_FALLBACKS)) {
  subs.push({
    oldSlug,
    oldWebp: `${oldSlug}.webp`,
    oldPng: `${oldSlug}.png`,
    newSlug: fb.newSlug,
    newWebp: `${fb.newSlug}.webp`,
    newPng: `${fb.newSlug}.png`,
    folder: fb.folder,
  });
}

// Index for fast lookup by old stem.
const bySlug = new Map();
for (const s of subs) bySlug.set(s.oldSlug, s);

// ─── Per-file sweep ─────────────────────────────────────────────────────────
function sweepFile(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) {
    console.log(`  SKIP missing: ${relPath}`);
    return { changed: false, hits: 0 };
  }
  const orig = fs.readFileSync(abs, 'utf8');
  let out = orig;
  let hits = 0;

  // Pattern recognizes any legacy stem followed by .webp, .png, end-of-token,
  // or a path/quote boundary. The look-ahead `(?![0-9a-f-])` prevents matching
  // tails of new-format hashes that happen to be all digits.
  const re = /(urban-loft|easter-background|home-offices|nature-landscape|spring-background|bookshelves-(?:bright|dark)|wall-shelves-(?:bright|dark)|office-spaces|christmas-background|art-gallery|libraries|coffee-shops|conference-rooms|urban-lofts|kitchens|living-rooms|gardens-patios|summer-backgrounds|home-office)-(\d{1,3})(?![0-9a-f-])/g;

  out = out.replace(re, (match) => {
    const sub = bySlug.get(match);
    if (!sub) return match;
    hits++;
    return sub.newSlug;
  });

  if (out === orig) return { changed: false, hits: 0 };

  if (DRY_RUN) {
    console.log(`  [dry-run] would rewrite ${relPath}  (${hits} substitutions)`);
    return { changed: true, hits };
  }
  const bak = abs + `.legacy-sweep-backup.${ts()}`;
  fs.writeFileSync(bak, orig);
  fs.writeFileSync(abs, out);
  console.log(`  rewrote ${relPath}  (${hits} substitutions; backup: ${path.basename(bak)})`);
  return { changed: true, hits };
}

console.log(`[sweep] ${DRY_RUN ? 'DRY-RUN' : 'EXECUTE'}  ${subs.length} mappings loaded`);
let totalHits = 0, filesChanged = 0;
for (const t of TARGETS) {
  const r = sweepFile(t);
  totalHits += r.hits;
  if (r.changed) filesChanged++;
}
console.log(`\n[sweep] ${filesChanged} files changed, ${totalHits} substitutions${DRY_RUN ? ' (dry-run)' : ''}.`);
