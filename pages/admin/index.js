// /admin — Studio insights dashboard (data: /api/admin/insights, Neon mirror + Stripe).
// The old dashboard links and maintenance actions live in the "Tools" section at the bottom.
import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  n0, compact, pct1, money, rate, pretty, monthLabel,
  Delta, Sparkline, TrendChart, Columns, BarRows, Funnel, SegmentedBar, Heatmap,
} from '../../components/admin/charts';

const KEY_STORE = 'meetbackdrops_admin_key';
const RANGES = [
  { d: 7, label: '7 days' },
  { d: 30, label: '30 days' },
  { d: 90, label: '90 days' },
  { d: 180, label: '6 months' },
  { d: 365, label: '12 months' },
];
const TREND_METRICS = [
  { field: 'engaged', label: 'Engaged sessions' },
  { field: 'sessions', label: 'All sessions' },
  { field: 'downloads', label: 'Downloads' },
  { field: 'dl_sessions', label: 'Sessions with a download' },
];
const TONE = {
  good: { icon: '▲', label: 'Good' },
  bad: { icon: '▼', label: 'Down' },
  warn: { icon: '!', label: 'Watch' },
  info: { icon: 'i', label: 'Note' },
};
const SURFACE_LABELS = {
  cat_image_download: 'Category grid',
  modal_download: 'Preview modal',
  download: 'Image page',
  zoom_apply: 'Applied in Zoom',
  meet_download: 'Meet add-on',
  email_bonus_download: 'Email bonus',
  free_sample_download: 'Free HD sample',
};
const MONEY_LABELS = {
  hd_compare_ab_exposure: 'Saw HD compare hero (A/B)',
  cat_page_hd_compare_clicked: 'Clicked “See the difference”',
  slider_used: 'Used the HD comparison slider',
  hd_preview_opened: 'Opened an HD preview',
  post_compare_cta_click: 'Clicked post-compare CTA',
  cat_hd_badge_click: 'Clicked an “also in HD” badge',
  preview_modal_hd_button_click: 'HD button in preview modal',
  nav_hd_click: 'HD link in nav',
  hub_hd_compare_click: 'Hub HD compare',
  hd_image_selected: 'Selected an HD image',
  hd_pack_selected: 'Selected an HD pack',
  hd_checkout_initiated: 'Started HD checkout',
  hd_purchase: 'HD purchase',
  hd_subscription: 'HD subscription',
  license_purchase: 'Commercial license purchase',
  logo_purchase: 'Logo background purchase',
  rate_limit_hit: 'Hit the download limit',
  rate_limit_close: 'Closed the limit wall',
  rate_limit_hd_click: 'Limit wall → HD',
  rate_limit_bonus_submit: 'Limit wall → email bonus',
  download_denied: 'Download denied',
  zoom_install_click: 'Clicked “Use in Zoom”',
  zoom_apply: 'Applied in Zoom',
  nav_branded_click: 'Branded link in nav',
  branded_form_started: 'Started branded form',
  branded_form_submitted: 'Submitted branded form',
  commercial_license_view: 'Viewed commercial license',
  commercial_license_click: 'Clicked commercial license',
  sub_cta_click: 'Subscription CTA',
  popular_hd_click: 'HD click on Most Popular',
  blog_hd_cta_clicked: 'HD CTA in blog',
};

