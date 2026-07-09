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
export async function fetchTab(sheets, range) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
  });
  return res.data.values || [];
}
