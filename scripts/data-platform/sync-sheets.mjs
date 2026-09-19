// scripts/data-platform/sync-sheets.mjs
//
// Analytics → Neon sync. Pulls the MeetBackdrops analytics Google Sheet into the
// five typed Postgres tables (analytics_events, email_list, reviews,
// branded_inquiries, licensing_inquiries). Idempotent: every row is keyed by a
// content hash and inserted with ON CONFLICT (row_hash) DO NOTHING, so re-running
// only adds genuinely new rows. The verbatim row array is stored in source_data on
// every table (zero-loss).
//
// The Google Sheet remains the WRITE path (the site appends there via Redis flush);
// Neon is a queryable read mirror refreshed by re-running this script.
//
// ── Sept 2026 rewrite: why this script used to take an hour and then die ──────────
// The scheduled Action was failing at almost exactly 1h00m with
// `Error: Connection terminated unexpectedly` — an unhandled 'error' event on a
// `pg.Client`. Two compounding causes, both fixed here:
//
//   1. COST. upsertRows() ran ONE INSERT round trip PER ROW, wrapped in a single
//      transaction, over the ENTIRE Analytics + Analytics_Archive history — every
//      run. The work scaled with total history rather than with new events, so the
//      runtime crept up until it crossed the hour. Now: rows are inserted in batched
//      multi-row INSERTs (scripts/data-platform/_neon.mjs), and the append-only
//      Analytics tabs are read from a watermark (sync_state, migration 007) so a
//      normal run only touches the tail.
//
//   2. FRAGILITY. A long-lived `pg.Client` idling across the Sheets reads gets its
//      socket dropped; with no 'error' listener that crashes the process and the one
//      open transaction rolls back, losing the whole run. Now: the Neon HTTP driver
//      (no persistent socket), per-statement retries with backoff, and no long
//      transaction — each chunk commits on its own, so a failure mid-run leaves the
//      completed chunks in place and the next run resumes from there.
//
// Flags: `--full` forces a complete re-read of every tab, ignoring the watermarks
// (also via SYNC_FULL=1). `SYNC_CHUNK_ROWS` overrides the insert chunk size.
//
// Requires: DATABASE_URL, GOOGLE_SERVICE_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID,
// and migrations 001–007 already applied (npm run migrate).
// Run: npm run data:sync

import { getSheetsClient, fetchTab, rowHash, parseEtTimestamp, toInt, ANALYTICS_HASH_PREFIX } from './_sheets.mjs';
import { getSql, withRetry, insertBatched } from './_neon.mjs';
import { pathToFileURL } from 'node:url';

const FORCE_FULL = process.argv.includes('--full') || process.env.SYNC_FULL === '1';

// Analytics watermark tuning. OVERLAP re-reads a few rows below the recorded
// watermark every run: cheap insurance against an off-by-one or a row that landed
// mid-flush last time, and free because those rows just dedup on row_hash.
// FULL_EVERY_DAYS forces a periodic end-to-end reconcile so any mid-tab edit (which
// an append-only watermark can't see) is still picked up within a week.
const OVERLAP = 50;
const FULL_EVERY_DAYS = 7;

const ANALYTICS_COLS = [
  'row_hash',
  'source_tab', 'event_at', 'event_type', 'original_source', 'filename', 'category',
  'page_views_in_session', 'downloads_in_session', 'visitor_type', 'landing_page',
  'session_id', 'visitor_id', 'event_date', 'event_time', 'user_agent', 'referer',
  'source_data',
];

const secs = (t0) => `${((Date.now() - t0) / 1000).toFixed(1)}s`;

// ── watermark bookkeeping ────────────────────────────────────────────────────────
// All of this degrades gracefully: if sync_state is missing or unreadable we just do
// a full read, which is always correct (row_hash dedups it) — only slower.
let syncStateUsable = true;

async function readSyncState(sql, tab) {
  if (!syncStateUsable) return null;
  try {
    const rows = await withRetry(`sync_state read (${tab})`, () =>
      sql.query('SELECT last_row, last_full_sync_at FROM sync_state WHERE tab = $1', [tab]));
    return rows[0] ?? null;
  } catch (e) {
    console.warn(`  ⚠️  sync_state unavailable (${e.message}) — falling back to full reads. Run \`npm run migrate\`.`);
    syncStateUsable = false;
    return null;
  }
}

// Only ever called AFTER that tab's rows are safely inserted, so a failed run never
// advances the watermark past rows Neon didn't actually receive.
async function writeSyncState(sql, tab, lastRow, wasFull) {
  if (!syncStateUsable) return;
  try {
    await withRetry(`sync_state write (${tab})`, () => sql.query(
      `INSERT INTO sync_state (tab, last_row, last_full_sync_at, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (tab) DO UPDATE SET
         last_row          = EXCLUDED.last_row,
         last_full_sync_at = COALESCE(EXCLUDED.last_full_sync_at, sync_state.last_full_sync_at),
         updated_at        = now()`,
      [tab, lastRow, wasFull ? new Date() : null],
    ));
  } catch (e) {
    console.warn(`  ⚠️  could not record watermark for ${tab} (${e.message}) — next run re-reads it in full`);
  }
}

