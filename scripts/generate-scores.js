/**
 * scripts/generate-scores.js
 *
 * Regenerates public/data/image-scores-static.json from a Google Analytics CSV export.
 * Only counts downloads from RESET_DATE (Jan 25, 2026) onwards — all prior data is ignored.
 *
 * Usage:
 *   node scripts/generate-scores.js <path-to-analytics-csv>
 *
 * Example:
 *   node scripts/generate-scores.js ~/Downloads/stream-backdrops-analytics.csv
 *
 * After running, commit and push the updated file:
 *   git add public/data/image-scores-static.json && git commit -m "Update image scores" && git push
 */

const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { isDownloadEvent } = require('../lib/analyticsNormalize');

// ── Config ───────────────────────────────────────────────────────────────────
const RESET_DATE = new Date('2026-01-25T00:00:00Z');
const NOW        = new Date();

// Score formula (matches calculate-scores.js):
//   base 30 + downloads*10 − floor(months_since_last_dl)*5   (min 0)
function calcScore(downloadCount, lastDownload) {
  let score = 30 + downloadCount * 10;
  const ref = lastDownload || RESET_DATE;
  const monthsSince = (NOW - ref) / (1000 * 60 * 60 * 24 * 30);
  score -= Math.floor(monthsSince) * 5;
  return Math.max(0, score);
}

// Normalise filename: strip MeetBackdrops- or legacy StreamBackdrops- prefix,
// return base without extension
function baseName(raw) {
  if (!raw) return null;
  let f = raw.trim().replace(/^MeetBackdrops-/i, '').replace(/^StreamBackdrops-/i, '');
  if (!/\.(webp|png|jpg|jpeg)$/i.test(f)) return null;
  if (f.includes('/')) return null;
  return f.replace(/\.(webp|png|jpg|jpeg)$/i, '');
}

// ── Main ─────────────────────────────────────────────────────────────────────
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/generate-scores.js <path-to-csv>');
  process.exit(1);
}

console.log(`Reading CSV: ${csvPath}`);
const raw = fs.readFileSync(csvPath, 'utf8');
const rows = parse(raw, { skip_empty_lines: true, from_line: 2 });

// Count downloads per image base name (Jan 25+ only)
const dlMap = {};
let skipped = 0, counted = 0;

for (const row of rows) {
  const [timestamp, eventType, , filename] = row;
  // Use the shared usage-event set (a GA export normally only carries the bare
  // 'download' gtag event, but this keeps the definition consistent with
  // calculate-scores.js / insights and future-proofs a richer export).
  if (!isDownloadEvent(eventType)) continue;

  let dt;
  try {
    // Handles '01/25/2026, 3:14:22 PM' and '01/25/2026, 15:14:22'
    const clean = timestamp.trim();
    dt = new Date(clean.replace(',', ''));
    if (isNaN(dt)) {
      // Try MM/DD/YYYY, HH:MM:SS AM/PM
      const [datePart, timePart, ampm] = clean.replace(',', '').split(' ');
      const [mo, day, yr] = datePart.split('/');
      dt = new Date(`${yr}-${mo}-${day}T${timePart} ${ampm || ''}`.trim());
    }
  } catch { continue; }

  if (isNaN(dt)) continue;
  if (dt < RESET_DATE) { skipped++; continue; }

  const b = baseName(filename);
  if (!b) continue;

  if (!dlMap[b]) dlMap[b] = { count: 0, lastDownload: null };
  dlMap[b].count++;
  if (!dlMap[b].lastDownload || dt > dlMap[b].lastDownload) {
    dlMap[b].lastDownload = dt;
  }
  counted++;
}

console.log(`Downloads counted (Jan 25+): ${counted}`);
console.log(`Downloads skipped (pre Jan 25): ${skipped}`);
console.log(`Unique images with downloads: ${Object.keys(dlMap).length}`);

// Load metadata to get all known images
const metaPath = path.join(__dirname, '..', 'public', 'data', 'image-metadata-complete.json');
const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

// Build scores for every image in metadata
const scores = {};
for (const [key, img] of Object.entries(metadata)) {
  const b = key.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  const entry = dlMap[b] || { count: 0, lastDownload: null };
  const score = calcScore(entry.count, entry.lastDownload);
  const filename = img.filename || `${key}.webp`;
  scores[filename] = {
    score,
    downloads: entry.count,
    lastDownload: entry.lastDownload ? entry.lastDownload.toISOString() : null
  };
}

// Write output
const outPath = path.join(__dirname, '..', 'public', 'data', 'image-scores-static.json');
const output = {
  generatedAt: NOW.toISOString(),
  resetDate: '2026-01-25',
  totalImages: Object.keys(scores).length,
  scores
};
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

// Summary
const withDl  = Object.values(scores).filter(s => s.downloads > 0).length;
const top10   = Object.entries(scores).sort((a,b) => b[1].score - a[1].score).slice(0, 10);
console.log(`\n✅ Written: ${outPath}`);
console.log(`   Total images : ${Object.keys(scores).length}`);
console.log(`   With downloads: ${withDl}`);
console.log(`\nTop 10:`);
for (const [fn, s] of top10) {
  console.log(`  ${fn}: score=${s.score}  downloads=${s.downloads}`);
}
console.log('\nNext steps:');
console.log('  git add public/data/image-scores-static.json');
console.log('  git commit -m "Update image scores"');
console.log('  git push');
