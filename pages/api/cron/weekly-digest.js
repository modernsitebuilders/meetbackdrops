// pages/api/cron/weekly-digest.js
//
// Monday-morning email to the studio inbox: the past 7 days of money signals in
// one place — sales, branded inquiries, the download-limit wall (where free
// demand runs out), and the free-usage baseline. Individual sales and inquiries
// are also alerted in real time (lib/studioAlert.js); this is the weekly roll-up
// so trends and quiet weeks are visible too.
//
// Reads Neon (kept current by the 6-hourly sheet sync, so data is ≤6h stale) with
// bot traffic excluded. Vercel cron, Mondays 13:00 UTC (9am ET in summer, 8am in
// winter) — see vercel.json. Vercel sends `Authorization: Bearer $CRON_SECRET`.
// Manual run: curl -H "Authorization: Bearer $CRON_SECRET" https://meetbackdrops.com/api/cron/weekly-digest

import { neon } from '@neondatabase/serverless';
import { sendStudioAlert } from '../../../lib/studioAlert';

const DL = `('download','cat_image_download','modal_download','zoom_apply','meet_download','email_bonus_download','free_sample_download')`;
const REV = `('hd_purchase','hd_subscription','license_purchase')`;
const WEEK = `event_at >= now() - interval '7 days' AND NOT is_bot`;

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL not set' });
  }
  const sql = neon(process.env.DATABASE_URL);

  try {
    const [[usage], sales, wall, [branded], inquiries] = await Promise.all([
      sql.query(`
        SELECT count(DISTINCT session_id) FILTER (WHERE event_type = 'page_view') AS sessions,
               count(*) FILTER (WHERE event_type IN ${DL})                         AS downloads,
               count(DISTINCT visitor_id) FILTER (WHERE event_type IN ${DL})       AS downloaders
        FROM analytics_events WHERE ${WEEK}`),
      sql.query(`
        SELECT event_type, filename, to_char(event_at AT TIME ZONE 'America/New_York', 'Dy Mon DD') AS day
        FROM analytics_events WHERE ${WEEK} AND event_type IN ${REV}
        ORDER BY event_at`),
      sql.query(`
        SELECT event_type, coalesce(nullif(filename, ''), '-') AS variant,
               count(*) AS n, count(DISTINCT visitor_id) AS visitors
        FROM analytics_events
        WHERE ${WEEK} AND event_type IN ('rate_limit_hit','rate_limit_hd_click','rate_limit_bonus_submit','rate_limit_close')
        GROUP BY 1, 2 ORDER BY 1, 2`),
      sql.query(`
        SELECT count(*) FILTER (WHERE event_type = 'nav_branded_click')         AS nav_clicks,
               count(*) FILTER (WHERE event_type = 'branded_form_started')      AS started,
               count(*) FILTER (WHERE event_type = 'branded_inquiry_submitted') AS submitted,
               count(*) FILTER (WHERE event_type = 'branded_inquiry_failed')    AS failed
        FROM analytics_events WHERE ${WEEK}`),
      sql.query(`
        SELECT company, team_size, timeline FROM branded_inquiries
        WHERE coalesce(inquiry_at, created_at) >= now() - interval '7 days'
        ORDER BY coalesce(inquiry_at, created_at)`),
    ]);

    const label = { hd_purchase: 'HD', hd_subscription: 'HD subscription', license_purchase: 'License' };
    const wallRow = (type) => wall.filter((r) => r.event_type === type);
    const sum = (rows, k) => rows.reduce((n, r) => n + Number(r[k]), 0);
    const hits = wallRow('rate_limit_hit');

    const rows = [
      ['Sales', sales.length ? `${sales.length}` : 'none'],
      ['Branded inquiries', `${inquiries.length} (form: ${branded.started} started, ${branded.submitted} submitted, ${branded.failed} failed · ${branded.nav_clicks} nav clicks)`],
      ['Hit the download limit', `${sum(hits, 'visitors')} people, ${sum(hits, 'n')} times`],
      ['  → clicked HD from limit', sum(wallRow('rate_limit_hd_click'), 'n')],
      ['  → email for bonus', sum(wallRow('rate_limit_bonus_submit'), 'n')],
      ['  → closed', sum(wallRow('rate_limit_close'), 'n')],
      ['Sessions', usage.sessions],
      ['Downloads', `${usage.downloads} by ${usage.downloaders} people`],
    ];
    const blocks = [];
    if (sales.length) {
      blocks.push(['Sales this week', sales.map((s) => `${s.day} · ${label[s.event_type]} · ${s.filename}`).join('\n')]);
    }
    if (inquiries.length) {
      blocks.push(['Branded inquiries this week', inquiries.map((i) => `${i.company || '(no company)'} · ${i.team_size || '?'} · ${i.timeline || '?'}`).join('\n')]);
    }
    if (hits.length) {
      blocks.push(['Limit hits by offer shown', hits.map((h) => `${h.variant === 'hd_first' ? 'HD offer first (repeat hit)' : 'Email bonus first (first hit)'}: ${h.n} hits / ${h.visitors} people`).join('\n')]);
    }

    const result = await sendStudioAlert({
      subject: `MeetBackdrops weekly: ${sales.length} sale${sales.length === 1 ? '' : 's'}, ${inquiries.length} inquir${inquiries.length === 1 ? 'y' : 'ies'}, ${sum(hits, 'visitors')} hit the limit`,
      eyebrow: 'MeetBackdrops · Weekly digest · last 7 days',
      heading: 'Money signals this week',
      rows,
      blocks,
      footer: 'Bot traffic excluded. Data is from Neon (synced every 6 hours). Individual sales and inquiries are emailed as they happen.',
    });
    return res.status(result.ok ? 200 : 502).json({ sent: result.ok, reason: result.reason });
  } catch (err) {
    console.error('[weekly-digest] failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
