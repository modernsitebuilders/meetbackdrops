// /api/admin/insights?days=30
//
// One-shot data feed for the /admin insights dashboard. Reads the Neon mirror of
// the analytics sheet (kept current by the 4x/day sync, so it lags up to ~6h) and,
// when a Stripe key is present, real charge totals from Stripe.
//
// Conventions shared with scripts/data-platform/insights.mjs:
//  - human traffic only (is_bot = false)
//  - "download" = DOWNLOAD_EVENTS, "revenue" = REVENUE_EVENTS (lib/analyticsNormalize.js)
//  - "engaged" session = >=2 events OR >=1 download
//  - day/hour buckets in US Eastern
//
// Windows are anchored on the newest event in Neon (not wall-clock now), so the
// current and previous periods are the same length even though the sync lags.
//
// Auth: open in `next dev`. In production it requires ADMIN_DASHBOARD_KEY (sent as
// the x-admin-key header by the page); without that env var it refuses to serve.

import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';

const rawManifest = require('../../../image-pipeline/final_manifest.json');

// Mirror of DOWNLOAD_EVENTS / REVENUE_EVENTS in lib/analyticsNormalize.js — keep in sync.
const DL = `('download','cat_image_download','modal_download','zoom_apply','meet_download','email_bonus_download','free_sample_download')`;
const REV = `('hd_purchase','hd_subscription','license_purchase','logo_purchase')`;
const PREVIEW = `('cat_image_preview','image_preview','hd_preview_opened')`;
const HD_INTEREST = `('cat_page_hd_compare_clicked','slider_used','hd_preview_opened','preview_modal_hd_button_click','cat_hd_badge_click','nav_hd_click','hub_hd_compare_click','post_compare_cta_click','rate_limit_hd_click','hd_image_selected','hd_pack_selected','popular_hd_click','blog_hd_cta_clicked','sub_cta_click')`;
const ET = `(event_at AT TIME ZONE 'America/New_York')`;

const ALLOWED_DAYS = [7, 14, 30, 90, 180, 365];
// Entry pages whose job isn't a free download (sales/legal/utility) — never flag as leaks.
const NON_DOWNLOAD_PAGES = /^\/(hd|license|terms|privacy|contact|branded-backgrounds|image-lookup)(\/|$|\?)/;

// Per-session rollup over [lo, hi). First-event attributes (source, landing page,
// device, visitor type) come from DISTINCT ON so a session is attributed once.
const sessionsCte = (lo, hi) => `
  ev AS (
    SELECT * FROM analytics_events
    WHERE is_bot = false AND event_at > ${lo} AND event_at <= ${hi}
      AND session_id IS NOT NULL AND session_id <> ''
  ),
  first_ev AS (
    SELECT DISTINCT ON (session_id) session_id, original_source, landing_page, user_agent, visitor_type, event_at AS started_at
    FROM ev ORDER BY session_id, event_at
  ),
  agg AS (
    SELECT session_id, min(visitor_id) AS visitor_id, count(*) AS n_ev,
      count(*) FILTER (WHERE event_type IN ${DL}) AS n_dl,
      count(*) FILTER (WHERE event_type IN ${PREVIEW}) AS n_pv,
      count(*) FILTER (WHERE event_type IN ${HD_INTEREST}) AS n_hd,
      count(*) FILTER (WHERE event_type = 'hd_checkout_initiated' OR event_type IN ${REV}) AS n_co,
      count(*) FILTER (WHERE event_type IN ${REV}) AS n_rev,
      count(*) FILTER (WHERE event_type = 'rate_limit_hit') AS n_wall
    FROM ev GROUP BY session_id
  ),
  sess AS (
    SELECT a.*, f.landing_page, f.visitor_type, f.started_at,
      ${SOURCE_GROUP('f.original_source')} AS source_group,
      lower(coalesce(nullif(f.original_source,''),'direct')) AS source_raw,
      ${DEVICE('f.user_agent')} AS device,
      (a.n_ev >= 2 OR a.n_dl >= 1) AS engaged
    FROM agg a JOIN first_ev f USING (session_id)
  )`;

