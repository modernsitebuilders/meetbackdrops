// scripts/data-platform/sync-sheets.mjs
//
// Analytics → Neon sync. Pulls the MeetBackdrops analytics Google Sheet into the
// four typed Postgres tables (analytics_events, email_list, reviews,
// branded_inquiries). Idempotent: every row is keyed by a content hash and inserted
// with ON CONFLICT (row_hash) DO NOTHING, so re-running only adds genuinely new
// rows. The verbatim row array is stored in source_data on every table (zero-loss).
//
// The Google Sheet remains the WRITE path (the site appends there via Redis flush);
// Neon is a queryable read mirror refreshed by re-running this script.
//
// Requires: DATABASE_URL, GOOGLE_SERVICE_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID,
// and migrations 001–004 already applied (npm run migrate).
// Run: npm run data:sync

import pg from 'pg';
import { getSheetsClient, fetchTab, rowHash, parseEtTimestamp, toInt } from './_sheets.mjs';

const { Client } = pg;

// Insert a batch of prepared rows for one table, one transaction, ON CONFLICT DO
// NOTHING on row_hash. Returns { inserted, skipped }. `cols` are the column names
// after row_hash; `values(row)` maps a prepared row to their bound values.
async function upsertRows(client, table, cols, rows, values) {
  if (rows.length === 0) return { inserted: 0, skipped: 0 };
  const colList = ['row_hash', ...cols].join(', ');
  let inserted = 0;
  await client.query('BEGIN');
  try {
    for (const row of rows) {
      const bound = [row.row_hash, ...values(row)];
      const placeholders = bound.map((_, i) => `$${i + 1}`).join(', ');
      const { rowCount } = await client.query(
        `INSERT INTO ${table} (${colList}) VALUES (${placeholders})
         ON CONFLICT (row_hash) DO NOTHING`,
        bound,
      );
      inserted += rowCount;
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
  return { inserted, skipped: rows.length - inserted };
}

async function syncAnalytics(client, sheets) {
  // Read both the live tab and the overflow archive; tag each with source_tab so an
  // identical event present in both is kept once per tab (hash is namespaced).
  const tabs = ['Analytics', 'Analytics_Archive'];
  const prepared = [];
  for (const tab of tabs) {
    let values = [];
    try {
      values = await fetchTab(sheets, `${tab}!A:P`);
    } catch (e) {
      console.warn(`  ⚠️  ${tab}: ${e.message} — skipping tab`);
      continue;
    }
    // No header row in the Analytics tabs (events are appended raw).
    for (const r of values) {
      if (!r || r.length === 0) continue;
      prepared.push({
        row_hash: rowHash(r, tab),
        source_tab: tab,
        source_data: JSON.stringify(r),
        event_at: parseEtTimestamp(r[0]),
        event_type: r[1] ?? null,
        original_source: r[2] ?? null,
        filename: r[3] ?? null,
        category: r[4] ?? null,
        page_views_in_session: toInt(r[5]),
        downloads_in_session: toInt(r[6]),
        visitor_type: r[7] ?? null,
        landing_page: r[8] ?? null,
        session_id: r[9] ?? null,
        visitor_id: r[10] ?? null,
        event_date: r[11] ?? null,
        event_time: r[12] ?? null,
        user_agent: r[13] ?? null,
        referer: r[14] ?? null,
      });
    }
  }
  const cols = [
    'source_tab', 'event_at', 'event_type', 'original_source', 'filename', 'category',
    'page_views_in_session', 'downloads_in_session', 'visitor_type', 'landing_page',
    'session_id', 'visitor_id', 'event_date', 'event_time', 'user_agent', 'referer',
    'source_data',
  ];
  return upsertRows(client, 'analytics_events', cols, prepared, r => [
    r.source_tab, r.event_at, r.event_type, r.original_source, r.filename, r.category,
    r.page_views_in_session, r.downloads_in_session, r.visitor_type, r.landing_page,
    r.session_id, r.visitor_id, r.event_date, r.event_time, r.user_agent, r.referer,
    r.source_data,
  ]);
}

async function syncEmailList(client, sheets) {
  let values = [];
  try {
    values = await fetchTab(sheets, 'Email List!A:C');
  } catch (e) {
    console.warn(`  ⚠️  Email List: ${e.message} — skipping`);
    return { inserted: 0, skipped: 0 };
  }
  const prepared = values
    .filter(r => r && r.length && r[0]) // require an email
    .filter(r => String(r[0]).toLowerCase() !== 'email') // drop the header row
    .map(r => ({
      row_hash: rowHash(r, 'Email List'),
      email: r[0] ?? null,
      source: r[1] ?? null,
      captured_at: parseEtTimestamp(r[2]),
      source_data: JSON.stringify(r),
    }));
  return upsertRows(client, 'email_list', ['email', 'source', 'captured_at', 'source_data'],
    prepared, r => [r.email, r.source, r.captured_at, r.source_data]);
}

async function syncReviews(client, sheets) {
  let values = [];
  try {
    // Skip the header row (A2:F) — Reviews has a header in row 1.
    values = await fetchTab(sheets, 'Reviews!A2:F');
  } catch (e) {
    console.warn(`  ⚠️  Reviews: ${e.message} — skipping`);
    return { inserted: 0, skipped: 0 };
  }
  const prepared = values
    .filter(r => r && r.length)
    .map(r => ({
      row_hash: rowHash(r, 'Reviews'),
      review_at: parseEtTimestamp(r[0]),
      rating: toInt(r[1]),
      name: r[2] ?? null,
      comment: r[3] ?? null,
      email: r[4] ?? null,
      status: r[5] ?? null,
      source_data: JSON.stringify(r),
    }));
  return upsertRows(client, 'reviews',
    ['review_at', 'rating', 'name', 'comment', 'email', 'status', 'source_data'],
    prepared, r => [r.review_at, r.rating, r.name, r.comment, r.email, r.status, r.source_data]);
}

// Branded Backgrounds and Licensing are two SEPARATE sales campaigns/products, each
// with its own sheet tab but an identical 11-column lead schema, so one generic
// syncer drives both (tab → table). The row_hash is namespaced by the tab so the two
// campaigns never collide even if a lead appears in both.
//   NOTE: pages/api/branded-inquiry.js currently writes to a "Branded Inquiries" tab
//   that does not yet exist in the sheet (a live bug). fetchTab throws "Unable to
//   parse range" for a missing tab; we treat that as 0 rows so the branded table
//   simply stays empty and fills automatically once that tab exists.
async function syncInquiries(client, sheets, { tab, table }) {
  let values = [];
  try {
    values = await fetchTab(sheets, `'${tab}'!A:K`);
  } catch (e) {
    console.warn(`  ⚠️  ${tab}: ${e.message} — skipping (tab missing or empty)`);
    return { inserted: 0, skipped: 0 };
  }
  const prepared = values
    .filter(r => r && r.length)
    // Drop the header row (col 0 literally "Timestamp").
    .filter(r => String(r[0]).toLowerCase() !== 'timestamp')
    .map(r => ({
      row_hash: rowHash(r, tab),
      inquiry_at: parseEtTimestamp(r[0]),
      name: r[1] ?? null,
      work_email: r[2] ?? null,
      company: r[3] ?? null,
      role: r[4] ?? null,
      team_size: r[5] ?? null,
      timeline: r[6] ?? null,
      use_case: r[7] ?? null,
      notes: r[8] ?? null,
      ip: r[9] ?? null,
      user_agent: r[10] ?? null,
      source_data: JSON.stringify(r),
    }));
  return upsertRows(client, table,
    ['inquiry_at', 'name', 'work_email', 'company', 'role', 'team_size', 'timeline',
      'use_case', 'notes', 'ip', 'user_agent', 'source_data'],
    prepared, r => [r.inquiry_at, r.name, r.work_email, r.company, r.role, r.team_size,
      r.timeline, r.use_case, r.notes, r.ip, r.user_agent, r.source_data]);
}

async function main() {
  for (const k of ['DATABASE_URL', 'GOOGLE_SERVICE_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEET_ID']) {
    if (!process.env[k]) {
      console.error(`${k} is not set. Aborting sync.`);
      process.exit(1);
    }
  }

  const sheets = await getSheetsClient();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const targets = [
      ['analytics_events',     sheets => syncAnalytics(client, sheets)],
      ['email_list',           sheets => syncEmailList(client, sheets)],
      ['reviews',              sheets => syncReviews(client, sheets)],
      ['branded_inquiries',    sheets => syncInquiries(client, sheets, { tab: 'Branded Inquiries',   table: 'branded_inquiries' })],
      ['licensing_inquiries',  sheets => syncInquiries(client, sheets, { tab: 'Licensing Inquiries', table: 'licensing_inquiries' })],
    ];
    let totalInserted = 0;
    for (const [name, fn] of targets) {
      const { inserted, skipped } = await fn(sheets);
      totalInserted += inserted;
      console.log(`${name}: ${inserted} inserted, ${skipped} already present`);
    }
    console.log(`\nSync complete. ${totalInserted} new row(s) across all tables.`);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