export default function AdminInsights() {
  const [ok, setOk] = useState(false);
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needKey, setNeedKey] = useState(null);
  const [keyInput, setKeyInput] = useState('');
  const [trendField, setTrendField] = useState('engaged');
  const [heatField, setHeatField] = useState('downloads');

  useEffect(() => {
    // No client-side redirect: the insights API is the real gate (open in dev,
    // ADMIN_DASHBOARD_KEY in production), and the key prompt below handles it.
    setOk(true);
    const saved = Number(new URLSearchParams(window.location.search).get('days'));
    if (RANGES.some((r) => r.d === saved)) setDays(saved);
  }, []);

  const load = useCallback(async (d, fresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/insights?days=${d}${fresh ? '&fresh=1' : ''}`, {
        headers: { 'x-admin-key': localStorage.getItem(KEY_STORE) || '' },
      });
      const j = await res.json();
      if (res.status === 401 || j.code === 'no_key_configured') { setNeedKey(j.code); return; }
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setNeedKey(null);
      setData(j);
      // A successful load proves this is an admin browser: set the flag that keeps
      // this browser's own visits out of analytics and unlocks the older /admin/* pages.
      try { localStorage.setItem('meetbackdrops_admin', 'true'); } catch {}
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (ok) load(days); }, [ok, days, load]);

  const pickRange = (d) => {
    setDays(d);
    const u = new URL(window.location.href);
    u.searchParams.set('days', d);
    window.history.replaceState(null, '', u);
  };

  if (!ok) return null;

  return (
    <>
      <Head>
        <title>Studio Insights · MeetBackdrops Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ins">
        <header className="topbar">
          <div className="brand">
            <span className="wordmark">MeetBackdrops</span><span className="studio-tag">Studio</span>
            <span className="topbar-title">Insights</span>
          </div>
          <div className="filters" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button key={r.d} className={`chip ${days === r.d ? 'on' : ''}`} onClick={() => pickRange(r.d)} aria-pressed={days === r.d}>
                {days === r.d && <span aria-hidden="true">✓ </span>}{r.label}
              </button>
            ))}
            <button className="chip ghost" onClick={() => load(days, true)} disabled={loading}>{loading ? 'Loading…' : '↻ Refresh'}</button>
          </div>
        </header>

        {needKey && <KeyGate code={needKey} value={keyInput} onChange={setKeyInput} onSave={() => { localStorage.setItem(KEY_STORE, keyInput.trim()); load(days, true); }} />}
        {error && <div className="banner bad"><b>Couldn’t load insights:</b> {error}</div>}
        {!data && !error && !needKey && <div className="loading">Loading the last {days} days…</div>}

        {data && <Dashboard d={data} loading={loading} trendField={trendField} setTrendField={setTrendField} heatField={heatField} setHeatField={setHeatField} />}

        {data && <Tools />}
      </div>
    </>
  );
}

function KeyGate({ code, value, onChange, onSave }) {
  return (
    <div className="card keygate">
      <h2>Admin key needed</h2>
      {code === 'no_key_configured' ? (
        <p className="muted">This deployment has no <code>ADMIN_DASHBOARD_KEY</code> set, so the insights API is locked. Add it in Vercel → Settings → Environment Variables, redeploy, then enter it here.</p>
      ) : (
        <p className="muted">Enter the <code>ADMIN_DASHBOARD_KEY</code> value. It’s saved in this browser only.</p>
      )}
      <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="keyform">
        <input type="password" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Admin key" autoComplete="off" />
        <button className="chip on" type="submit">Unlock</button>
      </form>
    </div>
  );
}

function Dashboard({ d, loading, trendField, setTrendField, heatField, setHeatField }) {
  const { cur, prev } = d.kpi;
  const crCur = rate(cur.dl_sessions, cur.sessions);
  const crPrev = rate(prev.dl_sessions, prev.sessions);
  const spark = (f) => d.series.cur.map((r) => r[f] || 0);
  const trend = TREND_METRICS.find((m) => m.field === trendField);
  const periodName = d.days >= 180 ? `${Math.round(d.days / 30)} months` : `${d.days} days`;
  const s = d.stripe?.available ? d.stripe : null;

  const anchorEt = new Date(d.anchor).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <main style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }}>
      <p className="freshness muted small">
        Last {periodName} vs the {periodName} before · human traffic only (bots excluded) · data through <b className="ink">{anchorEt} ET</b>
        {' '}(Neon syncs from the Sheet every 6h){d.cached ? ' · cached' : ''}
        {d.prevIncomplete ? <span className="warn-text"> · Tracking starts {new Date(d.dataStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, so the previous period is only partly covered. Ignore its deltas.</span> : null}
        {d.errors?.length ? <span className="warn-text"> · {d.errors.length} query error(s): {d.errors.join('; ')}</span> : null}
      </p>

      {/* ---------- headline ---------- */}
      <section className="hero-row">
        <div className="card kpi-hero">
          <div className="tile-label">Downloads</div>
          <div className="hero-value">{n0(cur.downloads)}</div>
          <Delta cur={cur.downloads} prev={prev.downloads} />
          <div className="muted small" style={{ marginTop: 6 }}>{n0(cur.dl_sessions)} sessions downloaded at least one background</div>
          <div style={{ marginTop: "auto", paddingTop: 14 }}><Sparkline values={spark("downloads")} height={64} /></div>
        </div>
        <div className="tiles">
          <Tile label="Engaged sessions" value={n0(cur.engaged)} delta={<Delta cur={cur.engaged} prev={prev.engaged} />} spark={spark('engaged')}
            hint={`${pct1(rate(cur.engaged, cur.sessions))} of ${n0(cur.sessions)} sessions`} />
          <Tile label="Unique visitors" value={n0(cur.visitors)} delta={<Delta cur={cur.visitors} prev={prev.visitors} />} spark={spark('sessions')}
            hint={`${pct1(rate(cur.returning_sessions, cur.sessions))} of sessions are returning`} />
          <Tile label="Download conversion" value={pct1(crCur)} delta={<Delta cur={crCur} prev={crPrev} points />}
            spark={d.series.cur.map((r) => rate(r.dl_sessions, r.sessions))} hint="Sessions with ≥1 download" />
          {s ? (
            <Tile label="Revenue" value={money(s.cur, s.cur < 100 ? 2 : 0)} delta={<Delta cur={s.cur} prev={s.prev} />}
              hint={`${s.curCount} paid charge${s.curCount === 1 ? '' : 's'} · ${money(s.year)} trailing 12 mo`} />
          ) : (
            <Tile label="Sales" value={n0(cur.sales)} delta={<Delta cur={cur.sales} prev={prev.sales} />} hint="Revenue events (Stripe not connected)" />
          )}
          <Tile label="HD interest" value={n0(cur.hd_sessions)} delta={<Delta cur={cur.hd_sessions} prev={prev.hd_sessions} />}
            hint={`${pct1(rate(cur.hd_sessions, cur.sessions))} of sessions · ${cur.co_sessions} reached checkout · ${cur.rev_sessions} bought`} />
          <Tile label="Email signups" value={n0(cur.emails)} delta={<Delta cur={cur.emails} prev={prev.emails} />} hint={`${n0(d.emails.total)} on the list`} />
          <Tile label="Hit the download limit" value={n0(cur.wall_sessions)} delta={<Delta cur={cur.wall_sessions} prev={prev.wall_sessions} goodWhenUp={false} />}
            hint={`${pct1(rate(cur.wall_sessions, cur.dl_sessions))} of downloading sessions`} />
          <Tile label="Catalog coverage" value={`${d.content.coveragePct.toFixed(0)}%`}
            hint={`${n0(d.content.downloadedImages)} of ${n0(d.content.catalog)} images downloaded`} />
        </div>
      </section>

      {/* ---------- insights ---------- */}
      <section className="card">
        <SectionHead title="What changed" sub="Plain-English readout, generated from the numbers on this page" />
        <ul className="insights">
          {d.insights.map((i, k) => (
            <li key={k} className={`insight ${i.tone}`}>
              <span className={`badge ${i.tone}`} aria-label={TONE[i.tone].label}>{TONE[i.tone].icon}</span>
              <div><div className="insight-title">{i.title}</div><div className="insight-body">{i.body}</div></div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- trend ---------- */}
      <section className="card">
        <SectionHead title={`${trend.label} per ${d.bucket}`} sub="This period against the previous one, aligned day-for-day">
          <div className="seg-ctl" role="tablist">
            {TREND_METRICS.map((m) => (
              <button key={m.field} role="tab" aria-selected={trendField === m.field} className={trendField === m.field ? 'on' : ''} onClick={() => setTrendField(m.field)}>{m.label}</button>
            ))}
          </div>
        </SectionHead>
        <TrendChart key={`${trendField}-${d.days}`} cur={d.series.cur} prev={d.series.prev} field={trendField} label={trend.label} bucket={d.bucket} />
      </section>

      {/* ---------- funnel + audience split ---------- */}
      <section className="grid-2">
        <div className="card">
          <SectionHead title="Session funnel" sub="How far a visit gets. Each step counts sessions." />
          <Funnel steps={[
            { label: 'Sessions', value: cur.sessions },
            { label: 'Engaged', value: cur.engaged, hint: '2+ events or a download' },
            { label: 'Downloaded', value: cur.dl_sessions },
            { label: 'Showed HD interest', value: cur.hd_sessions },
            { label: 'Reached checkout', value: cur.co_sessions },
            { label: 'Bought', value: cur.rev_sessions },
          ]} />
        </div>
        <div className="card">
          <SectionHead title="Who’s visiting" sub="Share of sessions, and how each group converts" />
          <h4 className="mini-h">Device</h4>
          <SegmentedBar parts={orderParts(d.device, ['Desktop', 'Mobile', 'Tablet']).map((x, i) => ({ label: x.k, value: x.sessions, color: `var(--series-${i + 1})` }))} />
          <ConvList rows={d.device} />
          <h4 className="mini-h" style={{ marginTop: 22 }}>New vs returning</h4>
          <SegmentedBar parts={orderParts(d.visitorType, ['New', 'Returning']).map((x, i) => ({ label: x.k, value: x.sessions, color: `var(--series-${i + 1})` }))} />
          <ConvList rows={d.visitorType} />
        </div>
      </section>

      {/* ---------- sources ---------- */}
      <section className="card">
        <SectionHead title="Traffic sources" sub="Grouped by where the session started. Change is measured on engaged sessions, which crawlers can't inflate." />
        <SourcesTable rows={d.sources} total={cur.sessions} siteCr={crCur} />
        <details className="more">
          <summary>All referrers (ungrouped)</summary>
          <BarRows labelWidth={260} rows={d.rawSources.map((r) => ({ key: r.k, label: r.k, value: r.sessions, sub: `${pct1(rate(r.dl_sessions, r.sessions))} conv` }))} />
        </details>
      </section>

      {/* ---------- landing pages ---------- */}
      <section className="card">
        <SectionHead title="Landing pages" sub="Where sessions start. Conversion is downloads per engaged visitor, so crawler bounces don't distort it; flags compare against the site average." />
        <Expandable rows={d.landing} initial={12}>{(rows) => <LandingTable rows={rows} siteCr={rate(cur.dl_sessions, cur.engaged)} />}</Expandable>
      </section>

      {/* ---------- categories ---------- */}
      <section className="card">
        <SectionHead title="Categories" sub="Downloads by category, with page views and conversion" />
        <Expandable rows={d.categories} initial={14}>{(rows) => <CategoryTable rows={rows} />}</Expandable>
      </section>

      {/* ---------- images ---------- */}
      <section className="card">
        <SectionHead title="Top backgrounds" sub={`Most downloaded in the last ${periodName}. Top 10 take ${d.content.top10Share.toFixed(0)}% of all downloads.`} />
        <div className="img-grid">
          {d.topImages.map((im, i) => <ImageCard key={im.slug} im={im} rank={i + 1} />)}
        </div>
        {d.risers.length > 0 && (
          <>
            <h4 className="mini-h" style={{ marginTop: 26 }}>Fastest risers</h4>
            <div className="img-grid small-grid">
              {d.risers.map((im) => <ImageCard key={im.slug} im={im} />)}
            </div>
          </>
        )}
        <div className="content-strip">
          <div><b>{n0(d.content.newImages)}</b><span className="muted"> images added in this window</span></div>
          <div><b>{n0(d.content.newDownloaded)}</b><span className="muted"> of them downloaded</span></div>
          <div><b>{n0(d.content.newDownloads)}</b><span className="muted"> downloads of new images</span></div>
          <div><b>{n0(d.content.hdCount)}</b><span className="muted"> images also in HD</span></div>
        </div>
      </section>

      {/* ---------- timing ---------- */}
      <section className="card">
        <SectionHead title="When people come" sub="Weekday × hour, Eastern time">
          <div className="seg-ctl">
            {['downloads', 'sessions'].map((f) => (
              <button key={f} className={heatField === f ? 'on' : ''} onClick={() => setHeatField(f)}>{f === 'downloads' ? 'Downloads' : 'Sessions'}</button>
            ))}
          </div>
        </SectionHead>
        <Heatmap cells={d.heat} field={heatField} />
      </section>

      {/* ---------- money ---------- */}
      <section className="grid-2">
        <div className="card">
          <SectionHead title="Revenue by month" sub={s ? 'Stripe, net of refunds, trailing 12 months' : 'Revenue events from analytics (Stripe not connected)'} />
          {s ? (
            <>
              <div className="money-strip">
                <div><div className="tile-label">This period</div><div className="tile-value">{money(s.cur, 2)}</div></div>
                <div><div className="tile-label">Previous</div><div className="tile-value muted-val">{money(s.prev, 2)}</div></div>
                <div><div className="tile-label">12 months</div><div className="tile-value">{money(s.year, 2)}</div></div>
                <div><div className="tile-label">Last sale</div><div className="tile-value small-val">{s.lastChargeAt ? new Date(s.lastChargeAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '–'}</div></div>
              </div>
              <Columns data={fillMonths(s.byMonth, 'v', d.anchor)} format={(v) => money(v)} />
            </>
          ) : (
            <Columns data={fillMonths(d.salesByMonth, 'n', d.anchor)} />
          )}
        </div>
        <div className="card">
          <SectionHead title="HD & monetization signals" sub="Sessions that took each step this period" />
          <BarRows labelWidth={230} color="var(--series-2)"
            rows={d.money.filter((m) => MONEY_LABELS[m.k] && m.k !== 'hd_compare_ab_exposure').sort((a, b) => b.sessions - a.sessions).slice(0, 14)
              .map((m) => ({ key: m.k, label: MONEY_LABELS[m.k], value: m.sessions, title: `${m.k}: ${m.n} events / ${m.sessions} sessions` }))} />
        </div>
      </section>

      <section className="grid-2">
        <div className="card">
          <SectionHead title="Where downloads happen" sub="Download events by surface" />
          <BarRows rows={d.surfaces.map((x) => ({ key: x.k, label: SURFACE_LABELS[x.k] || x.k, value: x.n, sub: pct1(rate(x.n, cur.downloads)) }))} />
        </div>
        <div className="card">
          <SectionHead title="Site search" sub={`${n0(d.search.totals.searching)} sessions searched · ${pct1(rate(d.search.totals.clicked, d.search.totals.searching))} clicked a result · ${n0(d.search.totals.zero)} hit zero results`} />
          <div className="grid-2 tight">
            <div>
              <h4 className="mini-h">Top searches</h4>
              <BarRows labelWidth={130} rows={d.search.top.slice(0, 10).map((x) => ({ key: x.k, label: x.k, value: x.sessions }))} />
            </div>
            <div>
              <h4 className="mini-h">Zero-result searches</h4>
              {d.search.zero.length ? (
                <BarRows labelWidth={130} color="var(--status-serious)" rows={d.search.zero.slice(0, 10).map((x) => ({ key: x.k, label: x.k, value: x.sessions }))} />
              ) : <p className="muted small">None this period.</p>}
              <p className="muted small">Only repeat demand (3+ sessions) is worth acting on.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- people ---------- */}
      <section className="grid-3">
        <div className="card">
          <SectionHead title="Email list" sub={`${n0(d.emails.cur)} new this period · ${n0(d.emails.total)} total`} />
          {d.emails.sources?.length ? (
            <BarRows labelWidth={150} rows={groupEmailSources(d.emails.sources)} />
          ) : <p className="muted small">No signups this period.</p>}
        </div>
        <div className="card">
          <SectionHead title="Reviews" sub={`${n0(d.reviews.stats.n)} total · average ${d.reviews.stats.avg ?? '–'} ★ · ${n0(d.reviews.stats.recent)} this period`} />
          <ul className="reviews">
            {d.reviews.recent.map((r, i) => (
              <li key={i}>
                <div><span aria-label={`${r.rating} stars`}>{'★'.repeat(r.rating || 0)}<span className="muted">{'★'.repeat(Math.max(0, 5 - (r.rating || 0)))}</span></span> <b className="ink">{r.name || 'Anonymous'}</b> <span className="muted small">{r.day}{r.status && r.status !== 'approved' ? ` · ${r.status}` : ''}</span></div>
                {r.comment && <div className="muted small">{r.comment}</div>}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <SectionHead title="B2B leads" sub="Branded + licensing inquiries, newest first" />
          {d.leads.length ? (
            <ul className="reviews">
              {d.leads.map((l, i) => (
                <li key={i}>
                  <div><b className="ink">{l.company || '(no company)'}</b> <span className="pill">{l.campaign}</span> <span className="muted small">{l.day}</span></div>
                  <div className="muted small">{[l.role, l.team_size && `team ${l.team_size}`, l.timeline].filter(Boolean).join(' · ')}</div>
                  {l.use_case && <div className="muted small">{l.use_case}</div>}
                </li>
              ))}
            </ul>
          ) : <p className="muted small">No inquiries yet.</p>}
        </div>
      </section>
    </main>
  );
}

// ---------- pieces ----------
function SectionHead({ title, sub, children }) {
  return (
    <div className="section-head">
      <div><h2>{title}</h2>{sub && <p className="muted small">{sub}</p>}</div>
      {children}
    </div>
  );
}

function Tile({ label, value, delta, spark, hint }) {
  return (
    <div className="card tile">
      <div className="tile-label">{label}</div>
      <div className="tile-value">{value}</div>
      {delta}
      {hint && <div className="muted small tile-hint">{hint}</div>}
      {spark && <div style={{ marginTop: 'auto', paddingTop: 8 }}><Sparkline values={spark} height={26} /></div>}
    </div>
  );
}

function ConvList({ rows }) {
  return (
    <div className="table-scroll"><table className="tbl compact-tbl">
      <thead><tr><th /><th className="num">Sessions</th><th className="num">Engaged</th><th className="num">Download conv.</th><th className="num">HD interest</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.k}><td>{r.k}</td><td className="num">{n0(r.sessions)}</td><td className="num">{pct1(rate(r.engaged, r.sessions))}</td><td className="num"><b>{pct1(rate(r.dl_sessions, r.sessions))}</b></td><td className="num">{pct1(rate(r.hd_sessions, r.sessions))}</td></tr>
        ))}
      </tbody>
    </table></div>
  );
}

function Expandable({ rows, initial, children }) {
  const [all, setAll] = useState(false);
  return (
    <>
      {children(all ? rows : rows.slice(0, initial))}
      {rows.length > initial && (
        <button className="linkbtn more-btn" onClick={() => setAll((a) => !a)}>{all ? 'Show fewer' : `Show all ${rows.length}`}</button>
      )}
    </>
  );
}

function InlineBar({ value, max, color = 'var(--series-1)' }) {
  return (
    <div className="inline-bar"><div style={{ width: `${Math.max(0.5, (100 * value) / Math.max(max, 1))}%`, background: color }} /></div>
  );
}

function SourcesTable({ rows, total, siteCr }) {
  const max = Math.max(...rows.map((r) => r.sessions), 1);
  return (
    <div className="table-scroll">
      <table className="tbl">
        <thead>
          <tr><th>Source</th><th style={{ width: '28%' }}>Sessions</th><th className="num">Share</th><th className="num">Engaged</th><th className="num">Download conv.</th><th className="num">Downloads</th><th className="num">Sales</th><th className="num">Engaged vs prev</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const cr = rate(r.dl_sessions, r.sessions);
            return (
              <tr key={r.k}>
                <td><b className="ink">{r.k}</b></td>
                <td><div className="bar-cell"><InlineBar value={r.sessions} max={max} /><span>{n0(r.sessions)}</span></div></td>
                <td className="num">{pct1(rate(r.sessions, total))}</td>
                <td className="num">{pct1(rate(r.engaged, r.sessions))}</td>
                <td className="num"><b>{pct1(cr)}</b> {cr > siteCr * 1.25 && r.sessions >= 30 ? <span className="flag good">above avg</span> : cr < siteCr * 0.6 && r.sessions >= 30 ? <span className="flag warn">below avg</span> : null}</td>
                <td className="num">{n0(r.downloads)}</td>
                <td className="num">{r.sales ? n0(r.sales) : '–'}</td>
                <td className="num"><Delta cur={r.engaged} prev={r.prevEngaged} suffix="" /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LandingTable({ rows, siteCr }) {
  const max = Math.max(...rows.map((r) => r.sessions), 1);
  return (
    <div className="table-scroll">
      <table className="tbl">
        <thead>
          <tr><th>Page</th><th style={{ width: '24%' }}>Sessions</th><th className="num">Engaged</th><th className="num">Engaged → download</th><th className="num">Downloads</th><th className="num">HD interest</th><th className="num">Sessions vs prev</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const cr = rate(r.dl_sessions, r.engaged);
            const big = r.engaged >= 30 && !/^\/(hd|license|terms|privacy|contact|branded-backgrounds|image-lookup)(\/|$)/.test(r.k);
            return (
              <tr key={r.k}>
                <td className="path"><a href={r.k.startsWith('/') ? r.k : undefined} target="_blank" rel="noreferrer">{r.k}</a></td>
                <td><div className="bar-cell"><InlineBar value={r.sessions} max={max} /><span>{n0(r.sessions)}</span></div></td>
                <td className="num">{pct1(rate(r.engaged, r.sessions))}</td>
                <td className="num"><b>{pct1(cr)}</b> {big && cr < siteCr * 0.6 ? <span className="flag warn">leak</span> : big && cr > siteCr * 1.3 ? <span className="flag good">strong</span> : null}</td>
                <td className="num">{n0(r.downloads)}</td>
                <td className="num">{n0(r.hd_sessions)}</td>
                <td className="num"><Delta cur={r.sessions} prev={r.prev} suffix="" /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CategoryTable({ rows }) {
  const max = Math.max(...rows.map((r) => r.downloads), 1);
  return (
    <div className="table-scroll">
      <table className="tbl">
        <thead>
          <tr><th>Category</th><th style={{ width: '30%' }}>Downloads</th><th className="num">Page views</th><th className="num">Previews</th><th className="num">Downloads / 100 views</th><th className="num">Unique downloaders</th><th className="num">Downloads vs prev</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.k}>
              <td><a href={`/category/${r.k}`} target="_blank" rel="noreferrer">{pretty(r.k)}</a></td>
              <td><div className="bar-cell"><InlineBar value={r.downloads} max={max} /><span>{n0(r.downloads)}</span></div></td>
              <td className="num">{n0(r.views)}</td>
              <td className="num">{n0(r.previews)}</td>
              <td className="num"><b>{r.views ? (100 * r.downloads / r.views).toFixed(0) : '–'}</b></td>
              <td className="num">{n0(r.dl_visitors)}</td>
              <td className="num"><Delta cur={r.downloads} prev={r.prev} suffix="" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImageCard({ im, rank }) {
  return (
    <a className="img-card" href={im.href || undefined} target="_blank" rel="noreferrer" title={im.title}>
      <div className="img-thumb">
        {im.thumb ? <img src={im.thumb} alt="" loading="lazy" /> : <div className="img-missing">no preview</div>}
        {rank && <span className="img-rank">#{rank}</span>}
        {im.hd && <span className="img-hd">also in HD</span>}
      </div>
      <div className="img-meta">
        <div className="img-title">{im.title}</div>
        <div className="img-stats"><b>{n0(im.downloads)}</b> <span className="muted">downloads</span> <Delta cur={im.downloads} prev={im.prev} suffix="" /></div>
        <div className="muted small">{pretty(im.category)}{im.addedAt && im.addedAt !== '2026-04-17' ? ` · added ${im.addedAt}` : ''}</div>
      </div>
    </a>
  );
}

function orderParts(rows, order) {
  const by = Object.fromEntries(rows.map((r) => [r.k, r]));
  return order.filter((k) => by[k]).map((k) => by[k]);
}

function fillMonths(rows, field, anchor) {
  const by = Object.fromEntries(rows.map((r) => [r.m, r[field]]));
  const end = new Date(anchor);
  const out = [];
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - i, 1));
    const key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`;
    out.push({ label: monthLabel(key), value: by[key] || 0 });
  }
  return out;
}