// Decide HOW to read an append-only tab, given its recorded watermark. Kept pure and
// separate because this is the off-by-one-prone part — which absolute sheet row to
// start at, and how many of the returned rows are the already-seen overlap.
//
// Returns either { mode: 'full', why } or
// { mode: 'incremental', startRow, expectedOverlap } — where `startRow` is the
// absolute 1-based sheet row to read from and `expectedOverlap` is how many of the
// returned rows we have already seen. A response SHORTER than expectedOverlap means
// the tab shrank and the watermark must be thrown away (see readAnalyticsTab).
export function planTabRead(state, { forceFull = false, overlap = OVERLAP, fullEveryDays = FULL_EVERY_DAYS, now = Date.now() } = {}) {
  if (forceFull) return { mode: 'full', why: '--full' };
  if (!state || !(state.last_row > 0)) return { mode: 'full', why: 'no watermark yet' };

  const lastFull = state.last_full_sync_at ? new Date(state.last_full_sync_at).getTime() : 0;
  if (now - lastFull > fullEveryDays * 86_400_000) return { mode: 'full', why: 'periodic reconcile' };

  const startRow = Math.max(1, state.last_row - overlap + 1);
  return { mode: 'incremental', startRow, expectedOverlap: state.last_row - startRow + 1 };
}

// Read an append-only analytics tab from its watermark, or in full.
// Returns { values, startRow, lastRow, full } — `startRow` is the absolute sheet row
// `values[0]` came from, and `lastRow` the absolute row of the last one (the new
// watermark). Those two are what let a row be mapped back to its sheet position.
async function readAnalyticsTab(sheets, sql, tab) {
  const state = FORCE_FULL ? null : await readSyncState(sql, tab);
  const plan = planTabRead(state, { forceFull: FORCE_FULL });

  if (plan.mode === 'incremental') {
    const values = await fetchTab(sheets, `'${tab}'!A${plan.startRow}:P`);
    if (values.length >= plan.expectedOverlap) {
      const newRows = values.length - plan.expectedOverlap;
      console.log(`  ${tab}: incremental from row ${plan.startRow} — ${newRows} new row(s), ${plan.expectedOverlap} re-checked`);
      return { values, startRow: plan.startRow, lastRow: plan.startRow - 1 + values.length, full: false };
    }
    // The tab is SHORTER than our watermark — rows were moved out (e.g. hand-moved to
    // Analytics_Archive) or deleted. The watermark is meaningless now; re-read it all.
    console.warn(`  ⚠️  ${tab}: shorter than the recorded watermark (row ${state.last_row}) — rows were moved or deleted; re-reading the full tab`);
  }

  const values = await fetchTab(sheets, `'${tab}'!A:P`);
  console.log(`  ${tab}: full read (${plan.why ?? 'watermark discarded'}) — ${values.length} row(s)`);
  return { values, startRow: 1, lastRow: values.length, full: true };
}

function prepareAnalyticsRow(r, tab, sheetRow) {
  return {
    // Hashed under ONE namespace for both tabs, never the tab it was read from: an
    // event is the same event whether it sits in Analytics or has been moved to
    // Analytics_Archive. Tab-namespaced hashes double-inserted every moved row
    // (~25k rows, May–Aug 2026) — see scripts/data-platform/dedupe-analytics.mjs.
    row_hash: rowHash(r, ANALYTICS_HASH_PREFIX),
    _sheetRow: sheetRow,          // absolute 1-based sheet row; drives the watermark
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
  };
}

const analyticsValues = r => [
  r.row_hash,
  r.source_tab, r.event_at, r.event_type, r.original_source, r.filename, r.category,
  r.page_views_in_session, r.downloads_in_session, r.visitor_type, r.landing_page,
  r.session_id, r.visitor_id, r.event_date, r.event_time, r.user_agent, r.referer,
  r.source_data,
];

// How often the in-progress watermark is flushed while a big tab is being inserted.
// Checkpointing every chunk would double the round trips; every few seconds bounds
// how much work a crash can cost without meaningfully adding any.
const CHECKPOINT_MS = 5_000;

