// lib/popularity.js
//
// The ONE popularity rule for the whole site. Every grid (category, theme,
// platform, collection, platform landing, hubs, related images, search
// browse, /most-popular) orders images by the `score` this module defines,
// read from public/data/image-scores-static.json. Where on the site a download
// happened does not matter — only how many, and how recently.
//
// popularity = Σ over downloads of 0.5 ^ (age_days / HALF_LIFE_DAYS)
//   One download counted per visitor, per image, per day (bot rows excluded).
//   A download today is worth 1.0; one from 30 days ago 0.5; 60 days ago 0.25.
//   So 10 downloads this month outrank 40 from last spring.
//
// Rank tiers (encoded into `score` so every consumer just sorts descending):
//   2 PROVEN — popularity ≥ PROVEN_THRESHOLD (≈ at least one download's worth
//              in the last month). New images that earn this join here on merit.
//   1 NEW    — on the site < NEW_WINDOW_DAYS and not yet proven. Always ranked
//              ABOVE tier 0: an image that hasn't had its chance yet must never
//              sit among or below images that had the chance and didn't convert.
//   0 STALE  — on the site ≥ NEW_WINDOW_DAYS and below the threshold.
//   score = tier * TIER_STEP + popularity (+ a tiny newest-first nudge in tier 1)

const HALF_LIFE_DAYS = 30;
const NEW_WINDOW_DAYS = 30;
const PROVEN_THRESHOLD = 1.0;
const TIER_STEP = 10000;
const DAY_MS = 24 * 60 * 60 * 1000;

const TIER = { STALE: 0, NEW: 1, PROVEN: 2 };

function decayWeight(eventDate, now = new Date()) {
  const ageDays = Math.max(0, (now - new Date(eventDate)) / DAY_MS);
  return Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
}

function daysOnSite(addedAt, now = new Date()) {
  if (!addedAt) return Infinity; // undated → treat as long-established
  return Math.max(0, (now - new Date(`${addedAt}T00:00:00Z`)) / DAY_MS);
}

function tierFor(popularity, addedAt, now = new Date()) {
  if (popularity >= PROVEN_THRESHOLD) return TIER.PROVEN;
  if (daysOnSite(addedAt, now) < NEW_WINDOW_DAYS) return TIER.NEW;
  return TIER.STALE;
}

// The sortable rank value stored as `score` in the scores file.
function rankScore(popularity, addedAt, now = new Date()) {
  const tier = tierFor(popularity, addedAt, now);
  let s = tier * TIER_STEP + popularity;
  // Within NEW, break popularity ties newest-first. Max nudge 0.001 — far below
  // one download's weight, so it only ever orders otherwise-equal images.
  if (tier === TIER.NEW) s += (1 - daysOnSite(addedAt, now) / NEW_WINDOW_DAYS) * 0.001;
  return Math.round(s * 10000) / 10000;
}

// Score-file entry for an image no download data has been computed for yet
// (e.g. a batch pushed between daily score refreshes).
function entryWithoutData(addedAt, now = new Date()) {
  return {
    score: rankScore(0, addedAt, now),
    popularity: 0,
    tier: tierFor(0, addedAt, now),
    downloads30d: 0,
    downloads365d: 0,
    lastDownload: null,
    addedAt: addedAt || null,
  };
}

module.exports = {
  HALF_LIFE_DAYS,
  NEW_WINDOW_DAYS,
  PROVEN_THRESHOLD,
  TIER_STEP,
  TIER,
  decayWeight,
  daysOnSite,
  tierFor,
  rankScore,
  entryWithoutData,
};