function groupEmailSources(rows) {
  const g = {};
  rows.forEach((r) => { const k = r.k.split(':')[0].replace(/_/g, ' '); g[k] = (g[k] || 0) + r.n; });
  return Object.entries(g).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, label: k, value: v }));
}

function Tools() {
  const [revalidating, setRevalidating] = useState(false);
  const [msg, setMsg] = useState(null);
  const links = [
    { href: '/admin/scores', title: 'Image scores', desc: 'Popularity rankings, removal candidates' },
    { href: '/admin/categories', title: 'Category performance', desc: 'Sheet-based category stats' },
    { href: '/admin/traffic', title: 'Traffic sources (Sheet)', desc: 'Raw source conversion' },
    { href: '/admin/weekly', title: 'Weekly overview', desc: 'Last 7 days trends' },
    { href: '/admin/sessions', title: 'Session insights', desc: 'Behavior & conversion patterns' },
    { href: '/admin/timing', title: 'Time optimizer', desc: 'Best hours/days' },
    { href: '/admin/journeys', title: 'User journeys', desc: 'Common paths & drop-offs' },
    { href: '/admin/devices', title: 'Device & browser', desc: 'Browser / OS breakdown' },
    { href: '/admin/christmas-stats', title: 'Christmas stats', desc: 'Holiday category analytics' },
    { href: '/admin/logo-review', title: 'Logo review', desc: 'Approve logo-product placements (dev only)' },
    { href: '/analytics', title: 'Full analytics (legacy)', desc: 'Original analytics dashboard' },
  ];
  const revalidate = async () => {
    setRevalidating(true); setMsg(null);
    try {
      const r = await fetch('/api/admin/revalidate-all', { method: 'POST' });
      const j = await r.json();
      setMsg(j.success ? `✓ ${j.revalidated} pages revalidated${j.failed?.length ? ` (${j.failed.length} failed)` : ''}` : `Error: ${j.error}`);
    } catch (e) { setMsg(`Error: ${e.message}`); } finally { setRevalidating(false); }
  };
  const rebuild = async () => {
    setMsg('Rebuilding Dashboard tab…');
    const r = await fetch('/api/admin/rebuild-dashboard', { method: 'POST' });
    const j = await r.json();
    setMsg(j.success ? `✓ Dashboard rebuilt: ${j.stats.totalDownloads} downloads, ${j.stats.categoriesTracked} categories` : `Error: ${j.error}`);
  };
  return (
    <section className="card tools">
      <SectionHead title="Tools" sub="Older dashboards and maintenance actions" />
      <div className="tool-grid">
        {links.map((l) => (
          <Link key={l.href} href={l.href} prefetch={false} className="tool">
            <b className="ink">{l.title}</b><span className="muted small">{l.desc}</span>
          </Link>
        ))}
      </div>
      <div className="tool-actions">
        <button className="chip" onClick={revalidate} disabled={revalidating}>{revalidating ? 'Revalidating…' : '↻ Revalidate all category pages'}</button>
        <button className="chip" onClick={rebuild}>Rebuild Sheet “Dashboard” tab</button>
        <button className="chip" onClick={() => window.open('/api/consolidate-analytics', '_blank')}>Consolidate analytics</button>
        {msg && <span className="muted small">{msg}</span>}
      </div>
    </section>
  );
}

