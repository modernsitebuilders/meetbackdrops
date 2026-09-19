// scripts/data-platform/flag-bots.mjs
//
// Authoritative, re-runnable classifier for the behavioral crawler that inflated
// sessions/visitors in Jul–Aug 2026 (see lib/migrations/db/006_analytics_is_bot.sql).
// It decides ONE verdict per SESSION and writes it to every row of that session,
// so a session is never half-flagged:
//
//   HUMAN — the session is engaged: ≥2 events OR ≥1 download (the same ENGAGED
//           definition insights.mjs uses). Every row → is_bot = false. This also
//           CLEARS the header-level ingest pre-tag (lib/neonEvents.mjs), which fires
//           on a real Linux-desktop visitor's landing page_view just as it does on
//           the crawler — only behavior after landing tells them apart.
//   BOT   — the session is NOT engaged (a single event) AND either
//             • that event is a page_view from a desktop-Linux Chromium UA
//               (`X11; Linux x86_64` + `Chrome/`) — the crawler's fingerprint, or
//             • any row of it carries the ingest pre-tag.
//           Every row → is_bot = true.
//   (anything else) — left exactly as it is.
//
// Precision-first: the ONLY real users the BOT rule can touch are Linux-desktop
// bouncers (one page, then gone) — the lowest-value, fully recoverable segment.
// Any visitor who does a second thing is HUMAN by construction.
//
// Session counts assume analytics_events holds no duplicate events. That held only
// after scripts/data-platform/dedupe-analytics.mjs (Sept 2026): before it, events
// moved to Analytics_Archive existed twice, so each one-hit crawler session looked
// like a 2-event engaged session and escaped this classifier.
//
// Idempotent: re-runs only touch rows whose verdict changed. Run: `npm run flag:bots`
// (optional `-- --days 60` to scope to sessions active in that window;
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

// Sessions with any event inside the window (all sessions when --days is unset).
// The verdict itself always looks at the session's FULL history, so a session
// straddling the window edge is still judged on everything it did.
const windowClause = DAYS > 0
  ? `AND session_id IN (SELECT session_id FROM analytics_events WHERE ${ET} >= ${NOW_ET} - interval '${DAYS} days')`
  : '';

// Mirror of DOWNLOAD_EVENTS (lib/analyticsNormalize.js) — same as insights.mjs.
const DL = `('download','cat_image_download','modal_download','zoom_apply','meet_download','email_bonus_download','free_sample_download')`;

// Per-session verdict: true = bot, false = human, NULL = no opinion (leave rows as-is).
// Shared by the preview and the UPDATE so both always act on exactly the same rows.
const verdictCte = `
  WITH sess AS (
    SELECT session_id,
      count(*) AS n_ev,
      count(*) FILTER (WHERE event_type IN ${DL}) AS n_dl,
      bool_or(is_bot) AS any_pretag,
      bool_or(event_type = 'page_view'
              AND user_agent ILIKE '%X11; Linux x86_64%'
              AND user_agent ILIKE '%Chrome/%') AS fingerprint
    FROM analytics_events
    WHERE session_id <> '' ${windowClause}
    GROUP BY session_id
  ),
  verdict AS (
    SELECT session_id,
      CASE WHEN n_ev >= 2 OR n_dl >= 1 THEN false
           WHEN fingerprint OR any_pretag THEN true
      END AS bot
    FROM sess
  )
`;
const changedRows = `
  FROM analytics_events e
  JOIN verdict v USING (session_id)
  WHERE v.bot IS NOT NULL AND e.is_bot IS DISTINCT FROM v.bot
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
// idempotent (it writes each session's verdict), so the next scheduled run simply
// picks up where this one stopped.
client.on('error', (e) => {
  console.error('flag-bots: database connection error —', e.message);
  process.exitCode = 1;
});

async function main() {
  await client.connect();
  console.log(`\nflag-bots — ${DRY ? 'DRY RUN (no writes)' : 'LIVE'} — scope: ${DAYS > 0 ? DAYS + 'd' : 'all history'}`);

  // Preview: which rows this run would change, in total and by day.
  const cols = `count(*) FILTER (WHERE v.bot)::int AS to_bot, count(*) FILTER (WHERE NOT v.bot)::int AS to_human`;
  const [{ to_bot, to_human }] = (await client.query(`${verdictCte} SELECT ${cols} ${changedRows}`)).rows;
  const byDay = await client.query(
    `${verdictCte} SELECT to_char(${ET}, 'YYYY-MM-DD') AS day, ${cols} ${changedRows}
     GROUP BY 1 ORDER BY 1 DESC LIMIT 30`);
  console.log(`\nWould change ${to_bot + to_human} rows: ${to_bot} → bot, ` +
    `${to_human} → human (pre-tag cleared on engaged sessions). By day (latest 30):`);
  console.table(byDay.rows);

  if (DRY) {
    console.log('\nDry run — no changes written.');
  } else {
    const upd = await client.query(
      `${verdictCte}
       UPDATE analytics_events t SET is_bot = v.bot
       FROM verdict v
       WHERE t.session_id = v.session_id
         AND v.bot IS NOT NULL AND t.is_bot IS DISTINCT FROM v.bot`);
    console.log(`\n✓ Updated ${upd.rowCount} rows to their session's verdict.`);
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
