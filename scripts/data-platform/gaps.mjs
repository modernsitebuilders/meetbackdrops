// scripts/data-platform/gaps.mjs
//
// Content-gap report — LEG 1 of 3: category demand ÷ catalog supply.
// Run: `npm run gaps`   (loads DATABASE_URL from .env.local via the npm script)
//
// Answers ONE question well: "of the categories I already have, which are
// pulling more traffic than their size justifies?" — i.e. where generating
// MORE of what already works has the best expected payoff. It does NOT find
// net-new backdrops; that needs Search Console (leg 2) and internal zero-result
// searches (leg 3), which are deliberately out of scope here. See
// memory: [[gap-signal-threshold]] for why single searches aren't acted on.
//
// SUPPLY comes from image-pipeline/final_manifest.json (authoritative catalog).
// DEMAND comes from the Neon analytics mirror. The two are joined in JS on the
// canonical parent category.
//
// ⚠️ TIMEZONE: Neon session TZ is UTC but the business is US Eastern; the demand
// window is bucketed with `event_at AT TIME ZONE 'America/New_York'` to match
// the Sheet system-of-record and insights.mjs. Do NOT switch to bare UTC.
//
// "Downloads" = any successful image use (free download variants + in-Zoom
// apply), mirroring DOWNLOAD_EVENTS in lib/analyticsNormalize.js.

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import analyticsNormalize from '../../lib/analyticsNormalize.js';

const { CANONICAL_CATEGORIES, DOWNLOAD_EVENTS } = analyticsNormalize;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.resolve(__dirname, '../../image-pipeline/final_manifest.json');

// Optional overrides: `npm run gaps -- --days 60`
const arg = (flag, def) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? Number(process.argv[i + 1]) : def;
};
const WINDOW = arg('--days', 90);

if (!process.env.DATABASE_URL) {
  console.error('✖ DATABASE_URL is not set. Add it to .env.local (Neon pooled connection string).');
  process.exit(1);
}

// Parent categories only — the merged bright/dark sub-folders are page-level
// variants, not separate catalog buckets, so we fold them into their parent.
const PARENTS = new Set(
  [...CANONICAL_CATEGORIES].filter((c) => !/-(bright|dark)$/.test(c)),
);

// Legacy / malformed slugs seen in raw analytics → canonical parent.
const LEGACY = { 'living-room': 'living-rooms', kitchen: 'kitchens', offices: 'office-spaces', office: 'office-spaces' };

// Seasonal categories → the months (1-12) their demand is live, INCLUDING the
// ramp-up weeks before the day itself (holiday searches start early). Off these
// months the category is dead through no fault of its content, so judging it
// against evergreen categories is apples-to-oranges — we PARK it (pull it out of
// the ranking + cold-inventory checks) instead of normalizing invented numbers.
// Any category NOT listed here is evergreen and always ranked. Windows are
// deliberately generous; tune as real month-over-month data accrues.
const SEASONS = {
  'valentines-backgrounds': [1, 2],
  'easter-backgrounds': [3, 4],       // Easter drifts Mar–Apr
  'spring-backgrounds': [3, 4, 5],
  'summer-backgrounds': [6, 7, 8],
  'fall-backgrounds': [9, 10, 11],
  'halloween-backgrounds': [9, 10],
  'christmas-backgrounds': [11, 12],
};

// Month to evaluate against. Defaults to the current month; override for
// backtesting / previewing another season: `npm run gaps -- --month 12`.
const MONTH = arg('--month', new Date().getMonth() + 1);

// 'evergreen' (always ranked) | 'in-season' (ranked, but ramping) | 'off-season' (parked).
function seasonState(category) {
  const months = SEASONS[category];
  if (!months) return 'evergreen';
  return months.includes(MONTH) ? 'in-season' : 'off-season';
}

// Fold any raw category value to its canonical parent, or null if it isn't a
// real category (image-page paths with '/', search rows, UI surfaces, blog
// pages, homepage, 'other', etc. all fall out here).
function fold(raw) {
  if (!raw) return null;
  let c = String(raw).trim().toLowerCase();
  const sub = c.match(/^(.*)-(bright|dark)$/);
  if (sub) c = sub[1];
  if (LEGACY[c]) c = LEGACY[c];
  return PARENTS.has(c) ? c : null;
}

