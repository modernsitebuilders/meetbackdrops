// lib/neonEvents.mjs
//
// LIVE dual-write path (DISABLED BY DEFAULT as of 2026-09-02): the tracking + form
// endpoints call these to write each event straight to Neon the instant it happens,
// IN ADDITION to their existing Google-Sheets queue/append.
//
// This per-event hot path is now gated behind the NEON_LIVE_WRITE env flag and is
// OFF unless NEON_LIVE_WRITE === '1'. It was writing to Neon on every single tracked
// event, which kept the serverless Neon compute awake continuously (never letting it
// auto-suspend / scale to zero) and burned compute hours. With the flag off, these
// calls are cheap no-ops and Neon stays current via the reconciliation sync ONLY,
// which now runs 4x/day (.github/workflows/sync-neon.yml, every 6h) — matching the
// Google Sheet's own 6-hour Redis flush cadence, so nothing is actually lost by
// dropping the live writes. Flip NEON_LIVE_WRITE=1 in Vercel env to restore live mode.
//
// When enabled, Neon becomes live (no 6-hour lag) while the Sheet stays the system of
// record for the existing admin dashboards.
//
// Uses @neondatabase/serverless (HTTP driver) — no persistent connections, so it's
// safe on Vercel's per-request serverless functions (same driver remodelcalculators
// uses). The `pg` Pool in lib/db.js is for local scripts, not this hot path.
//
// Design guarantees:
//  - Never throws / never blocks tracking: every call is wrapped and swallows all
//    errors, and no-ops if DATABASE_URL is unset (so dev/preview don't break).
//  - Reconciles with the daily sync: the row_hash + timestamp recipe comes from the
//    SAME lib/sheetRowUtils.mjs the sync uses, and the live row array is byte-identical
//    to what the endpoint writes to the Sheet — so when that event is later read from
//    the Sheet, ON CONFLICT (row_hash) DO NOTHING dedups it. No double-counting.

import { rowHash, parseEtTimestamp, toInt, ANALYTICS_HASH_PREFIX } from './sheetRowUtils.mjs';

let _sql;
// Lazy singleton. Returns null when DATABASE_URL is unset (local dev / preview) or
// the driver can't init — callers treat null as "skip the live write".
async function getSql() {
  if (_sql !== undefined) return _sql;
  // Live per-event writes are opt-in. Default OFF so Neon can auto-suspend between
  // the 4x/day reconciliation syncs instead of being pinged on every tracked event.
  if (process.env.NEON_LIVE_WRITE !== '1') { _sql = null; return _sql; }
  if (!process.env.DATABASE_URL) { _sql = null; return _sql; }
  try {
    const { neon } = await import('@neondatabase/serverless');
    _sql = neon(process.env.DATABASE_URL);
  } catch {
    _sql = null;
  }
  return _sql;
}

// Analytics event — `row` is the exact 15-element array the endpoint pushes to the
// Redis analytics queue (→ Sheet). source_tab is 'Analytics' because that's the tab
// the flush appends live events to; the hash prefix is constant so it still matches
// an Archive copy later.
//
// `opts.isBot` is the header-level behavioral-bot PRE-tag (lib/botFilter.js
// isSuspectedBehavioralBot). It's Neon-only and NOT part of the row array, so it
// never affects row_hash or the sheet-sync dedup. It defaults false. It is only a
// guess — the authoritative session-aware classifier (flag-bots.mjs) overwrites it
// with the session's verdict, clearing it when the session turns out engaged.
export async function insertAnalyticsEventSafe(row, opts = {}) {
  try {
    const sql = await getSql();
    if (!sql || !Array.isArray(row)) return;
    const r = row;
    const isBot = opts.isBot === true;
    await sql`
      INSERT INTO analytics_events (
        row_hash, source_tab, event_at, event_type, original_source, filename, category,
        page_views_in_session, downloads_in_session, visitor_type, landing_page,
        session_id, visitor_id, event_date, event_time, user_agent, referer, is_bot, source_data
      ) VALUES (
        ${rowHash(r, ANALYTICS_HASH_PREFIX)}, ${'Analytics'}, ${parseEtTimestamp(r[0])},
        ${r[1] ?? null}, ${r[2] ?? null}, ${r[3] ?? null}, ${r[4] ?? null},
        ${toInt(r[5])}, ${toInt(r[6])}, ${r[7] ?? null}, ${r[8] ?? null},
        ${r[9] ?? null}, ${r[10] ?? null}, ${r[11] ?? null}, ${r[12] ?? null},
        ${r[13] ?? null}, ${r[14] ?? null}, ${isBot}, ${JSON.stringify(r)}::jsonb
      )
      ON CONFLICT (row_hash) DO NOTHING`;
  } catch (e) {
    console.error('neon live insert (analytics) failed:', e?.message);
  }
}

// Email capture — `row` = [email, source, timestamp], identical to the Email List
// Sheet write. Prefix matches the sync's Email List hashing.
export async function insertEmailSafe(row) {
  try {
    const sql = await getSql();
    if (!sql || !Array.isArray(row) || !row[0]) return;
    const r = row;
    await sql`
      INSERT INTO email_list (row_hash, email, source, captured_at, source_data)
      VALUES (${rowHash(r, 'Email List')}, ${r[0] ?? null}, ${r[1] ?? null},
              ${parseEtTimestamp(r[2])}, ${JSON.stringify(r)}::jsonb)
      ON CONFLICT (row_hash) DO NOTHING`;
  } catch (e) {
    console.error('neon live insert (email) failed:', e?.message);
  }
}

// Review — `row` = [date, rating, name, comment, email, status], identical to the
// Reviews Sheet write. Prefix matches the sync's Reviews hashing.
export async function insertReviewSafe(row) {
  try {
    const sql = await getSql();
    if (!sql || !Array.isArray(row)) return;
    const r = row;
    await sql`
      INSERT INTO reviews (row_hash, review_at, rating, name, comment, email, status, source_data)
      VALUES (${rowHash(r, 'Reviews')}, ${parseEtTimestamp(r[0])}, ${toInt(r[1])},
              ${r[2] ?? null}, ${r[3] ?? null}, ${r[4] ?? null}, ${r[5] ?? null},
              ${JSON.stringify(r)}::jsonb)
      ON CONFLICT (row_hash) DO NOTHING`;
  } catch (e) {
    console.error('neon live insert (review) failed:', e?.message);
  }
}
