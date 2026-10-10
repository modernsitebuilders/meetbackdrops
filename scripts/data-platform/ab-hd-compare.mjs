// scripts/data-platform/ab-hd-compare.mjs
//
// Readout for the HD comparison-hero A/B test (lib/abTest.js).
// Run: `npm run ab:hd-compare`
//
// Arms come from `hd_compare_ab_exposure` events (filename = hero_shown|hero_hidden),
// one row per visitor per category per session. Visitors are bucketed by their FIRST
// exposure; outcomes are counted only AFTER that exposure so pre-test behaviour can't
// leak in. Primary metrics are the high-frequency ones (reached /hd, engaged an HD
// product, started checkout) because purchases alone are ~0.1% and won't power a test.

import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const SQL = `
WITH exp AS (
  SELECT visitor_id, filename AS arm, min(event_at) AS t0
  FROM analytics_events
  WHERE event_type = 'hd_compare_ab_exposure'
    AND coalesce(is_bot, false) = false
    AND visitor_id NOT IN ('unknown', '')
    AND user_agent NOT ILIKE '%localhost%'
  GROUP BY 1, 2
),
-- A visitor stored in only one arm (localStorage is sticky). If a rare visitor shows
-- up in both, drop them rather than guess.
clean AS (
  SELECT visitor_id, min(arm) AS arm, min(t0) AS t0
  FROM exp GROUP BY 1 HAVING count(DISTINCT arm) = 1
),
o AS (
  SELECT c.arm, c.visitor_id,
    bool_or(e.event_type = 'page_view' AND e.filename = '/hd')                                   AS reached_hd,
    bool_or(e.event_type IN ('hd_focus_entered','hd_preview_opened','hd_pack_selected','hd_image_selected')) AS engaged_hd,
    bool_or(e.event_type = 'hd_checkout_initiated')                                              AS checkout,
    bool_or(e.event_type = 'hd_purchase')                                                        AS bought,
    bool_or(e.event_type IN ('cat_image_download','modal_download'))                             AS free_dl
  FROM clean c
  LEFT JOIN analytics_events e
    ON e.visitor_id = c.visitor_id AND e.event_at >= c.t0
   AND e.event_at < c.t0 + interval '14 days'
  GROUP BY 1, 2
)
SELECT arm, count(*) AS visitors,
  count(*) FILTER (WHERE free_dl)    AS free_dl,
  count(*) FILTER (WHERE reached_hd) AS reached_hd,
  count(*) FILTER (WHERE engaged_hd) AS engaged_hd,
  count(*) FILTER (WHERE checkout)   AS checkout,
  count(*) FILTER (WHERE bought)     AS bought
FROM o GROUP BY 1 ORDER BY 1`;

const { rows } = await pool.query(SQL);
await pool.end();

if (!rows.length) {
  console.log('No exposure events yet. (Needs the deploy + traffic.)');
  process.exit(0);
}

const pct = (n, d) => (d ? ((100 * n) / d).toFixed(2) + '%' : '—');
const table = rows.map((r) => {
  const v = Number(r.visitors);
  return {
    arm: r.arm, visitors: v,
    free_dl: `${r.free_dl} (${pct(r.free_dl, v)})`,
    reached_hd: `${r.reached_hd} (${pct(r.reached_hd, v)})`,
    engaged_hd: `${r.engaged_hd} (${pct(r.engaged_hd, v)})`,
    checkout: `${r.checkout} (${pct(r.checkout, v)})`,
    bought: `${r.bought} (${pct(r.bought, v)})`,
  };
});
console.table(table);

// Two-proportion z-test on the primary metric (reached /hd) — a sanity check, not gospel.
const a = rows.find((r) => r.arm === 'hero_shown');
const b = rows.find((r) => r.arm === 'hero_hidden');
if (a && b) {
  const n1 = Number(a.visitors), n2 = Number(b.visitors);
  const x1 = Number(a.reached_hd), x2 = Number(b.reached_hd);
  const p = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  const z = se ? (x1 / n1 - x2 / n2) / se : 0;
  console.log(`reached_hd: shown ${pct(x1, n1)} vs hidden ${pct(x2, n2)}  z=${z.toFixed(2)} ` +
    `(|z|>1.96 ≈ significant at 95%)`);
}
