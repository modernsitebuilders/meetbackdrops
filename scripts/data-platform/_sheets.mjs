// scripts/data-platform/_sheets.mjs
//
// Shared helpers for the Analytics → Neon sync. Single definition of: how the
// Google Sheets client is authenticated, how a tab range is fetched, how a row's
// dedup hash is computed, and how the localized Eastern-Time timestamp strings the
// site writes are parsed back into a Date.
//
// No database side effects — this module only reads Sheets and does pure helpers.

import crypto from 'node:crypto';
import { google } from 'googleapis';

// Build an authenticated Sheets v4 client from the same env + private-key
// normalization the site already uses in pages/api/cron/flush-analytics.js
// (strip wrapping quotes, turn escaped \n into real newlines).
export async function getSheetsClient() {
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!privateKey) throw new Error('GOOGLE_PRIVATE_KEY is not set');
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  await auth.authorize();

  return google.sheets({ version: 'v4', auth });
}

// Fetch a tab range's rows (array of arrays). Returns [] when the tab is empty.
export async function fetchTab(sheets, range) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
  });
  return res.data.values || [];
}

// Stable dedup key: sha256 hex of the verbatim cells joined with a unit separator
// (\x1f can't appear in sheet text), optionally namespaced with a prefix so the
// same event row appearing in two tabs is preserved once per tab.
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

  // Determine the America/New_York UTC offset for this wall-clock instant.
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
  // localAsUTC - asUTC is how far ET's wall-clock is ahead of UTC (negative).
  return Math.round((localAsUTC - asUTC.getTime()) / 60_000);
}

// Coerce a sheet cell to an integer or null (blank / non-numeric → null).
export function toInt(v) {
  if (v == null || v === '') return null;
  const n = parseInt(String(v).replace(/[^0-9-]/g, ''), 10);
  return Number.isNaN(n) ? null : n;
}
