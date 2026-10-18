#!/usr/bin/env node
// scripts/data-platform/generate-scores.mjs
//
// Writes public/data/image-scores-static.json — the single popularity source
// every grid on the site sorts by. The rules live in lib/popularity.js; this
// script only gathers the inputs.
//
//   npm run scores:generate          compute from Neon download events (daily Action)
//   npm run scores:fill-missing      offline: add a no-data entry for any manifest
//                                    image missing from the file (runs in prebuild,
//                                    so a batch pushed between daily refreshes ranks
//                                    as NEW instead of falling to the bottom)
//
// Input: analytics_events download rows (DOWNLOAD_EVENTS from lib/analyticsNormalize),
// NOT is_bot, last 365 days, counted once per visitor per image per day. Event
// filenames are mapped to the current manifest slug, including pre-June-2026 legacy
// names ({category}-NN) via image-pipeline/slug-migration-map.json.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCORES_PATH = path.join(ROOT, 'public', 'data', 'image-scores-static.json');
const MANIFEST_PATH = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const MIGRATION_MAP_PATH = path.join(ROOT, 'image-pipeline', 'slug-migration-map.json');

const pop = require('../../lib/popularity.js');
const { DOWNLOAD_EVENTS } = require('../../lib/analyticsNormalize.js');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const now = new Date();

function readScoresFile() {
  try { return JSON.parse(fs.readFileSync(SCORES_PATH, 'utf8')); } catch { return null; }
}

function writeScoresFile(data) {
  fs.writeFileSync(SCORES_PATH, JSON.stringify(data, null, 2) + '\n');
}

function method() {
  return {
    halfLifeDays: pop.HALF_LIFE_DAYS,
    newWindowDays: pop.NEW_WINDOW_DAYS,
    provenThreshold: pop.PROVEN_THRESHOLD,
    tiers: '2 proven / 1 new / 0 stale — see lib/popularity.js',
  };
}

// ── --fill-missing (offline) ────────────────────────────────────────────────
function fillMissing() {
  const data = readScoresFile() || { generatedAt: null, scores: {} };
  data.scores ||= {};
  let added = 0;
  for (const e of manifest) {
    if (data.scores[e.image_webp]) continue;
    data.scores[e.image_webp] = pop.entryWithoutData(e.addedAt, now);
    added += 1;
  }
  if (added) {
    data.method = method();
    writeScoresFile(data);
  }
  console.log(`scores:fill-missing — added ${added} no-data entr${added === 1 ? 'y' : 'ies'}`);
}

// ── full generation from Neon ───────────────────────────────────────────────
async function generate() {
  const { getSql, withRetry } = await import('./_neon.mjs');
  const sql = getSql();

  // event filename (prefix/extension stripped) → current manifest slug
  const slugByHash = new Map(manifest.map((e) => [e.slug.slice(-8), e.slug]));
  const resolve = new Map(manifest.map((e) => [e.slug, e.slug]));
  const migration = JSON.parse(fs.readFileSync(MIGRATION_MAP_PATH, 'utf8')).entries || {};
  for (const m of Object.values(migration)) {
    const current = slugByHash.get(m.hash8);
    if (!current) continue;
    for (const old of [m.oldSlug, m.oldWebp, m.oldPng]) {
      if (old) resolve.set(old.replace(/\.(webp|png)$/i, ''), current);
    }
  }

  const rows = await withRetry('download events', () => sql.query(
    `SELECT regexp_replace(filename, '^(MeetBackdrops|StreamBackdrops)-|\\.(png|webp|jpe?g)$', '', 'gi') AS base,
            (event_at AT TIME ZONE 'UTC')::date AS day,
            count(DISTINCT coalesce(visitor_id, session_id, row_hash))::int AS n
       FROM analytics_events
      WHERE event_type = ANY($1)
        AND NOT coalesce(is_bot, false)
        AND event_at >= now() - interval '365 days'
        AND filename IS NOT NULL
      GROUP BY 1, 2`,
    [[...DOWNLOAD_EVENTS]],
  ));

  const stats = new Map(); // slug → { popularity, d30, d365, last }
  let unmatched = 0;
  for (const r of rows) {
    const slug = resolve.get(r.base);
    if (!slug) { unmatched += r.n; continue; }
    const s = stats.get(slug) || { popularity: 0, d30: 0, d365: 0, last: null };
    const day = new Date(r.day);
    s.popularity += r.n * pop.decayWeight(day, now);
    s.d365 += r.n;
    if (now - day <= 30 * 24 * 60 * 60 * 1000) s.d30 += r.n;
    if (!s.last || day > s.last) s.last = day;
    stats.set(slug, s);
  }

  const scores = {};
  for (const e of manifest) {
    const s = stats.get(e.slug);
    if (!s) { scores[e.image_webp] = pop.entryWithoutData(e.addedAt, now); continue; }
    const popularity = Math.round(s.popularity * 10000) / 10000;
    scores[e.image_webp] = {
      score: pop.rankScore(popularity, e.addedAt, now),
      popularity,
      tier: pop.tierFor(popularity, e.addedAt, now),
      downloads30d: s.d30,
      downloads365d: s.d365,
      lastDownload: s.last.toISOString().slice(0, 10),
      addedAt: e.addedAt || null,
    };
  }

  writeScoresFile({ generatedAt: now.toISOString(), method: method(), scores });

  const tiers = [0, 0, 0];
  Object.values(scores).forEach((v) => { tiers[v.tier] += 1; });
  console.log(`scores:generate — ${manifest.length} images | proven ${tiers[2]} · new ${tiers[1]} · stale ${tiers[0]}` +
    ` | ${unmatched} downloads on filenames no longer in the manifest`);
}

if (process.argv.includes('--fill-missing')) {
  fillMissing();
} else {
  generate().catch((err) => { console.error(err); process.exit(1); });
}
