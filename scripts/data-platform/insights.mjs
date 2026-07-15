// scripts/data-platform/insights.mjs
//
// Reusable analytics dashboard over the Neon mirror of the first-party event log.
// Run: `npm run insights`  (loads DATABASE_URL from .env.local via the npm script)
//
// ⚠️ TIMEZONE: Neon's session TZ is UTC, but the business (and the Google Sheet
// system of record) is US Eastern. Every day/week/hour rollup here buckets with
// `event_at AT TIME ZONE 'America/New_York'` so calendar boundaries match ET.
// Do NOT use a bare `date_trunc('day', event_at)` — that buckets in UTC and
// spills post-8pm-ET activity into the next day (the "data for tomorrow" bug).
//
// "Downloads" = any successful image use across surfaces (free download variants,
// in-Zoom apply, Meet add-on, email-bonus, free-sample), mirroring DOWNLOAD_EVENTS
// in lib/analyticsNormalize.js. "Revenue" = the money events in REVENUE_EVENTS
// there (kept separate — their filename is a product-id list, not a per-image use).
// Keep DL and REV below in sync with those two sets.

import pg from 'pg';

const ET = `event_at AT TIME ZONE 'America/New_York'`;
const NOW_ET = `(now() AT TIME ZONE 'America/New_York')`;
// Mirror of DOWNLOAD_EVENTS (lib/analyticsNormalize.js).
const DL = `('download','cat_image_download','modal_download','zoom_apply','meet_download','email_bonus_download','free_sample_download')`;
// Mirror of REVENUE_EVENTS (lib/analyticsNormalize.js).
const REV = `('hd_purchase','hd_subscription','license_purchase')`;

// Optional overrides: `npm run insights -- --days 60`
const arg = (flag, def) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? Number(process.argv[i + 1]) : def;
};
const WINDOW = arg('--days', 90);      // window for the "recent" analytical sections
const DAILY_DAYS = arg('--daily', 21); // window for the day-by-day pulse