// ---------- styles ----------
const CSS = `
.ins {
  color-scheme: light;
  --page: #f5f5f5; --surface-1: #fcfcfb; --card-border: rgba(11,11,11,0.08);
  --text-primary: #111827; --text-secondary: #52514e; --muted: #77756f;
  --grid: #e9e8e2; --axis: #c3c2b7; --prev: #b9b8b0; --spark: #a3a29b;
  --series-1: #2a78d6; --series-1-hover: #1c5cab; --series-2: #eb6834; --series-3: #1baf7a;
  --seq-0: #f0efec; --seq-1: #cde2fb; --seq-2: #9ec5f4; --seq-3: #6da7ec; --seq-4: #3987e5; --seq-5: #256abf; --seq-6: #184f95;
  --good: #0ca30c; --good-text: #006300; --warning: #fab219; --serious: #ec835a; --critical: #d03b3b; --critical-text: #b42f2f;
  --status-serious: #ec835a; --gold: #E0A82E; --chip: #ecebe6;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  background: var(--page); color: var(--text-primary); min-height: 100vh; padding: 0 0 48px;
}
@media (prefers-color-scheme: dark) {
  .ins {
    color-scheme: dark;
    --page: #0d0d0d; --surface-1: #1a1a19; --card-border: rgba(255,255,255,0.08);
    --text-primary: #f0efec; --text-secondary: #c3c2b7; --muted: #9a9890;
    --grid: #2c2c2a; --axis: #383835; --prev: #5d5c57; --spark: #6f6e68;
    --series-1: #3987e5; --series-1-hover: #6da7ec; --series-2: #d95926; --series-3: #199e70;
    --seq-0: #242423; --seq-1: #0d366b; --seq-2: #104281; --seq-3: #184f95; --seq-4: #256abf; --seq-5: #3987e5; --seq-6: #86b6ef;
    --good-text: #0ca30c; --critical-text: #e66767; --chip: #2a2a28;
  }
}
.ins * { box-sizing: border-box; }
.ins a { color: inherit; }
.ins .ink { color: var(--text-primary); }
.ins .muted { color: var(--muted); }
.ins .small { font-size: 12.5px; line-height: 1.45; }
.ins code { font-size: 12px; background: var(--chip); padding: 1px 5px; border-radius: 4px; }
.topbar { position: sticky; top: 0; z-index: 20; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;
  padding: 14px 28px; background: color-mix(in srgb, var(--page) 88%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--card-border); }
.brand { display: flex; align-items: baseline; gap: 8px; }
.wordmark { font-weight: 700; font-size: 18px; letter-spacing: -0.01em; }
.studio-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #111827; background: var(--gold); padding: 2px 6px; border-radius: 4px; }
.topbar-title { color: var(--muted); font-size: 15px; margin-left: 6px; }
.filters { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { border: 1px solid var(--card-border); background: var(--surface-1); color: var(--text-primary); border-radius: 999px; padding: 6px 13px; font-size: 13px; cursor: pointer; font-family: inherit; }
.chip:hover { background: var(--chip); }
.chip.on { background: var(--text-primary); color: var(--surface-1); border-color: var(--text-primary); font-weight: 600; }
.chip.ghost { background: transparent; }
.chip:disabled { opacity: .6; cursor: default; }
.ins main, .ins .banner, .ins .loading, .ins .keygate, .ins .tools { max-width: 1320px; margin-left: auto; margin-right: auto; }
.ins main { padding: 0 28px; }
.ins .tools { margin: 24px auto 0; width: calc(100% - 56px); }
.keygate { margin: 24px auto; width: calc(100% - 56px); }
.keyform { display: flex; gap: 8px; margin-top: 10px; }
.keyform input { flex: 1; max-width: 360px; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--axis); background: var(--surface-1); color: var(--text-primary); }
.loading { padding: 60px 28px; color: var(--muted); }
.banner { margin: 16px auto; padding: 12px 16px; border-radius: 10px; width: calc(100% - 56px); }
.banner.bad { background: color-mix(in srgb, var(--critical) 12%, var(--surface-1)); }
.freshness { margin: 16px 0 14px; }
.warn-text { color: var(--critical-text); }
.card { background: var(--surface-1); border: 1px solid var(--card-border); border-radius: 14px; padding: 20px 22px; margin-bottom: 16px; }
.section-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.section-head h2 { margin: 0; font-size: 16px; font-weight: 650; }
.section-head p { margin: 3px 0 0; }
.mini-h { margin: 0 0 8px; font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.hero-row { display: grid; grid-template-columns: minmax(260px, 1fr) 3fr; gap: 16px; margin-bottom: 0; }
.hero-row > .card { margin-bottom: 16px; }
.kpi-hero { display: flex; flex-direction: column; }
.hero-value { font-size: 56px; font-weight: 650; letter-spacing: -0.02em; line-height: 1.05; margin: 6px 0 6px; }
.tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
.tile { margin: 0; display: flex; flex-direction: column; padding: 16px 18px; min-height: 150px; }
.tile-label { font-size: 12.5px; color: var(--text-secondary); font-weight: 500; }
.tile-value { font-size: 26px; font-weight: 650; margin: 4px 0 2px; letter-spacing: -0.01em; }
.muted-val { color: var(--muted); }
.small-val { font-size: 20px; }
.tile-hint { margin-top: 4px; }
.delta { font-size: 12.5px; font-weight: 600; white-space: nowrap; }
.delta.up { color: var(--good-text); }
.delta.down { color: var(--critical-text); }
.delta.neutral { color: var(--muted); }
.delta-suffix { color: var(--muted); font-weight: 400; }
.insights { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr)); gap: 10px 22px; }
.insight { display: flex; gap: 11px; align-items: flex-start; padding: 10px 0; border-top: 1px solid var(--grid); }
.insight-title { font-weight: 600; font-size: 14px; }
.insight-body { color: var(--text-secondary); font-size: 13px; line-height: 1.45; margin-top: 2px; }
.badge { flex: none; width: 22px; height: 22px; border-radius: 50%; display: inline-grid; place-items: center; font-size: 11px; font-weight: 800; color: #fff; margin-top: 1px; }
.badge.good { background: var(--good); }
.badge.bad { background: var(--critical); }
.badge.warn { background: var(--warning); color: #0b0b0b; }
.badge.info { background: var(--axis); color: var(--text-primary); }
.seg-ctl { display: inline-flex; background: var(--chip); border-radius: 9px; padding: 3px; gap: 2px; flex-wrap: wrap; }
.seg-ctl button { border: 0; background: transparent; color: var(--text-secondary); padding: 5px 11px; border-radius: 7px; font-size: 12.5px; cursor: pointer; font-family: inherit; }
.seg-ctl button.on { background: var(--surface-1); color: var(--text-primary); font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.chart { position: relative; }
.chart .tick { font-size: 11px; fill: var(--muted); font-variant-numeric: tabular-nums; }
.chart .val { font-size: 11.5px; fill: var(--text-primary); font-weight: 600; }
.legend { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; font-size: 12.5px; color: var(--text-secondary); margin-bottom: 8px; }
.legend b { color: var(--text-primary); font-weight: 600; margin-left: 2px; }
.key { display: inline-flex; align-items: center; gap: 6px; }
.key-line { display: inline-block; width: 14px; height: 2px; border-radius: 1px; }
.key-sq { display: inline-block; width: 10px; height: 10px; border-radius: 3px; }
.linkbtn { margin-left: auto; border: 0; background: none; color: var(--series-1); cursor: pointer; font-size: 12.5px; font-family: inherit; }
.tip { position: absolute; pointer-events: none; background: var(--surface-1); border: 1px solid var(--card-border); box-shadow: 0 6px 20px rgba(0,0,0,.12);
  border-radius: 8px; padding: 8px 10px; font-size: 12.5px; min-width: 170px; z-index: 5; }
.tip-h { color: var(--muted); font-size: 11.5px; margin-bottom: 4px; }
.tip-row { display: flex; align-items: center; gap: 7px; color: var(--text-secondary); }
.tip-row b { color: var(--text-primary); }
.grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.grid-2 > .card, .grid-3 > .card { margin-bottom: 16px; }
.grid-2.tight { gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.funnel-row { display: grid; grid-template-columns: 190px 1fr 120px; gap: 12px; align-items: center; }
.funnel-label { font-size: 13px; font-weight: 500; }
.funnel-track { height: 22px; }
.funnel-bar { height: 100%; background: var(--series-1); border-radius: 0 4px 4px 0; }
.funnel-val { text-align: right; font-size: 13px; font-variant-numeric: tabular-nums; }
.funnel-step { font-size: 11.5px; color: var(--muted); padding: 3px 0 3px 202px; }
.segbar { display: flex; gap: 2px; height: 28px; }
.seg { min-width: 2px; border-radius: 4px; display: flex; align-items: center; padding-left: 8px; font-size: 12px; font-weight: 600; }
.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
.tbl th { text-align: left; font-weight: 500; color: var(--muted); font-size: 12px; padding: 6px 10px; border-bottom: 1px solid var(--axis); white-space: nowrap; }
.tbl td { padding: 8px 10px; border-bottom: 1px solid var(--grid); vertical-align: middle; }
.tbl .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.tbl tbody tr:hover { background: color-mix(in srgb, var(--chip) 55%, transparent); }
.tbl a { text-decoration: none; }
.tbl a:hover { text-decoration: underline; }
.compact-tbl { margin-top: 10px; }
.compact-tbl td, .compact-tbl th { padding: 5px 8px; }
.table-scroll { overflow-x: auto; }
.table-scroll.small { max-height: 260px; overflow-y: auto; margin-top: 10px; }
.path { max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar-cell { display: flex; align-items: center; gap: 10px; font-variant-numeric: tabular-nums; }
.bar-cell span { min-width: 44px; }
.inline-bar { flex: 1; height: 10px; }
.inline-bar div { height: 100%; border-radius: 0 4px 4px 0; }
.flag { display: inline-block; font-size: 10.5px; font-weight: 600; padding: 1px 6px; border-radius: 999px; margin-left: 4px; }
.flag.good { background: color-mix(in srgb, var(--good) 16%, transparent); color: var(--good-text); }
.flag.good::before { content: "▲ "; }
.flag.warn { background: color-mix(in srgb, var(--warning) 28%, transparent); color: var(--text-primary); }
.flag.warn::before { content: "! "; }
.pill { font-size: 10.5px; background: var(--chip); padding: 1px 7px; border-radius: 999px; color: var(--text-secondary); }
.barrows { display: flex; flex-direction: column; gap: 7px; }
.barrow { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.barrow-label { flex: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-secondary); }
.barrow-track { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
.barrow-bar { height: 12px; border-radius: 0 4px 4px 0; flex: none; max-width: calc(100% - 52px); }
.barrow-val { font-variant-numeric: tabular-nums; font-weight: 600; }
.barrow-sub { flex: none; width: 70px; text-align: right; color: var(--muted); font-size: 12px; }
.more { margin-top: 14px; }
.more-btn { margin: 10px 0 0; padding: 0; }
.more summary { cursor: pointer; color: var(--series-1); font-size: 13px; margin-bottom: 10px; }
.img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
.small-grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
.img-card { text-decoration: none; display: block; border-radius: 10px; overflow: hidden; border: 1px solid var(--card-border); background: var(--surface-1); transition: transform .15s; }
.img-card:hover { transform: translateY(-2px); }
.img-thumb { position: relative; aspect-ratio: 16/9; background: var(--chip); }
.img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-missing { display: grid; place-items: center; height: 100%; color: var(--muted); font-size: 12px; }
.img-rank { position: absolute; top: 6px; left: 6px; background: rgba(17,24,39,.82); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 999px; }
.img-hd { position: absolute; top: 6px; right: 6px; background: var(--gold); color: #111827; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; }
.img-meta { padding: 9px 11px 11px; }
.img-title { font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.img-stats { font-size: 12.5px; margin: 3px 0 2px; display: flex; gap: 5px; align-items: baseline; flex-wrap: wrap; }
.content-strip { display: flex; flex-wrap: wrap; gap: 10px 28px; margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--grid); font-size: 13px; }
.heat-wrap { overflow-x: auto; }
.heat { display: flex; flex-direction: column; gap: 3px; min-width: 640px; }
.heat-row { display: grid; grid-template-columns: 40px repeat(24, 1fr); gap: 3px; }
.heat-day { font-size: 11.5px; color: var(--muted); align-self: center; }
.heat-hr { font-size: 10.5px; color: var(--muted); }
.heat-cell { height: 24px; border-radius: 4px; }
.heat-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; gap: 12px; flex-wrap: wrap; }
.heat-scale { display: inline-flex; align-items: center; gap: 3px; }
.heat-scale i { display: inline-block; width: 18px; height: 10px; border-radius: 3px; }
.money-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }
.money-strip .tile-value { font-size: 20px; }
.reviews { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; font-size: 13px; }
.reviews li { border-top: 1px solid var(--grid); padding-top: 8px; }
.reviews li span[aria-label] { color: var(--gold); }
.tool-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.tool { display: flex; flex-direction: column; gap: 3px; padding: 12px 14px; border-radius: 10px; background: var(--page); text-decoration: none; font-size: 13.5px; }
.tool:hover { background: var(--chip); }
.tool-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 16px; }
@media (max-width: 1100px) {
  .hero-row { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-3 { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 820px) {
  .grid-2 { grid-template-columns: minmax(0, 1fr); }
  .topbar { padding: 12px 16px; }
  .ins main { padding: 0 14px; }
  .funnel-row { grid-template-columns: 120px 1fr 96px; }
  .funnel-step { padding-left: 132px; }
  .money-strip { grid-template-columns: repeat(2, 1fr); }
}
`;