async function syncAnalytics(sql, sheets) {
  // Read both the live tab and the overflow archive. source_tab records where a row
  // was first seen, but the hash is tab-independent (ANALYTICS_HASH_PREFIX, the same
  // prefix the live dual-write in lib/neonEvents.mjs uses), so an event present in
  // both tabs — or live-written, then moved to Analytics_Archive — is kept once.
  //
  // No header row in the Analytics tabs (events are appended raw).
  //
  // Tabs are handled ONE AT A TIME, and each tab's watermark is advanced as its
  // chunks commit rather than once at the end. That ordering is what makes the very
  // first run after this change — which has no watermark and so re-reads all of
  // history — safe: if it runs out of time or the network blips, everything already
  // written stays written and the next run continues from that row instead of
  // starting over.
  const tabs = ['Analytics', 'Analytics_Archive'];
  const totals = { inserted: 0, skipped: 0 };

  for (const tab of tabs) {
    let read;
    try {
      read = await readAnalyticsTab(sheets, sql, tab);
    } catch (e) {
      console.warn(`  ⚠️  ${tab}: ${e.message} — skipping tab`);
      continue;
    }

    const prepared = [];
    read.values.forEach((r, i) => {
      if (!r || r.length === 0) return;
      prepared.push(prepareAnalyticsRow(r, tab, read.startRow + i));
    });

    // Every row at or below `_sheetRow` of a committed chunk is now in Neon, so it is
    // safe to record that row as the tab's watermark.
    let lastCheckpoint = 0;
    const { inserted, skipped } = await insertBatched(
      sql, 'analytics_events', ANALYTICS_COLS, prepared, analyticsValues,
      {
        onChunk: async (row) => {
          if (Date.now() - lastCheckpoint < CHECKPOINT_MS) return;
          lastCheckpoint = Date.now();
          await writeSyncState(sql, tab, row._sheetRow, read.full);
        },
      },
    );

    // Final watermark: the true end of what we read, including rows that were skipped
    // as duplicates or blanks and so never appeared in a chunk.
    await writeSyncState(sql, tab, read.lastRow, read.full);
    totals.inserted += inserted;
    totals.skipped += skipped;
  }

  return totals;
}

// The remaining tabs are low-volume (hundreds of rows at most), so they're always
// read in full — a watermark would be more bookkeeping than it saves.
async function syncEmailList(sql, sheets) {
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
  return insertBatched(sql, 'email_list',
    ['row_hash', 'email', 'source', 'captured_at', 'source_data'],
    prepared, r => [r.row_hash, r.email, r.source, r.captured_at, r.source_data]);
}

async function syncReviews(sql, sheets) {
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
  return insertBatched(sql, 'reviews',
    ['row_hash', 'review_at', 'rating', 'name', 'comment', 'email', 'status', 'source_data'],
    prepared, r => [r.row_hash, r.review_at, r.rating, r.name, r.comment, r.email, r.status, r.source_data]);
}

// Branded Backgrounds and Licensing are two SEPARATE sales campaigns/products, each
// with its own sheet tab but an identical 11-column lead schema, so one generic
// syncer drives both (tab → table). The row_hash is namespaced by the tab so the two
// campaigns never collide even if a lead appears in both.
//   NOTE: pages/api/branded-inquiry.js currently writes to a "Branded Inquiries" tab
//   that does not yet exist in the sheet (a live bug). fetchTab throws "Unable to
//   parse range" for a missing tab; we treat that as 0 rows so the branded table
//   simply stays empty and fills automatically once that tab exists.
async function syncInquiries(sql, sheets, { tab, table }) {
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
  return insertBatched(sql, table,
    ['row_hash', 'inquiry_at', 'name', 'work_email', 'company', 'role', 'team_size',
      'timeline', 'use_case', 'notes', 'ip', 'user_agent', 'source_data'],
    prepared, r => [r.row_hash, r.inquiry_at, r.name, r.work_email, r.company, r.role,
      r.team_size, r.timeline, r.use_case, r.notes, r.ip, r.user_agent, r.source_data]);
}

async function main() {
  for (const k of ['DATABASE_URL', 'GOOGLE_SERVICE_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEET_ID']) {
    if (!process.env[k]) {
      console.error(`${k} is not set. Aborting sync.`);
      process.exit(1);
    }
  }

  const started = Date.now();
  const sheets = await getSheetsClient();
  const sql = getSql(); // HTTP driver — nothing to connect, nothing to leave open

  const targets = [
    ['analytics_events',     () => syncAnalytics(sql, sheets)],
    ['email_list',           () => syncEmailList(sql, sheets)],
    ['reviews',              () => syncReviews(sql, sheets)],
    ['branded_inquiries',    () => syncInquiries(sql, sheets, { tab: 'Branded Inquiries',   table: 'branded_inquiries' })],
    ['licensing_inquiries',  () => syncInquiries(sql, sheets, { tab: 'Licensing Inquiries', table: 'licensing_inquiries' })],
  ];

  let totalInserted = 0;
  for (const [name, fn] of targets) {
    const t0 = Date.now();
    const { inserted, skipped } = await fn();
    totalInserted += inserted;
    console.log(`${name}: ${inserted} inserted, ${skipped} already present (${secs(t0)})`);
  }
  console.log(`\nSync complete. ${totalInserted} new row(s) across all tables in ${secs(started)}.`);
}

// A dropped connection or a rejected promise must fail the run LOUDLY and with a
// non-zero exit — never take the process down through an unhandled 'error' event the
// way the old pg.Client path did, and never exit 0 on a swallowed failure.
process.on('unhandledRejection', (e) => {
  console.error('Unhandled rejection in sync:', e);
  process.exit(1);
});
process.on('uncaughtException', (e) => {
  console.error('Uncaught exception in sync:', e);
  process.exit(1);
});

// Only run when invoked as the script (`npm run data:sync`), so the pure helpers
// above can be imported by tests without kicking off a live sync.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
