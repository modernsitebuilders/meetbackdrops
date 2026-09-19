// scripts/data-platform/dedupe-analytics.mjs
//
// Collapses duplicate analytics_events rows and rewrites every row_hash to the
// tab-independent recipe the sync now uses (rowHash(cells, ANALYTICS_HASH_PREFIX)).
//
// Why this exists: until Sept 2026 the sync hashed each analytics row under the
// tab it was read from. When events were moved from `Analytics` to
// `Analytics_Archive` (Aug 30 2026), every moved event re-hashed under the archive
// prefix and was inserted a SECOND time — ~25k duplicate rows covering May–early
// Aug 2026, which doubled every page_view/download count for that period and made
// each one-hit crawler session look like a 2-event "engaged" session (so
// flag-bots.mjs, which keys on single-event sessions, couldn't see it).
//
// Two rows are duplicates when their verbatim cells are identical after
// stringification — i.e. they produce the same new row_hash. Per group the lowest
// id survives, inheriting is_bot = OR of the group (flag-bots.mjs then re-derives
// the per-session verdict). After the collapse every survivor's row_hash is
// rewritten to the new recipe; without that, the weekly full re-read would hash
// the Archive tab under the new prefix and re-insert the rows a third time.
//
// Safe to re-run (a clean table is a no-op). Nothing is lost: the survivor keeps
// the verbatim source_data, and the Google Sheet remains the system of record.
// Run: `npm run data:dedupe`  (`-- --dry-run` to preview without writing).

import pg from 'pg';
import { rowHash, ANALYTICS_HASH_PREFIX } from '../../lib/sheetRowUtils.mjs';

const DRY = process.argv.includes('--dry-run');
const PAGE = 20_000;

if (!process.env.DATABASE_URL) {
  console.error('✖ DATABASE_URL is not set. Add it to .env.local (Neon pooled connection string).');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, keepAlive: true });
client.on('error', (e) => {
  console.error('dedupe-analytics: database connection error —', e.message);
  process.exitCode = 1;
});

async function main() {
  await client.connect();
  console.log(`\ndedupe-analytics — ${DRY ? 'DRY RUN (no writes)' : 'LIVE'}`);

  // Group every row by its new hash. Keyset-paged so no single response is huge.
  const groups = new Map(); // newHash -> { keep, keepHash, bot, drop: [] }
  let lastId = 0;
  let total = 0;
  for (;;) {
    const { rows } = await client.query(
      `SELECT id, row_hash, is_bot, source_data FROM analytics_events
       WHERE id > $1 ORDER BY id LIMIT $2`, [lastId, PAGE]);
    if (!rows.length) break;
    for (const r of rows) {
      const h = rowHash(r.source_data, ANALYTICS_HASH_PREFIX);
      const g = groups.get(h);
      if (!g) groups.set(h, { keep: r.id, keepHash: r.row_hash, bot: r.is_bot, keepBot: r.is_bot, drop: [] });
      else { g.drop.push(r.id); g.bot = g.bot || r.is_bot; }
    }
    total += rows.length;
    lastId = rows[rows.length - 1].id;
  }

  const dropIds = [];
  const upd = { ids: [], hashes: [], bots: [] };
  for (const [h, g] of groups) {
    dropIds.push(...g.drop);
    if (g.keepHash !== h || g.keepBot !== g.bot) {
      upd.ids.push(g.keep); upd.hashes.push(h); upd.bots.push(g.bot);
    }
  }
  console.log(`\nScanned ${total} rows → ${groups.size} distinct events.`);
  console.log(`  duplicate rows to delete: ${dropIds.length}`);
  console.log(`  survivors to rewrite (row_hash and/or is_bot): ${upd.ids.length}`);

  if (DRY || (!dropIds.length && !upd.ids.length)) {
    console.log(DRY ? '\nDry run — no changes written.' : '\nAlready clean — nothing to do.');
    return client.end();
  }

  // One transaction: delete first (frees the survivors' new hashes from the UNIQUE
  // constraint), then rewrite survivors. A failure leaves the table untouched.
  await client.query('BEGIN');
  try {
    const del = await client.query('DELETE FROM analytics_events WHERE id = ANY($1::bigint[])', [dropIds]);
    const up = await client.query(
      `UPDATE analytics_events t SET row_hash = u.h, is_bot = u.b
       FROM unnest($1::bigint[], $2::text[], $3::boolean[]) AS u(id, h, b)
       WHERE t.id = u.id`, [upd.ids, upd.hashes, upd.bots]);
    await client.query('COMMIT');
    console.log(`\n✓ Deleted ${del.rowCount} duplicate rows; rewrote ${up.rowCount} survivors.`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
  await client.end();
}

main().catch(async (e) => {
  console.error('dedupe-analytics failed:', e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
