// lib/sheetRowUtils.mjs
//
// Pure helpers shared by BOTH the Sheets→Neon sync script
// (scripts/data-platform/_sheets.mjs) and the live dual-write path
// (lib/neonEvents.mjs). Keeping the row-hash + timestamp-parse recipe in ONE place
// is what makes live writes and the daily reconciliation sync dedup against each
// other: a live event and the same event later read from the Sheet must produce
// the identical row_hash, or the reconciliation would double-insert it.
//
// ESM (.mjs) so plain `node` (which runs the sync scripts) treats it as a module;
// Next.js transpiles it fine for the API-route import path too. No external deps.

import crypto from 'node:crypto';

// Stable dedup key: sha256 hex of the verbatim cells joined with a unit separator
// (\x1f can't appear in sheet text), namespaced with a `prefix` (the source tab
// name). The sync hashes each analytics row under its tab; the live dual-write
// hashes under ANALYTICS_HASH_PREFIX ('Analytics' — the tab the flush appends live
// events to), so a live row and its later Analytics-tab sync produce the same hash
// and dedup via ON CONFLICT.
export function rowHash(cells, prefix = '') {
  const h = crypto.createHash('sha256');
  h.update(prefix + '\x1f' + cells.map(c => (c == null ? '' : String(c))).join('\x1f'));
  return h.digest('hex');
}

// Best-effort parse of the localized ET strings the site writes, e.g.
// "07/09/2026, 14:30:05" (toLocaleString) or "07/09/2026, 02:30 PM" (no seconds).
// The wall-clock is America/New_York; we attach the correct -04:00/-05:00 offset
// for that instant so the stored timestamptz is the true UTC moment. Returns a
// Date, or null when the string can't be parsed (verbatim row is kept regardless).
export function parseEtTimestamp(str) {
  if (!str || typeof str !== 'string') return null;

  const m = str.match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i,
  );
  if (!m) {
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  let [, mo, da, yr, hh, mi, ss, ap] = m;
  let hour = parseInt(hh, 10);
  if (ap) {
    const upper = ap.toUpperCase();
    if (upper === 'PM' && hour !== 12) hour += 12;
    if (upper === 'AM' && hour === 12) hour = 0;
  }

  const y = parseInt(yr, 10);
  const mon = parseInt(mo, 10);
  const day = parseInt(da, 10);
  const min = parseInt(mi, 10);
  const sec = ss ? parseInt(ss, 10) : 0;

  const offsetMinutes = etOffsetMinutes(y, mon, day, hour, min, sec);
  const utcMs = Date.UTC(y, mon - 1, day, hour, min, sec) - offsetMinutes * 60_000;
  const d = new Date(utcMs);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Offset (in minutes, e.g. -240 for EDT, -300 for EST) that America/New_York was
// at for the given wall-clock components. Derived from Intl so DST is exact and we
// carry no hard-coded transition dates.
function etOffsetMinutes(y, mon, day, hour, min, sec) {
  const asUTC = new Date(Date.UTC(y, mon - 1, day, hour, min, sec));
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(asUTC).filter(p => p.type !== 'literal').map(p => [p.type, p.value]),
  );
  let h = parseInt(parts.hour, 10);
  if (h === 24) h = 0; // Intl can emit "24" for midnight
  const localAsUTC = Date.UTC(
    parseInt(parts.year, 10), parseInt(parts.month, 10) - 1, parseInt(parts.day, 10),
    h, parseInt(parts.minute, 10), parseInt(parts.second, 10),
  );
  return Math.round((localAsUTC - asUTC.getTime()) / 60_000);
}

// Coerce a sheet cell to an integer or null (blank / non-numeric → null).
export function toInt(v) {
  if (v == null || v === '') return null;
  const n = parseInt(String(v).replace(/[^0-9-]/g, ''), 10);
  return Number.isNaN(n) ? null : n;
}

// Hash prefix the LIVE analytics dual-write uses — the 'Analytics' tab name, so a
// live event reconciles with the same row when the sync later reads the Analytics
// tab (see rowHash note above).
export const ANALYTICS_HASH_PREFIX = 'Analytics';
