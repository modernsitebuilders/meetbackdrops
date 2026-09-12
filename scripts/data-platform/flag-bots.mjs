// scripts/data-platform/flag-bots.mjs
//
// Authoritative, re-runnable classifier for the behavioral crawler that inflated
// sessions/visitors in Aug 2026 (see lib/migrations/db/006_analytics_is_bot.sql).
// Sets analytics_events.is_bot on rows matching the crawler's SESSION-LEVEL
// fingerprint — the signal that actually separates it from a real visitor and
// that single-event ingest can't see:
//
//   • the session has exactly ONE event, AND
//   • that event is a page_view (no download / preview / revenue — zero
//     engagement), AND
//   • the UA is desktop-Linux Chromium (`X11; Linux x86_64` + `Chrome/`).
//
// Precision-first: the ONLY real users this can touch are Linux-desktop bouncers
// (one page, then gone) — the lowest-value, fully recoverable segment. Any real
// visitor who does a second thing (another page, a download) has a ≥2-event or
// engaged session and is NEVER matched. The UA-agnostic safety net is the
// engaged-sessions metric in insights.mjs; this flag is the UA-specific cleanup
// so even raw event/visitor totals exclude the known offender.
//
// MONOTONIC: only promotes is_bot false→true. It never clears a flag, so the
// header-level ingest pre-tag (lib/neonEvents.mjs) is preserved and re-runs are
// safe/idempotent. Run: `npm run flag:bots`  (optional `-- --days 60` to scope;
// `-- --dry-run` to preview counts without writing).

import pg from 'pg';

const ET = `event_at AT TIME ZONE 'America/New_York'`;
const NOW_ET = `(now() AT TIME ZONE 'America/New_York')`;

const argNum = (flag, def) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? Number(process.argv[i + 1]) : def;
};
const DRY = process.argv.includes('--dry-run');
const DAYS = argNum('--days', 0); // 0 = all history

if (!process.env.DATABASE_URL) {
  console.error('✖ DATABASE_URL is not set. Add it to .env.local (Neon pooled connection string).');
  process.exit(1);
}

// Window predicate reused by the count + update passes so they always agree.
const windowClause = DAYS > 0 ? `AND ${ET} >= ${NOW_ET} - interval '${DAYS} days'` : '';

// A row is bot IF it is the sole event of its session AND is an unengaged
// page_view from a desktop-Linux Chromium UA. `single AS (…)` are the
// exactly-one-event sessions; the FROM/WHERE fragment applies the per-row test.
// Each query below prepends its own SELECT list to this shared body, so the
// preview and the UPDATE always match exactly the same rows.
const matchBody = `
  FROM analytics_events e
  JOIN (
    SELECT session_id
    FROM analytics_events
    WHERE session_id <> ''
    GROUP BY session_id
    HAVING count(*) = 1
  ) s USING (session_id)
  WHERE e.event_type = 'page_view'
    AND e.user_agent ILIKE '%X11; Linux x86_64%'
    AND e.user_agent ILIKE '%Chrome/%'
    AND e.is_bot = false
    ${windowClause}
`;

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  keepAlive: true,
  // These passes are set-based aggregates over the whole event table; cap them so a
  // pathological plan fails in minutes rather than sitting on the connection until
  // something upstream drops it.
  statement_timeout: 10 * 60_000,
});

// A pg.Client with no 'error' listener turns a dropped socket into an unhandled
// 'error' event, which kills the process outright — that is exactly how the Sheets
// sync used to lose an entire run ("Connection terminated unexpectedly"). Listening
// turns it into an ordinary, reportable failure with a non-zero exit. This pass is
// idempotent and monotonic (is_bot only ever goes false→true), so the next scheduled
// run simply picks up where this one stopped.
client.on('error', (e) => {
  console.error('flag-bots: database connection error —', e.message);
  process.exitCode = 1;
});

async function main() {
  await client.connect();
  console.log(`\nflag-bots — ${DRY ? 'DRY RUN (no writes)' : 'LIVE'} — scope: ${DAYS > 0 ? DAYS + 'd' : 'all history'}`);

  // Preview: how many NEW rows this run would promote (is_bot currently false).
  const preview = await client.query(
    `SELECT to_char(${ET}, 'YYYY-MM-DD') AS day, count(*)::int AS newly_flagged
     ${matchBody}
     GROUP BY 1 ORDER BY 1 DESC LIMIT 30`);
  const totalNew = preview.rows.reduce((n, r) => n + r.newly_flagged, 0);
  console.log(`\nWould newly flag ${totalNew} rows. By day (latest 30):`);
  console.table(preview.rows);

  if (DRY) {
    console.log('\nDry run — no changes written.');
  } else {
    const upd = await client.query(
      `UPDATE analytics_events t SET is_bot = true
       WHERE t.id IN ( SELECT e.id ${matchBody} )`);
    console.log(`\n✓ Promoted ${upd.rowCount} rows to is_bot = true.`);
  }

  // Standing totals so a re-run shows the cumulative picture.
  const totals = await client.query(`
    SELECT
      count(*) FILTER (WHERE is_bot) AS bot_rows,
      count(*) FILTER (WHERE NOT is_bot) AS human_rows,
      round(100.0 * count(*) FILTER (WHERE is_bot) / nullif(count(*),0), 1) AS bot_pct
    FROM analytics_events`);
  console.log('\nStanding totals (all history):');
  console.table(totals.rows);

  await client.end();
  console.log('\nDone.\n');
}

process.on('unhandledRejection', (e) => {
  console.error('flag-bots: unhandled rejection —', e);
  process.exit(1);
});

main().catch(async (e) => {
  console.error('flag-bots failed:', e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
