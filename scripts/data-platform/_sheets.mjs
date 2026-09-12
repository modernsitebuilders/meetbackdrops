// scripts/data-platform/_sheets.mjs
//
// Shared helpers for the Analytics → Neon sync. Single definition of: how the
// Google Sheets client is authenticated, how a tab range is fetched, how a row's
// dedup hash is computed, and how the localized Eastern-Time timestamp strings the
// site writes are parsed back into a Date.
//
// No database side effects — this module only reads Sheets and does pure helpers.

import { google } from 'googleapis';

// Row-hash + timestamp helpers live in lib/sheetRowUtils.mjs so the live dual-write
// path (lib/neonEvents.mjs) and this sync use the identical recipe and reconcile.
export { rowHash, parseEtTimestamp, toInt, ANALYTICS_HASH_PREFIX } from '../../lib/sheetRowUtils.mjs';

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
//
// Retried on transient failures (Google 429/5xx, socket resets) so a blip part-way
// through a multi-tab sync doesn't throw away the run. A genuinely bad range — a tab
// that doesn't exist yet, e.g. the not-yet-created "Branded Inquiries" — fails fast so
// the caller's skip-the-tab handling still kicks in immediately.
const RETRYABLE_SHEETS_STATUS = new Set([408, 429, 500, 502, 503, 504]);

export async function fetchTab(sheets, range, { attempts = 4, baseMs = 800 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range,
      });
      return res.data.values || [];
    } catch (e) {
      lastErr = e;
      const status = e?.code ?? e?.response?.status;
      const transient = typeof status === 'number'
        ? RETRYABLE_SHEETS_STATUS.has(status)
        : true; // no HTTP status at all = network-level, worth another try
      if (!transient || attempt === attempts) break;
      const wait = Math.round(baseMs * 2 ** (attempt - 1) * (0.75 + Math.random() * 0.5));
      console.warn(`  \u26a0\ufe0f  sheets ${range}: ${e.message} — retrying (${attempt}/${attempts - 1}) in ${wait}ms`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw lastErr;
}