if (!process.env.DATABASE_URL) {
  console.error('✖ DATABASE_URL is not set. Add it to .env.local (Neon pooled connection string).');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function run(label, sql) {
  try {
    const { rows } = await client.query(sql);
    console.log(`\n===== ${label} =====`);
    if (!rows.length) console.log('(no rows)');
    else console.table(rows);
  } catch (e) {
    console.log(`\n===== ${label} =====\n  ERROR: ${e.message}`);
  }
}

async function main() {
  await client.connect();
  console.log(`\nMeetBackdrops analytics — ET-bucketed. Recent window: ${WINDOW}d. Generated ${new Date().toISOString()}`);

  await run('Coverage & date range (ET)', `
    SELECT count(*) AS events,
      to_char(min(${ET}), 'YYYY-MM-DD') AS first_day,
      to_char(max(${ET}), 'YYYY-MM-DD') AS last_day,
      count(DISTINCT session_id) AS sessions,
      count(DISTINCT visitor_id) AS visitors
    FROM analytics_events`);

  await run(`Daily pulse — ET (last ${DAILY_DAYS} days; newest may be partial)`, `
    SELECT to_char(date_trunc('day', ${ET}), 'YYYY-MM-DD') AS day,
      count(*) AS events,
      count(DISTINCT session_id) AS sessions,
      count(DISTINCT visitor_id) AS visitors,
      count(*) FILTER (WHERE event_type IN ${DL}) AS downloads
    FROM analytics_events
    WHERE ${ET} >= ${NOW_ET} - interval '${DAILY_DAYS} days'
    GROUP BY 1 ORDER BY 1 DESC`);

  await run('Weekly trend — ET (12 weeks, Monday-start; newest partial)', `
    SELECT to_char(date_trunc('week', ${ET}), 'YYYY-MM-DD') AS week_of,
      count(*) AS events,
      count(DISTINCT session_id) AS sessions,
      count(*) FILTER (WHERE event_type IN ${DL}) AS downloads
    FROM analytics_events
    WHERE ${ET} >= ${NOW_ET} - interval '84 days'
    GROUP BY 1 ORDER BY 1 DESC`);

  await run(`Hour-of-day — ET (last ${WINDOW}d)`, `
    SELECT extract(hour FROM ${ET})::int AS hr_et,
      count(*) AS events,
      count(*) FILTER (WHERE event_type IN ${DL}) AS downloads
    FROM analytics_events
    WHERE ${ET} >= ${NOW_ET} - interval '${WINDOW} days'
    GROUP BY 1 ORDER BY 1`);

  await run(`Funnel: view → preview → download (last ${WINDOW}d)`, `
    WITH e AS (SELECT event_type FROM analytics_events
               WHERE ${ET} >= ${NOW_ET} - interval '${WINDOW} days')
    SELECT count(*) FILTER (WHERE event_type='page_view') AS page_views,
      count(*) FILTER (WHERE event_type IN ('cat_image_preview','image_preview')) AS previews,
      count(*) FILTER (WHERE event_type IN ${DL}) AS downloads,
      count(*) FILTER (WHERE event_type='download_denied') AS denied,
      round(100.0*count(*) FILTER (WHERE event_type IN ('cat_image_preview','image_preview'))
        / nullif(count(*) FILTER (WHERE event_type='page_view'),0),1) AS view_to_preview_pct,
      round(100.0*count(*) FILTER (WHERE event_type IN ${DL})
        / nullif(count(*) FILTER (WHERE event_type IN ('cat_image_preview','image_preview')),0),1) AS preview_to_dl_pct
    FROM e`);

  await run(`Downloads by surface (last ${WINDOW}d)`, `
    SELECT event_type AS surface,
      count(*) AS uses,
      count(DISTINCT visitor_id) AS uniq_visitors
    FROM analytics_events
    WHERE event_type IN ${DL} AND ${ET} >= ${NOW_ET} - interval '${WINDOW} days'
    GROUP BY 1 ORDER BY uses DESC`);

  await run(`Revenue events (last ${WINDOW}d)`, `
    SELECT event_type,
      count(*) AS events,
      count(DISTINCT session_id) AS sessions,
      count(DISTINCT visitor_id) AS uniq_buyers,
      to_char(min(${ET}), 'YYYY-MM-DD') AS first_seen,
      to_char(max(${ET}), 'YYYY-MM-DD') AS last_seen
    FROM analytics_events
    WHERE event_type IN ${REV} AND ${ET} >= ${NOW_ET} - interval '${WINDOW} days'
    GROUP BY 1 ORDER BY events DESC`);

  await run(`Revenue by day — ET (last ${DAILY_DAYS}d; only days with revenue)`, `
    SELECT to_char(date_trunc('day', ${ET}), 'YYYY-MM-DD') AS day,
      count(*) FILTER (WHERE event_type='hd_purchase') AS hd_purchase,
      count(*) FILTER (WHERE event_type='hd_subscription') AS hd_subscription,
      count(*) FILTER (WHERE event_type='license_purchase') AS license,
      count(*) AS total_revenue_events
    FROM analytics_events
    WHERE event_type IN ${REV} AND ${ET} >= ${NOW_ET} - interval '${DAILY_DAYS} days'
    GROUP BY 1 ORDER BY 1 DESC`);

  await run(`Purchase conversion — sessions → revenue (last ${WINDOW}d)`, `
    SELECT count(DISTINCT session_id) AS sessions,
      count(DISTINCT session_id) FILTER (WHERE event_type IN ${DL}) AS sessions_with_download,
      count(DISTINCT session_id) FILTER (WHERE event_type IN ${REV}) AS sessions_with_revenue,
      count(*) FILTER (WHERE event_type IN ${REV}) AS revenue_events,
      round(100.0*count(DISTINCT session_id) FILTER (WHERE event_type IN ${REV})
        / nullif(count(DISTINCT session_id),0),3) AS pct_sessions_converting
    FROM analytics_events
    WHERE ${ET} >= ${NOW_ET} - interval '${WINDOW} days'`);

  await run(`Category conversion (last ${WINDOW}d, >50 views)`, `
    SELECT category,
      count(*) FILTER (WHERE event_type='page_view') AS views,
      count(*) FILTER (WHERE event_type IN ${DL}) AS downloads,
      round(100.0*count(*) FILTER (WHERE event_type IN ${DL})
        / nullif(count(*) FILTER (WHERE event_type='page_view'),0),1) AS dl_per_100_views
    FROM analytics_events
    WHERE category IS NOT NULL AND ${ET} >= ${NOW_ET} - interval '${WINDOW} days'
    GROUP BY 1 HAVING count(*) FILTER (WHERE event_type='page_view') > 50
    ORDER BY dl_per_100_views DESC NULLS LAST`);

  await run(`Top 20 images by downloads (last ${WINDOW}d)`, `
    SELECT filename, category, count(*) AS downloads, count(DISTINCT visitor_id) AS uniq
    FROM analytics_events
    WHERE event_type IN ${DL} AND filename IS NOT NULL
      AND ${ET} >= ${NOW_ET} - interval '${WINDOW} days'
    GROUP BY 1,2 ORDER BY 3 DESC LIMIT 20`);

  await run(`Traffic sources by conversion (last ${WINDOW}d)`, `
    SELECT coalesce(nullif(original_source,''),'(none)') AS source,
      count(DISTINCT session_id) AS sessions,
      count(*) FILTER (WHERE event_type IN ${DL}) AS downloads,
      round(count(*) FILTER (WHERE event_type IN ${DL})::numeric
        / nullif(count(DISTINCT session_id),0),2) AS dl_per_session
    FROM analytics_events
    WHERE ${ET} >= ${NOW_ET} - interval '${WINDOW} days'
    GROUP BY 1 ORDER BY downloads DESC LIMIT 20`);

  await run(`LLM referral traffic (last ${WINDOW}d)`, `
    SELECT coalesce(nullif(original_source,''),'(none)') AS source,
      count(DISTINCT session_id) AS sessions,
      count(*) FILTER (WHERE event_type IN ${DL}) AS downloads
    FROM analytics_events
    WHERE ${ET} >= ${NOW_ET} - interval '${WINDOW} days'
      AND (original_source ILIKE '%chatgpt%' OR original_source ILIKE '%openai%'
        OR original_source ILIKE '%claude%' OR original_source ILIKE '%perplexity%'
        OR original_source ILIKE '%copilot%' OR original_source ILIKE '%gemini%')
    GROUP BY 1 ORDER BY sessions DESC`);

  await run('Reviews health (all time)', `
    SELECT status, count(*) AS n, round(avg(rating),2) AS avg_rating,
      to_char(min(review_at AT TIME ZONE 'America/New_York'),'YYYY-MM-DD') AS earliest,
      to_char(max(review_at AT TIME ZONE 'America/New_York'),'YYYY-MM-DD') AS latest
    FROM reviews GROUP BY 1 ORDER BY n DESC`);

  await run('B2B leads — real inbound first (branded + licensing)', `
    SELECT 'branded' AS campaign,
      to_char(inquiry_at AT TIME ZONE 'America/New_York','YYYY-MM-DD') AS day,
      company, role, team_size, timeline, left(use_case,40) AS use_case
    FROM branded_inquiries WHERE inquiry_at IS NOT NULL
    UNION ALL
    SELECT 'licensing',
      to_char(inquiry_at AT TIME ZONE 'America/New_York','YYYY-MM-DD'),
      company, role, team_size, timeline, left(use_case,40)
    FROM licensing_inquiries WHERE inquiry_at IS NOT NULL
    ORDER BY day DESC NULLS LAST LIMIT 25`);

  await client.end();
  console.log('\nDone.\n');
}

main().catch(async (e) => {
  console.error('insights failed:', e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