function loadSupply() {
  const fm = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const supply = new Map([...PARENTS].map((c) => [c, 0]));
  let unmapped = 0;
  for (const e of fm) {
    const c = fold(e.category);
    if (c) supply.set(c, supply.get(c) + 1);
    else unmapped += 1;
  }
  return { supply, total: fm.length, unmapped };
}

async function loadDemand(client) {
  const DL = [...DOWNLOAD_EVENTS].map((e) => `'${e}'`).join(',');
  // Aggregate per RAW category in SQL (cheap), fold + filter in JS so the
  // canonical logic lives in exactly one place (fold()).
  const { rows } = await client.query(`
    SELECT lower(trim(category)) AS category,
      count(*) FILTER (WHERE event_type = 'page_view')          AS views,
      count(*) FILTER (WHERE event_type IN (${DL}))             AS downloads
    FROM analytics_events
    WHERE category IS NOT NULL
      AND (event_at AT TIME ZONE 'America/New_York')
          >= (now() AT TIME ZONE 'America/New_York') - interval '${WINDOW} days'
    GROUP BY 1
  `);

  const demand = new Map([...PARENTS].map((c) => [c, { views: 0, downloads: 0 }]));
  for (const r of rows) {
    const c = fold(r.category);
    if (!c) continue;
    const d = demand.get(c);
    d.views += Number(r.views);
    d.downloads += Number(r.downloads);
  }
  return demand;
}

function round(n, p = 1) {
  return n == null ? null : Math.round(n * 10 ** p) / 10 ** p;
}

async function main() {
  const { supply, total, unmapped } = loadSupply();

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const demand = await loadDemand(client);
  await client.end();

  const rows = [...PARENTS].map((category) => {
    const n = supply.get(category) || 0;
    const { views, downloads } = demand.get(category) || { views: 0, downloads: 0 };
    return {
      category,
      season: seasonState(category),
      images: n,
      views,
      downloads,
      views_per_image: n ? round(views / n) : null,
      dl_per_image: n ? round(downloads / n, 2) : null,
      dl_per_100_views: views ? round((100 * downloads) / views) : null,
    };
  });

  // Off-season seasonal categories are parked — they'd otherwise sink the
  // ranking purely because it isn't their time of year.
  const ranked = rows.filter((r) => r.season !== 'off-season');
  const parked = rows.filter((r) => r.season === 'off-season');

  // Ranked by demand pressure per unit of supply — top rows = "make more here".
  ranked.sort((a, b) => (b.views_per_image ?? -1) - (a.views_per_image ?? -1));

  const totViews = rows.reduce((s, r) => s + r.views, 0);
  const totDls = rows.reduce((s, r) => s + r.downloads, 0);
  const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][MONTH - 1];

  console.log(`\nMeetBackdrops content gaps — LEG 1 (demand ÷ supply). Window: ${WINDOW}d (ET). Season month: ${monthName}.`);
  console.log(`Catalog: ${total} images across ${PARENTS.size} categories`
    + (unmapped ? ` (${unmapped} manifest entries with non-canonical category — check!)` : ''));
  console.log(`Demand in window: ${totViews} category-page views, ${totDls} downloads.\n`);
  console.log('Ranked by views_per_image (highest = most under-supplied vs demand). "in-season" rows are ramping — weight gently:');
  console.table(ranked);

  // Cold inventory: only meaningful for EVERGREEN categories (in-season seasonal
  // ones can legitimately be mid-ramp; off-season ones are already parked).
  const cold = ranked
    .filter((r) => r.season === 'evergreen' && r.images >= 40 && (r.views_per_image ?? 0) < 1)
    .map((r) => r.category);
  if (cold.length) {
    console.log(`\nCold inventory (evergreen, ≥40 images, <1 view/image) — large but low-pull: ${cold.join(', ')}`);
  }

  if (parked.length) {
    const label = (r) => `${r.category} (live ${SEASONS[r.category].map((m) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]).join('/')})`;
    console.log(`\nParked — off-season, NOT ranked (would skew the list). Re-evaluate in their months:`);
    console.log('  ' + parked.map(label).join('\n  '));
  }

  console.log('\nNote: leg 2 (Search Console) + leg 3 (zero-result searches) find NET-NEW');
  console.log('categories; this report only ranks EXISTING ones. Low-volume windows are noisy.\n');
}

main().catch(async (e) => {
  console.error('gaps failed:', e.message);
  process.exit(1);
});