function SOURCE_GROUP(col) {
  return `CASE
    WHEN ${col} IS NULL OR ${col} = '' OR lower(${col}) = 'direct' THEN 'Direct'
    WHEN lower(${col}) ~ '(chatgpt|openai|perplexity|claude|copilot|gemini|doubao|deepseek|you\\.com|phind)' THEN 'AI assistants'
    WHEN lower(${col}) ~ 'google' THEN 'Google'
    WHEN lower(${col}) ~ 'bing' THEN 'Bing'
    WHEN lower(${col}) ~ '(duckduckgo|yahoo|brave|ecosia|yandex|baidu|startpage|qwant|naver)' THEN 'Other search'
    WHEN lower(${col}) ~ '(teams|microsoft|office|outlook)' THEN 'Microsoft Teams / Office'
    WHEN lower(${col}) ~ '(pinterest|facebook|linkedin|reddit|twitter|t\\.co|instagram|youtube)' THEN 'Social'
    WHEN lower(${col}) ~ 'meetbackdrops' THEN 'Internal'
    ELSE 'Other referrals' END`;
}

function DEVICE(col) {
  return `CASE
    WHEN ${col} ~* '(ipad|tablet)' THEN 'Tablet'
    WHEN ${col} ~* '(mobi|iphone|android)' THEN 'Mobile'
    ELSE 'Desktop' END`;
}

// --- manifest lookups (download filename -> image) ---
const bySlug = new Map(rawManifest.map((m) => [m.slug, m]));
function imageFromFilename(fn) {
  if (!fn) return null;
  const slug = fn.replace(/^MeetBackdrops-/, '').replace(/\.(png|webp|jpg)$/i, '').replace(/-hd$/, '');
  const m = bySlug.get(slug);
  if (!m) return { slug, title: slug, category: null, thumb: null, href: null };
  const title = (m.title || slug).split(/\s+[—|]\s+/)[0];
  return {
    slug,
    title,
    category: m.category,
    hd: !!m.hd,
    addedAt: m.addedAt || null,
    thumb: `https://assets.streambackdrops.com/webp/${m.folder || m.category}/${m.image_webp}`,
    href: `/category/${m.category}/${m.slug}`,
  };
}

const cache = new Map(); // days -> { at, data }
const CACHE_MS = 5 * 60 * 1000;

export default async function handler(req, res) {
  if (process.env.NODE_ENV !== 'development') {
    const key = process.env.ADMIN_DASHBOARD_KEY;
    if (!key) {
      return res.status(503).json({ error: 'ADMIN_DASHBOARD_KEY is not set in this environment.', code: 'no_key_configured' });
    }
    if (req.headers['x-admin-key'] !== key) {
      return res.status(401).json({ error: 'Wrong or missing admin key.', code: 'unauthorized' });
    }
  }
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'DATABASE_URL is not set — the dashboard reads the Neon mirror.', code: 'no_db' });
  }

  const days = ALLOWED_DAYS.includes(Number(req.query.days)) ? Number(req.query.days) : 30;
  const fresh = req.query.fresh === '1';
  const hit = cache.get(days);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) {
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({ ...hit.data, cached: true });
  }

  try {
    const data = await build(days);
    cache.set(days, { at: Date.now(), data });
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json(data);
  } catch (e) {
    console.error('insights failed', e);
    return res.status(500).json({ error: e.message });
  }
}

