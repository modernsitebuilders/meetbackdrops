#!/usr/bin/env node
/**
 * Category mismatch audit.
 *
 * Compares each image's vision-derived title/desc/tags to a per-category
 * keyword fingerprint, scores all 21 categories, and flags entries where
 * the top-scoring category != the catalog category.
 *
 * Output:
 *   image-pipeline/category-audit-report.json   — full per-entry scores
 *   stdout — summary table + the strongest mismatches for human review
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, 'final_manifest.json');
const VISION_PATH = path.join(__dirname, 'ai_metadata.vision-v1.json');
const REPORT_PATH = path.join(__dirname, 'category-audit-report.json');

// Per-category fingerprint keywords. Hit = +1 to that category's score.
// These are designed for HIGH precision; weakly-shared words ("light",
// "modern") are intentionally excluded so the dominant winner is meaningful.
const FINGERPRINTS = {
  'office-spaces':        ['office', 'desk', 'workspace', 'workstation', 'cubicle', 'open office', 'office space'],
  'home-office':          ['home office', 'home-office', 'study', 'workspace', 'desk', 'home study'],
  'bookshelves':          ['bookshelf', 'bookshelves', 'bookcase', 'book stack', 'books'],
  'wall-shelves':         ['wall shelf', 'wall shelves', 'floating shelf', 'display shelf', 'shelving'],
  'conference-rooms':     ['boardroom', 'conference', 'conference room', 'meeting room', 'meeting table'],
  'living-rooms':         ['living room', 'lounge', 'sofa', 'couch', 'sitting area', 'living space'],
  'kitchens':             ['kitchen', 'kitchen counter', 'kitchen island', 'cooktop', 'stove', 'countertop'],
  'coffee-shops':         ['café', 'cafe', 'coffee shop', 'coffee', 'espresso', 'barista'],
  'art-galleries':        ['gallery', 'art gallery', 'framed art', 'artwork', 'exhibition', 'museum'],
  'urban-lofts':          ['loft', 'industrial loft', 'urban loft', 'exposed brick', 'industrial'],
  'gardens-patios':       ['garden', 'patio', 'terrace', 'courtyard', 'outdoor seating', 'outdoor patio'],
  'historic-spaces':      ['historic', 'heritage', 'period', 'vaulted', 'columned', 'archway', 'classical architecture'],
  'nature-landscapes':    ['landscape', 'mountain', 'forest', 'meadow', 'wilderness', 'scenic', 'horizon', 'lake', 'river'],
  'libraries':            ['library', 'reading room', 'reading nook', 'study', 'archive'],
  'bokeh-backgrounds':    ['bokeh', 'depth of field', 'blurred lights', 'light field'],
  'christmas-backgrounds': ['christmas', 'holiday', 'festive', 'ornament', 'christmas tree', 'tinsel', 'wreath', 'garland', 'stocking'],
  'easter-backgrounds':   ['easter', 'pastel decor', 'egg', 'eggs', 'bunny', 'bunnies', 'rabbit', 'tulip', 'tulips', 'lily', 'lilies', 'cross', 'lamb', 'pastel', 'floral arrangement', 'decorative bunnies', 'colorful eggs'],
  'valentines-backgrounds': ['valentine', 'valentines', "valentine's", 'romantic', 'heart', 'hearts', 'rose decor', 'roses', 'cupid', 'love'],
  'summer-backgrounds':   ['beach', 'beachside', 'poolside', 'pool', 'cabana', 'tropical', 'palm', 'palm tree', 'seaside', 'coastal', 'bougainvillea', 'sunlit summer', 'sandy', 'ocean', 'lounge chair', 'patio summer'],
  'spring-backgrounds':   ['spring', 'fresh blooms', 'cherry blossom', 'cherry blossoms', 'daffodil', 'daisy', 'sunroom', 'spring flowers'],
  'halloween-backgrounds': ['halloween', 'pumpkin', 'pumpkins', 'spooky', 'jack-o-lantern', 'autumn decor', 'spider', 'witch', 'haunted', 'gothic'],
};

function scoreText(text, keywords) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    // word-boundary-ish match
    const re = new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    if (re.test(lower)) score += 1;
  }
  return score;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const vision = JSON.parse(fs.readFileSync(VISION_PATH, 'utf8'));

  const report = [];
  for (const entry of manifest) {
    const v = vision[entry.slug];
    if (!v) continue;
    const text = `${v.title || ''} ${v.description || ''} ${v.alt || ''} ${(v.tags || []).join(' ')}`;

    const scores = {};
    for (const [cat, kws] of Object.entries(FINGERPRINTS)) {
      scores[cat] = scoreText(text, kws);
    }

    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topCat = ranked[0][0];
    const topScore = ranked[0][1];
    const ownScore = scores[entry.category] || 0;
    const isMismatch = topScore > 0 && topCat !== entry.category && (topScore - ownScore) >= 2;

    report.push({
      slug: entry.slug,
      catalogCategory: entry.category,
      visionSuggested: topCat,
      catalogScore: ownScore,
      suggestedScore: topScore,
      mismatch: isMismatch,
      visionTitle: v.title,
    });
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  // Summary
  const mismatches = report.filter(r => r.mismatch);
  const byCat = {};
  for (const r of mismatches) {
    const k = r.catalogCategory;
    if (!byCat[k]) byCat[k] = { total: 0, suggested: {} };
    byCat[k].total++;
    byCat[k].suggested[r.visionSuggested] = (byCat[k].suggested[r.visionSuggested] || 0) + 1;
  }

  console.log(`━━━━━ CATEGORY MISMATCH AUDIT ━━━━━`);
  console.log(`Total entries audited: ${report.length}`);
  console.log(`Mismatches flagged: ${mismatches.length} (${(mismatches.length / report.length * 100).toFixed(1)}%)`);
  console.log();
  console.log(`Mismatches by catalog category (sorted by impact):`);
  console.log();
  const catSorted = Object.entries(byCat).sort((a, b) => b[1].total - a[1].total);
  for (const [cat, info] of catSorted) {
    const sugg = Object.entries(info.suggested).sort((a, b) => b[1] - a[1])
      .map(([c, n]) => `${c}(${n})`).join(', ');
    console.log(`  ${cat.padEnd(28)} ${String(info.total).padStart(4)}  →  ${sugg}`);
  }

  console.log();
  console.log(`━━━━━ TOP 20 STRONGEST MISMATCHES (high confidence) ━━━━━`);
  const strong = mismatches
    .map(r => ({ ...r, delta: r.suggestedScore - r.catalogScore }))
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 20);
  for (const r of strong) {
    console.log(`  ${r.slug.padEnd(28)} [${r.catalogCategory}] → [${r.visionSuggested}]  (${r.catalogScore} vs ${r.suggestedScore})`);
    console.log(`    "${r.visionTitle}"`);
  }
  console.log();
  console.log(`Full report: ${REPORT_PATH}`);
}

main();