async function build(days) {
  const sql = neon(process.env.DATABASE_URL);
  const q = async (text, params = []) => {
    try {
      return await sql.query(text, params);
    } catch (e) {
      e.message = `${e.message} — in query: ${text.trim().slice(0, 80)}`;
      throw e;
    }
  };

  const [{ anchor, first }] = await q(`SELECT max(event_at) AS anchor, min(event_at) AS first FROM analytics_events WHERE is_bot = false`);
  // The previous window is only a fair baseline if tracking already existed for all of it.
  const prevIncomplete = new Date(anchor).getTime() - 2 * days * 864e5 < new Date(first).getTime() - 864e5;
  const A = `'${new Date(anchor).toISOString()}'::timestamptz`;
  const cur = [`${A} - interval '${days} days'`, A];
  const prev = [`${A} - interval '${days * 2} days'`, `${A} - interval '${days} days'`];
  const bucket = days > 90 ? 'week' : 'day';

  const kpiSql = (lo, hi) => `WITH ${sessionsCte(lo, hi)}
    SELECT count(*)::int AS sessions,
      count(*) FILTER (WHERE engaged)::int AS engaged,
      count(DISTINCT visitor_id)::int AS visitors,
      coalesce(sum(n_dl),0)::int AS downloads,
      count(*) FILTER (WHERE n_dl > 0)::int AS dl_sessions,
      count(*) FILTER (WHERE n_pv > 0)::int AS pv_sessions,
      count(*) FILTER (WHERE n_hd > 0)::int AS hd_sessions,
      count(*) FILTER (WHERE n_co > 0)::int AS co_sessions,
      count(*) FILTER (WHERE n_rev > 0)::int AS rev_sessions,
      coalesce(sum(n_rev),0)::int AS sales,
      count(*) FILTER (WHERE n_wall > 0)::int AS wall_sessions,
      count(*) FILTER (WHERE visitor_type IS DISTINCT FROM 'new')::int AS returning_sessions
    FROM sess`;

  const seriesSql = (lo, hi) => `WITH ${sessionsCte(lo, hi)}
    SELECT to_char(date_trunc('${bucket}', started_at AT TIME ZONE 'America/New_York'), 'YYYY-MM-DD') AS d,
      count(*)::int AS sessions,
      count(*) FILTER (WHERE engaged)::int AS engaged,
      coalesce(sum(n_dl),0)::int AS downloads,
      count(*) FILTER (WHERE n_dl > 0)::int AS dl_sessions,
      coalesce(sum(n_rev),0)::int AS sales
    FROM sess GROUP BY 1 ORDER BY 1`;

  const groupSql = (lo, hi, col, limit = 50) => `WITH ${sessionsCte(lo, hi)}
    SELECT ${col} AS k, count(*)::int AS sessions,
      count(*) FILTER (WHERE engaged)::int AS engaged,
      count(*) FILTER (WHERE n_dl > 0)::int AS dl_sessions,
      coalesce(sum(n_dl),0)::int AS downloads,
      count(*) FILTER (WHERE n_hd > 0)::int AS hd_sessions,
      coalesce(sum(n_rev),0)::int AS sales
    FROM sess GROUP BY 1 ORDER BY sessions DESC LIMIT ${limit}`;

  const evWhere = (lo, hi) => `is_bot = false AND event_at > ${lo} AND event_at <= ${hi}`;

  const queries = {
    kCur: q(kpiSql(...cur)),
    kPrev: q(kpiSql(...prev)),
    sCur: q(seriesSql(...cur)),
    sPrev: q(seriesSql(...prev)),
    srcCur: q(groupSql(...cur, 'source_group')),
    srcPrev: q(groupSql(...prev, 'source_group')),
    rawSrc: q(groupSql(...cur, 'source_raw', 25)),
    landCur: q(groupSql(...cur, `coalesce(nullif(landing_page,''),'(unknown)')`, 25)),
    landPrev: q(groupSql(...prev, `coalesce(nullif(landing_page,''),'(unknown)')`, 200)),
    device: q(groupSql(...cur, 'device')),
    visitorType: q(groupSql(...cur, `CASE WHEN visitor_type = 'new' OR visitor_type IS NULL THEN 'New' ELSE 'Returning' END`)),
    catCur: q(`SELECT category AS k,
        count(*) FILTER (WHERE event_type = 'page_view')::int AS views,
        count(*) FILTER (WHERE event_type IN ${PREVIEW})::int AS previews,
        count(*) FILTER (WHERE event_type IN ${DL})::int AS downloads,
        count(DISTINCT visitor_id) FILTER (WHERE event_type IN ${DL})::int AS dl_visitors
      FROM analytics_events WHERE ${evWhere(...cur)} AND category ~ '^[a-z-]+$'
      GROUP BY 1 HAVING count(*) FILTER (WHERE event_type IN ${DL}) > 0 OR count(*) FILTER (WHERE event_type = 'page_view') > 5
      ORDER BY downloads DESC LIMIT 40`),
    catPrev: q(`SELECT category AS k, count(*) FILTER (WHERE event_type IN ${DL})::int AS downloads
      FROM analytics_events WHERE ${evWhere(...prev)} AND category ~ '^[a-z-]+$' GROUP BY 1`),
    imgCur: q(`SELECT filename AS k, count(*)::int AS downloads, count(DISTINCT visitor_id)::int AS visitors
      FROM analytics_events WHERE ${evWhere(...cur)} AND event_type IN ${DL} AND filename IS NOT NULL AND filename <> ''
      GROUP BY 1 ORDER BY 2 DESC`),
    imgPrev: q(`SELECT filename AS k, count(*)::int AS downloads
      FROM analytics_events WHERE ${evWhere(...prev)} AND event_type IN ${DL} AND filename IS NOT NULL
      GROUP BY 1 ORDER BY 2 DESC LIMIT 500`),
    heat: q(`SELECT extract(isodow FROM ${ET})::int AS dow, extract(hour FROM ${ET})::int AS hr,
        count(DISTINCT session_id)::int AS sessions,
        count(*) FILTER (WHERE event_type IN ${DL})::int AS downloads
      FROM analytics_events WHERE ${evWhere(...cur)} GROUP BY 1, 2`),
    surfaces: q(`SELECT event_type AS k, count(*)::int AS n FROM analytics_events
      WHERE ${evWhere(...cur)} AND event_type IN ${DL} GROUP BY 1 ORDER BY 2 DESC`),
    money: q(`SELECT event_type AS k, count(*)::int AS n, count(DISTINCT session_id)::int AS sessions
      FROM analytics_events WHERE ${evWhere(...cur)}
        AND (event_type IN ${REV} OR event_type IN ${HD_INTEREST} OR event_type IN
          ('hd_checkout_initiated','rate_limit_hit','rate_limit_close','rate_limit_bonus_submit','download_denied',
           'commercial_license_view','commercial_license_click','nav_branded_click','zoom_install_click','zoom_apply',
           'branded_form_started','branded_form_submitted','hd_compare_ab_exposure'))
      GROUP BY 1 ORDER BY 2 DESC`),
    lastSale: q(`SELECT max(event_at) AS at, count(*)::int AS total FROM analytics_events WHERE is_bot = false AND event_type IN ${REV}`),
    salesByMonth: q(`SELECT to_char(date_trunc('month', ${ET}), 'YYYY-MM') AS m, count(*)::int AS n
      FROM analytics_events WHERE is_bot = false AND event_type IN ${REV} AND event_at > ${A} - interval '12 months'
      GROUP BY 1 ORDER BY 1`),
    searches: q(`SELECT lower(trim(filename)) AS k, count(DISTINCT session_id)::int AS sessions,
        bool_or(event_type = 'search_zero_result') AS zero
      FROM analytics_events WHERE ${evWhere(...cur)} AND event_type IN ('search_query','search_zero_result')
        AND filename IS NOT NULL AND length(trim(filename)) > 1
      GROUP BY 1 ORDER BY 2 DESC LIMIT 60`),
    searchTotals: q(`SELECT count(DISTINCT session_id) FILTER (WHERE event_type = 'search_query')::int AS searching,
        count(DISTINCT session_id) FILTER (WHERE event_type = 'search_result_click')::int AS clicked,
        count(DISTINCT session_id) FILTER (WHERE event_type = 'search_zero_result')::int AS zero
      FROM analytics_events WHERE ${evWhere(...cur)}`),
    emails: q(`SELECT
        count(*) FILTER (WHERE captured_at > ${cur[0]} AND captured_at <= ${cur[1]})::int AS cur,
        count(*) FILTER (WHERE captured_at > ${prev[0]} AND captured_at <= ${prev[1]})::int AS prev,
        count(*)::int AS total
      FROM email_list`),
    emailSources: q(`SELECT coalesce(nullif(source,''),'(unknown)') AS k, count(*)::int AS n FROM email_list
      WHERE captured_at > ${cur[0]} AND captured_at <= ${cur[1]} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
    reviews: q(`SELECT name, rating, left(comment, 220) AS comment, status,
        to_char(review_at AT TIME ZONE 'America/New_York', 'YYYY-MM-DD') AS day
      FROM reviews WHERE review_at IS NOT NULL ORDER BY review_at DESC LIMIT 6`),
    reviewStats: q(`SELECT count(*)::int AS n, round(avg(rating)::numeric, 2)::float AS avg,
        count(*) FILTER (WHERE review_at > ${cur[0]})::int AS recent FROM reviews`),
    leads: q(`SELECT 'Branded' AS campaign, to_char(inquiry_at AT TIME ZONE 'America/New_York','YYYY-MM-DD') AS day,
        company, role, team_size, timeline, left(use_case, 120) AS use_case
      FROM branded_inquiries WHERE inquiry_at IS NOT NULL
      UNION ALL
      SELECT 'Licensing', to_char(inquiry_at AT TIME ZONE 'America/New_York','YYYY-MM-DD'),
        company, role, team_size, timeline, left(use_case, 120)
      FROM licensing_inquiries WHERE inquiry_at IS NOT NULL
      ORDER BY day DESC NULLS LAST LIMIT 8`),
    sync: q(`SELECT max(created_at) AS at FROM analytics_events`),
  };

  const keys = Object.keys(queries);
  const settled = await Promise.allSettled(keys.map((k) => queries[k]));
  const r = {};
  const errors = [];
  settled.forEach((s, i) => {
    if (s.status === 'fulfilled') r[keys[i]] = s.value;
    else { r[keys[i]] = []; errors.push(`${keys[i]}: ${s.reason?.message}`); }
  });

  const stripe = await stripeRevenue(days, anchor).catch((e) => ({ error: e.message }));

  // ---- shape ----
  const kpi = { cur: r.kCur[0] || {}, prev: r.kPrev[0] || {} };
  kpi.cur.emails = r.emails[0]?.cur ?? 0;
  kpi.prev.emails = r.emails[0]?.prev ?? 0;

  const prevBy = (rows) => Object.fromEntries(rows.map((x) => [x.k, x]));
  const srcPrev = prevBy(r.srcPrev);
  const sources = r.srcCur.map((x) => ({ ...x, prev: srcPrev[x.k]?.sessions ?? 0, prevEngaged: srcPrev[x.k]?.engaged ?? 0, prevDl: srcPrev[x.k]?.dl_sessions ?? 0 }));
  const landPrev = prevBy(r.landPrev);
  const landing = r.landCur.map((x) => ({ ...x, prev: landPrev[x.k]?.sessions ?? 0 }));
  const catPrev = prevBy(r.catPrev);
  const validCats = new Set(rawManifest.flatMap((m) => [m.category, m.folder]));
  const categories = r.catCur.filter((x) => validCats.has(x.k)).map((x) => ({ ...x, prev: catPrev[x.k]?.downloads ?? 0 }));

  // Images: collapse filename variants onto the manifest slug.
  const imgPrevMap = new Map();
  for (const x of r.imgPrev) {
    const im = imageFromFilename(x.k);
    imgPrevMap.set(im.slug, (imgPrevMap.get(im.slug) || 0) + x.downloads);
  }
  const imgMap = new Map();
  for (const x of r.imgCur) {
    const im = imageFromFilename(x.k);
    const e = imgMap.get(im.slug) || { ...im, downloads: 0, visitors: 0 };
    e.downloads += x.downloads;
    e.visitors += x.visitors;
    imgMap.set(im.slug, e);
  }
  const allImgs = [...imgMap.values()].sort((a, b) => b.downloads - a.downloads);
  const topImages = allImgs.slice(0, 15).map((x) => ({ ...x, prev: imgPrevMap.get(x.slug) || 0 }));
  const risers = allImgs
    .map((x) => ({ ...x, prev: imgPrevMap.get(x.slug) || 0 }))
    .filter((x) => x.downloads >= 4 && x.downloads - x.prev >= 3 && !topImages.some((t) => t.slug === x.slug))
    .sort((a, b) => (b.downloads - b.prev) - (a.downloads - a.prev))
    .slice(0, 6);

  // Catalog coverage + new-image performance.
  const anchorDate = new Date(anchor);
  const sinceIso = new Date(anchorDate.getTime() - days * 864e5).toISOString().slice(0, 10);
  const catalog = rawManifest.length;
  const downloadedSlugs = new Set(allImgs.filter((x) => bySlug.has(x.slug)).map((x) => x.slug));
  const newImgs = rawManifest.filter((m) => m.addedAt && m.addedAt > sinceIso);
  const newDownloaded = newImgs.filter((m) => downloadedSlugs.has(m.slug)).length;
  const newDownloads = newImgs.reduce((s, m) => s + (imgMap.get(m.slug)?.downloads || 0), 0);
  const content = {
    catalog,
    downloadedImages: downloadedSlugs.size,
    coveragePct: catalog ? (100 * downloadedSlugs.size) / catalog : 0,
    newImages: newImgs.length,
    newDownloaded,
    newDownloads,
    hdCount: rawManifest.filter((m) => m.hd).length,
    top10Share: (() => {
      const tot = allImgs.reduce((s, x) => s + x.downloads, 0);
      const top = allImgs.slice(0, 10).reduce((s, x) => s + x.downloads, 0);
      return tot ? (100 * top) / tot : 0;
    })(),
  };

  const searches = r.searches;
  const out = {
    days,
    bucket,
    anchor,
    dataStart: first,
    prevIncomplete,
    syncedAt: r.sync[0]?.at || null,
    generatedAt: new Date().toISOString(),
    kpi,
    series: { cur: r.sCur, prev: r.sPrev },
    sources,
    rawSources: r.rawSrc,
    landing,
    device: r.device,
    visitorType: r.visitorType,
    categories,
    topImages,
    risers,
    content,
    heat: r.heat,
    surfaces: r.surfaces,
    money: r.money,
    lastSale: r.lastSale[0] || null,
    salesByMonth: r.salesByMonth,
    stripe,
    search: { totals: r.searchTotals[0] || {}, top: searches.filter((s) => !s.zero).slice(0, 15), zero: searches.filter((s) => s.zero).slice(0, 15) },
    emails: { ...(r.emails[0] || {}), sources: r.emailSources },
    reviews: { stats: r.reviewStats[0] || {}, recent: r.reviews },
    leads: r.leads,
    errors,
  };
  out.insights = buildInsights(out);
  return out;
}

// Real money from Stripe: succeeded charges minus refunds, live mode only.
async function stripeRevenue(days, anchor) {
  const key = process.env.STRIPE_SECRET_KEY;
  // Reporting always reads the LIVE account (read-only), whatever STRIPE_MODE the
  // checkout flow is in — test-mode charges aren't revenue.
  if (!key || !/^(sk|rk)_live_/.test(key)) return { available: false };
  const stripe = new Stripe(key);
  const end = Math.floor(Date.now() / 1000);
  const yearAgo = end - 365 * 86400;
  const charges = [];
  for await (const c of stripe.charges.list({ created: { gte: yearAgo }, limit: 100 })) {
    if (c.status === 'succeeded' && c.livemode) charges.push(c);
    if (charges.length > 2000) break;
  }
  const net = (c) => (c.amount - (c.amount_refunded || 0)) / 100;
  const curLo = end - days * 86400;
  const prevLo = end - 2 * days * 86400;
  const sum = (lo, hi) => charges.filter((c) => c.created > lo && c.created <= hi).reduce((s, c) => s + net(c), 0);
  const cnt = (lo, hi) => charges.filter((c) => c.created > lo && c.created <= hi && net(c) > 0).length;
  const byMonth = {};
  for (const c of charges) {
    const m = new Date(c.created * 1000).toLocaleDateString('en-CA', { timeZone: 'America/New_York' }).slice(0, 7);
    byMonth[m] = (byMonth[m] || 0) + net(c);
  }
  const last = charges.reduce((mx, c) => (net(c) > 0 && c.created > mx ? c.created : mx), 0);
  return {
    available: true,
    currency: (charges[0]?.currency || 'usd').toUpperCase(),
    cur: sum(curLo, end),
    prev: sum(prevLo, curLo),
    curCount: cnt(curLo, end),
    prevCount: cnt(prevLo, curLo),
    year: sum(yearAgo, end),
    yearCount: charges.filter((c) => net(c) > 0).length,
    byMonth: Object.entries(byMonth).sort().map(([m, v]) => ({ m, v: Math.round(v * 100) / 100 })),
    lastChargeAt: last ? new Date(last * 1000).toISOString() : null,
  };
}

// Plain-English callouts, ranked roughly by importance. tone: good | warn | bad | info
function buildInsights(d) {
  const out = [];
  const { cur, prev } = d.kpi;
  const pct = (a, b) => (b ? ((a - b) / b) * 100 : null);
  const fmtPct = (v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`;
  const rate = (a, b) => (b ? (100 * a) / b : 0);
  const period = `${d.days} days`;

  const cmp = !d.prevIncomplete; // comparisons are meaningless before tracking began
  const eng = cmp ? pct(cur.engaged, prev.engaged) : null;
  if (eng !== null && Math.abs(eng) >= 5) {
    out.push({ tone: eng > 0 ? 'good' : 'bad', title: `Engaged sessions ${eng > 0 ? 'up' : 'down'} ${fmtPct(eng)}`,
      body: `${cur.engaged.toLocaleString()} engaged sessions in the last ${period} vs ${prev.engaged.toLocaleString()} the period before. Engaged = 2+ events or a download, so crawler waves don't move it.` });
  } else if (eng !== null) {
    out.push({ tone: 'info', title: 'Engaged traffic is flat', body: `${cur.engaged.toLocaleString()} engaged sessions (${fmtPct(eng || 0)} vs the previous ${period}).` });
  }

  const cr = rate(cur.dl_sessions, cur.sessions), crp = rate(prev.dl_sessions, prev.sessions);
  if (cmp && cur.sessions > 50 && Math.abs(cr - crp) >= 1) {
    out.push({ tone: cr > crp ? 'good' : 'bad', title: `Download conversion ${cr > crp ? 'improved' : 'slipped'} to ${cr.toFixed(1)}%`,
      body: `Share of sessions with at least one download moved ${(cr - crp).toFixed(1)} points (was ${crp.toFixed(1)}%).` });
  }

  // Sources: biggest mover by ENGAGED sessions (raw sessions swing with crawlers).
  const movers = d.sources.filter((s) => s.engaged + s.prevEngaged >= 30 && s.k !== 'Internal')
    .map((s) => ({ ...s, delta: s.engaged - s.prevEngaged, p: pct(s.engaged, s.prevEngaged) }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  if (cmp && movers[0] && Math.abs(movers[0].delta) >= 15) {
    const m = movers[0];
    out.push({ tone: m.delta > 0 ? 'good' : 'warn', title: `${m.k} drove the biggest change`,
      body: `${m.engaged.toLocaleString()} engaged sessions vs ${m.prevEngaged.toLocaleString()} (${m.delta > 0 ? '+' : ''}${m.delta.toLocaleString()}${m.p !== null && isFinite(m.p) ? `, ${fmtPct(m.p)}` : ''}).` });
  }
  // A big source that is mostly single-hit visits is probably crawlers, not people.
  const hollow = d.sources.filter((s) => s.sessions >= 200 && s.engaged / s.sessions < 0.3)
    .sort((a, b) => b.sessions - a.sessions)[0];
  if (hollow) {
    out.push({ tone: 'warn', title: `${hollow.k} traffic is mostly one-hit visits`,
      body: `Only ${rate(hollow.engaged, hollow.sessions).toFixed(0)}% of its ${hollow.sessions.toLocaleString()} sessions did more than land, so its raw growth is likely crawlers. Judge it by engaged sessions.` });
  }
  const ai = d.sources.find((s) => s.k === 'AI assistants');
  if (ai && ai.sessions >= 10) {
    const share = rate(ai.sessions, cur.sessions);
    out.push({ tone: 'info', title: `AI assistants send ${share.toFixed(1)}% of sessions`,
      body: `${ai.sessions.toLocaleString()} sessions from ChatGPT, Perplexity, and similar, converting at ${rate(ai.dl_sessions, ai.sessions).toFixed(1)}% (site average ${cr.toFixed(1)}%).` });
  }

  // Landing-page leak / star. Judged on ENGAGED sessions: one-hit crawler visits
  // pile onto some entry pages (notably /) and would otherwise flag a page as
  // leaky when its real visitors convert fine. /hd is a sales page, not a
  // download page, so it's excluded.
  const ecr = rate(cur.dl_sessions, cur.engaged);
  const lp = d.landing
    .filter((l) => l.engaged >= Math.max(30, cur.engaged * 0.02) && l.k !== '(unknown)' && !NON_DOWNLOAD_PAGES.test(l.k))
    .map((l) => ({ ...l, cr: rate(l.dl_sessions, l.engaged) }));
  const leak = [...lp].sort((a, b) => a.cr - b.cr)[0];
  if (leak && leak.cr < ecr * 0.6) {
    out.push({ tone: 'warn', title: `Leaky landing page: ${leak.k}`,
      body: `Only ${leak.cr.toFixed(1)}% of its ${leak.engaged.toLocaleString()} engaged visitors download (site average ${ecr.toFixed(1)}%). The best lever is usually moving backgrounds higher on the page.` });
  }
  const star = [...lp].sort((a, b) => b.cr - a.cr)[0];
  if (star && star.cr > ecr * 1.3 && star !== leak) {
    out.push({ tone: 'good', title: `Best-converting entry: ${star.k}`,
      body: `${star.cr.toFixed(1)}% of its ${star.engaged.toLocaleString()} engaged visitors download (site average ${ecr.toFixed(1)}%). Worth pointing more internal links and search intent here.` });
  }

  // Devices.
  const dev = Object.fromEntries(d.device.map((x) => [x.k, x]));
  if (dev.Mobile && dev.Desktop && dev.Mobile.sessions >= 30) {
    const m = rate(dev.Mobile.dl_sessions, dev.Mobile.sessions), dk = rate(dev.Desktop.dl_sessions, dev.Desktop.sessions);
    if (dk > m * 1.5) out.push({ tone: 'info', title: `Desktop converts ${(dk / Math.max(m, 0.1)).toFixed(1)}x better than mobile`,
      body: `Desktop ${dk.toFixed(1)}% vs mobile ${m.toFixed(1)}%. Expected — backgrounds are used on laptops — so mobile visitors are better targets for "send to desktop" or email capture than for downloads.` });
  }

  // Category movers.
  const cm = d.categories.filter((c) => c.downloads + c.prev >= 15)
    .map((c) => ({ ...c, delta: c.downloads - c.prev })).sort((a, b) => b.delta - a.delta);
  if (cmp && cm[0] && cm[0].delta >= 10) out.push({ tone: 'good', title: `Rising category: ${pretty(cm[0].k)}`,
    body: `${cm[0].downloads.toLocaleString()} downloads vs ${cm[0].prev.toLocaleString()} the previous ${period}.` });
  const fall = cm[cm.length - 1];
  if (cmp && fall && fall.delta <= -10 && fall !== cm[0]) out.push({ tone: 'warn', title: `Cooling category: ${pretty(fall.k)}`,
    body: `${fall.downloads.toLocaleString()} downloads vs ${fall.prev.toLocaleString()}. If it's seasonal, this is expected; otherwise check its rankings.` });

  // Money.
  if (d.stripe?.available) {
    const s = d.stripe;
    out.push({ tone: s.cur > 0 ? 'good' : 'info', title: s.cur > 0 ? `$${s.cur.toFixed(0)} revenue in the last ${period}` : `No revenue in the last ${period}`,
      body: `${s.curCount} paid charge${s.curCount === 1 ? '' : 's'} ${cmp ? ` (previous period: $${s.prev.toFixed(0)} from ${s.prevCount})` : ''}. Trailing 12 months: $${s.year.toFixed(0)}.${s.lastChargeAt ? ` Last sale ${daysAgo(s.lastChargeAt)}.` : ''}` });
  } else if (d.lastSale?.at) {
    out.push({ tone: 'info', title: `${cur.sales} sale${cur.sales === 1 ? '' : 's'} in the last ${period}`, body: `Last recorded sale ${daysAgo(d.lastSale.at)}.` });
  }
  if (cur.wall_sessions >= 10) {
    const hdClick = d.money.find((m) => m.k === 'rate_limit_hd_click')?.sessions || 0;
    out.push({ tone: 'info', title: `${cur.wall_sessions} sessions hit the download limit`,
      body: `Only ${hdClick} clicked through to HD from the limit wall (${rate(hdClick, cur.wall_sessions).toFixed(1)}%). The wall is friction more than a sales channel.` });
  }
  if (cur.hd_sessions > 0) {
    out.push({ tone: 'info', title: `${rate(cur.hd_sessions, cur.sessions).toFixed(1)}% of sessions showed HD interest`,
      body: `${cur.hd_sessions} sessions compared, previewed, or clicked toward HD; ${cur.co_sessions} reached checkout; ${cur.rev_sessions} bought.` });
  }

  // Search gaps — only repeat demand (>=3 sessions) counts.
  const gaps = d.search.zero.filter((z) => z.sessions >= 3);
  if (gaps.length) out.push({ tone: 'warn', title: `Search gaps with repeat demand`,
    body: `${gaps.slice(0, 5).map((g) => `"${g.k}" (${g.sessions})`).join(', ')} returned nothing. Check for a matching bug before treating it as a content gap.` });

  // Content.
  if (d.content.newImages > 0 && d.content.newImages < d.content.catalog * 0.5) out.push({ tone: d.content.newDownloaded / d.content.newImages > 0.3 ? 'good' : 'info',
    title: `${d.content.newImages} images added in this window`,
    body: `${d.content.newDownloaded} of them have been downloaded at least once (${d.content.newDownloads} downloads total).` });
  out.push({ tone: 'info', title: `Top 10 images = ${d.content.top10Share.toFixed(0)}% of downloads`,
    body: `${d.content.downloadedImages.toLocaleString()} of ${d.content.catalog.toLocaleString()} catalog images (${d.content.coveragePct.toFixed(0)}%) were downloaded at least once in this window.` });

  // Timing.
  if (d.heat.length) {
    const byDow = {};
    d.heat.forEach((h) => { byDow[h.dow] = (byDow[h.dow] || 0) + h.downloads; });
    const best = Object.entries(byDow).sort((a, b) => b[1] - a[1])[0];
    const names = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const byHr = {};
    d.heat.forEach((h) => { byHr[h.hr] = (byHr[h.hr] || 0) + h.downloads; });
    const bestHr = Object.entries(byHr).sort((a, b) => b[1] - a[1])[0];
    if (best && bestHr) out.push({ tone: 'info', title: `Peak demand: ${names[best[0]]}s around ${hr12(+bestHr[0])} ET`,
      body: `Good timing for publishing new images, posts, or pins.` });
  }

  if (d.emails.cur > 0 || d.emails.prev > 0) out.push({ tone: !cmp || d.emails.cur >= d.emails.prev ? 'good' : 'warn',
    title: `${d.emails.cur} new email signup${d.emails.cur === 1 ? '' : 's'}`, body: `${cmp ? `Previous period: ${d.emails.prev}. ` : ''}List size: ${d.emails.total.toLocaleString()}.` });

  return out;
}

function pretty(slug) {
  return String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function hr12(h) {
  return `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`;
}
function daysAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
}
