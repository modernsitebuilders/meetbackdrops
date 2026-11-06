// Hand-rolled SVG/HTML chart primitives for the /admin insights dashboard.
// No chart library: the marks follow one spec (2px lines, <=24px bars with 4px
// rounded data-ends, hairline grid, 10% area wash) and every chart has a hover
// layer plus a non-hover path to the same numbers (labels or a table).
import { useEffect, useRef, useState, useId } from 'react';

// ---------- formatting ----------
export const n0 = (v) => (v == null || isNaN(v) ? '–' : Math.round(v).toLocaleString('en-US'));
export const compact = (v) => {
  if (v == null || isNaN(v)) return '–';
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (a >= 1e4) return `${(v / 1e3).toFixed(0)}K`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return n0(v);
};
export const pct1 = (v) => (v == null || isNaN(v) ? '–' : `${v.toFixed(1)}%`);
export const money = (v, digits = 0) =>
  v == null || isNaN(v) ? '–' : `$${v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
export const rate = (a, b) => (b ? (100 * a) / b : 0);
export const change = (cur, prev) => (prev ? ((cur - prev) / prev) * 100 : cur ? null : 0);
export const pretty = (slug) => String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const shortDate = (iso) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
};
export const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`;
};

function niceMax(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

// Clean axis ticks: a 1/2/5 × 10^k step giving ~4 intervals, max rounded up to it.
function niceTicks(v, target = 4) {
  const raw = Math.max(v, 1) / target;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((k) => k * p).find((s) => s >= raw);
  const max = Math.ceil(v / step) * step || step;
  const ticks = [];
  for (let t = 0; t <= max + 1e-9; t += step) ticks.push(t);
  return { max, ticks };
}

function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(60, e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

// ---------- delta chip ----------
// Direction × whether up is good. Arrow + sign so it never relies on color alone.
export function Delta({ cur, prev, goodWhenUp = true, suffix = 'vs prev', points = false }) {
  if (prev == null) return null;
  let v, label;
  if (points) {
    v = cur - prev;
    label = `${v > 0 ? '+' : ''}${v.toFixed(1)} pts`;
  } else {
    v = change(cur, prev);
    if (v === null) return <span className="delta neutral">new {suffix}</span>;
    label = `${v > 0 ? '+' : ''}${Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)}%`;
  }
  const flat = Math.abs(v) < (points ? 0.1 : 0.5);
  const good = v > 0 === goodWhenUp;
  const cls = flat ? 'neutral' : good ? 'up' : 'down';
  const arrow = flat ? '→' : v > 0 ? '▲' : '▼';
  return (
    <span className={`delta ${cls}`}>
      <span aria-hidden="true">{arrow}</span> {label} <span className="delta-suffix">{suffix}</span>
    </span>
  );
}

// ---------- sparkline ----------
export function Sparkline({ values, height = 32 }) {
  const [ref, w] = useWidth();
  if (!values?.length) return <div ref={ref} style={{ height }} />;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? (w - 6) / (values.length - 1) : 0;
  const pts = values.map((v, i) => [3 + i * step, height - 3 - (v / max) * (height - 6)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  const last = pts[pts.length - 1];
  return (
    <div ref={ref} style={{ height }} aria-hidden="true">
      <svg width={w} height={height} style={{ display: 'block', overflow: 'visible' }}>
        <path d={d} fill="none" stroke="var(--spark)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={last[0]} cy={last[1]} r="3" fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth="2" />
      </svg>
    </div>
  );
}

// ---------- shared tooltip ----------
function Tip({ x, y, w, children }) {
  if (x == null) return null;
  const left = Math.min(Math.max(x + 14, 0), w - 190);
  return (
    <div className="tip" style={{ left: x + 14 > w - 190 ? x - 200 : left, top: Math.max(0, y - 10) }} role="status">
      {children}
    </div>
  );
}

// ---------- trend line: current vs previous period ----------
// One measure, one axis. The previous period is a recessive gray line aligned by
// position (day 1 vs day 1), so the reader sees shape and level change at once.
export function TrendChart({ cur, prev, field, label, bucket = 'day', height = 240, format = n0 }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const gradId = useId().replace(/:/g, '');
  const m = { t: 12, r: 16, b: 28, l: 44 };
  const iw = w - m.l - m.r, ih = height - m.t - m.b;
  const n = Math.max(cur.length, prev.length, 2);
  const cv = cur.map((r) => r[field] || 0);
  const pv = prev.slice(-n).map((r) => r[field] || 0);
  const { max, ticks } = niceTicks(Math.max(...cv, ...pv, 1));
  const x = (i) => m.l + (n > 1 ? (i * iw) / (n - 1) : 0);
  const y = (v) => m.t + ih - (v / max) * ih;
  const line = (vals) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const area = cv.length ? `${line(cv)}L${x(cv.length - 1)},${m.t + ih}L${x(0)},${m.t + ih}Z` : '';
  const xTickEvery = Math.ceil(cur.length / Math.max(2, Math.floor(iw / 90)));

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - m.l) / iw) * (n - 1));
    if (i < 0 || i >= cur.length) return setHover(null);
    setHover(i);
  };
  const hi = hover;
  const sumC = cv.reduce((a, b) => a + b, 0), sumP = pv.reduce((a, b) => a + b, 0);

  return (
    <div className="chart">
      <div className="legend">
        <span className="key"><i className="key-line" style={{ background: 'var(--series-1)' }} />This period <b>{format(sumC)}</b></span>
        <span className="key"><i className="key-line" style={{ background: 'var(--prev)' }} />Previous period <b>{format(sumP)}</b></span>
        <button className="linkbtn" onClick={() => setShowTable((s) => !s)}>{showTable ? 'Hide table' : 'Table'}</button>
      </div>
      <div ref={ref} style={{ position: 'relative' }}>
        <svg width={w} height={height} onPointerMove={onMove} onPointerLeave={() => setHover(null)}
          role="img" aria-label={`${label}: ${format(sumC)} this period vs ${format(sumP)} previous`} style={{ display: 'block', touchAction: 'pan-y' }}>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--series-1)" stopOpacity="0.14" />
              <stop offset="1" stopColor="var(--series-1)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={m.l} x2={w - m.r} y1={y(t)} y2={y(t)} stroke={i === 0 ? 'var(--axis)' : 'var(--grid)'} strokeWidth="1" />
              <text x={m.l - 8} y={y(t) + 4} textAnchor="end" className="tick">{compact(t)}</text>
            </g>
          ))}
          {cur.map((r, i) => (i % xTickEvery === 0 || i === cur.length - 1) && (i === cur.length - 1 || cur.length - 1 - i >= xTickEvery * 0.6) ? (
            <text key={r.d} x={x(i)} y={height - 8} textAnchor={i === 0 ? 'start' : i === cur.length - 1 ? 'end' : 'middle'} className="tick">{shortDate(r.d)}</text>
          ) : null)}
          {pv.length > 1 && <path d={line(pv)} fill="none" stroke="var(--prev)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
          {area && <path d={area} fill={`url(#${gradId})`} />}
          {cv.length > 1 && <path d={line(cv)} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
          {cv.length > 0 && hi == null && (
            <circle cx={x(cv.length - 1)} cy={y(cv[cv.length - 1])} r="4" fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth="2" />
          )}
          {hi != null && (
            <g>
              <line x1={x(hi)} x2={x(hi)} y1={m.t} y2={m.t + ih} stroke="var(--axis)" strokeWidth="1" />
              {pv[hi] != null && <circle cx={x(hi)} cy={y(pv[hi])} r="4" fill="var(--prev)" stroke="var(--surface-1)" strokeWidth="2" />}
              <circle cx={x(hi)} cy={y(cv[hi])} r="4" fill="var(--series-1)" stroke="var(--surface-1)" strokeWidth="2" />
            </g>
          )}
        </svg>
        {hi != null && (
          <Tip x={x(hi)} y={y(cv[hi])} w={w}>
            <div className="tip-h">{bucket === 'week' ? `Week of ${shortDate(cur[hi].d)}` : shortDate(cur[hi].d)}</div>
            <div className="tip-row"><i className="key-line" style={{ background: 'var(--series-1)' }} /><b>{format(cv[hi])}</b> this period</div>
            {pv[hi] != null && prev[prev.length - n + hi] && (
              <div className="tip-row"><i className="key-line" style={{ background: 'var(--prev)' }} /><b>{format(pv[hi])}</b> {shortDate(prev.slice(-n)[hi].d)}</div>
            )}
          </Tip>
        )}
      </div>
      {showTable && (
        <div className="table-scroll small">
          <table className="tbl">
            <thead><tr><th>{bucket === 'week' ? 'Week of' : 'Day'}</th><th className="num">{label}</th><th className="num">Previous period</th></tr></thead>
            <tbody>
              {cur.map((r, i) => (
                <tr key={r.d}><td>{r.d}</td><td className="num">{format(cv[i])}</td><td className="num">{pv[i] != null ? format(pv[i]) : '–'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- vertical columns (e.g. revenue by month) ----------
export function Columns({ data, format = n0, height = 200, highlightLast = true }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState(null);
  const m = { t: 22, r: 8, b: 26, l: 44 };
  const iw = w - m.l - m.r, ih = height - m.t - m.b;
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const band = iw / Math.max(data.length, 1);
  const bw = Math.min(24, band * 0.6);
  const y = (v) => m.t + ih - (v / max) * ih;
  const ticks = [0, 0.5, 1].map((f) => f * max);
  const peak = data.reduce((b, d, i) => (d.value > (data[b]?.value ?? -1) ? i : b), 0);
  return (
    <div ref={ref} className="chart" style={{ position: 'relative' }}>
      <svg width={w} height={height} role="img" aria-label="Column chart" style={{ display: 'block' }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={m.l} x2={w - m.r} y1={y(t)} y2={y(t)} stroke={i === 0 ? 'var(--axis)' : 'var(--grid)'} />
            <text x={m.l - 8} y={y(t) + 4} textAnchor="end" className="tick">{format(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = m.l + band * i + band / 2;
          const h = Math.max(0, m.t + ih - y(d.value));
          const r = Math.min(4, h);
          const x0 = cx - bw / 2, top = m.t + ih - h;
          const path = h > 0
            ? `M${x0},${m.t + ih}V${top + r}Q${x0},${top} ${x0 + r},${top}H${x0 + bw - r}Q${x0 + bw},${top} ${x0 + bw},${top + r}V${m.t + ih}Z`
            : '';
          const isLast = i === data.length - 1;
          const showLabel = (highlightLast && isLast) || i === peak || hover === i;
          return (
            <g key={d.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} tabIndex={0}
              onFocus={() => setHover(i)} onBlur={() => setHover(null)} aria-label={`${d.label}: ${format(d.value)}`}>
              <rect x={m.l + band * i} y={m.t} width={band} height={ih} fill="transparent" />
              {path && <path d={path} fill={hover === i ? 'var(--series-1-hover)' : 'var(--series-1)'} />}
              {showLabel && d.value > 0 && <text x={cx} y={top - 6} textAnchor="middle" className="val">{format(d.value)}</text>}
              {(data.length <= 12 || i % 2 === 0) && <text x={cx} y={height - 8} textAnchor="middle" className="tick">{d.label}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------- horizontal bar rows (HTML; label + bar + value) ----------
// rows: [{ key, label, value, sub?, href?, delta? }]
export function BarRows({ rows, format = n0, max: forcedMax, color = 'var(--series-1)', labelWidth = 200 }) {
  const max = forcedMax || Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="barrows" role="list">
      {rows.map((r) => (
        <div className="barrow" role="listitem" key={r.key || r.label} title={r.title || `${r.label}: ${format(r.value)}`}>
          <div className="barrow-label" style={{ width: labelWidth }}>
            {r.href ? <a href={r.href} target="_blank" rel="noreferrer">{r.label}</a> : r.label}
          </div>
          <div className="barrow-track">
            <div className="barrow-bar" style={{ width: `${Math.max(0.5, (100 * r.value) / max)}%`, background: color }} />
            <span className="barrow-val">{format(r.value)}</span>
          </div>
          {r.sub != null && <div className="barrow-sub">{r.sub}</div>}
          {r.delta != null && <div className="barrow-delta">{r.delta}</div>}
        </div>
      ))}
    </div>
  );
}

// ---------- funnel ----------
// steps: [{ label, value, hint }]. One hue; step-to-step conversion between rows.
export function Funnel({ steps }) {
  const top = steps[0]?.value || 1;
  return (
    <div className="funnel">
      {steps.map((s, i) => {
        const prev = i ? steps[i - 1].value : null;
        return (
          <div key={s.label}>
            {i > 0 && (
              <div className="funnel-step">
                <span aria-hidden="true">↓</span> {pct1(rate(s.value, prev))} continue
              </div>
            )}
            <div className="funnel-row" title={s.hint}>
              <div className="funnel-label">{s.label}<span className="muted small">{s.hint ? ` · ${s.hint}` : ''}</span></div>
              <div className="funnel-track">
                <div className="funnel-bar" style={{ width: `${Math.max(0.4, (100 * s.value) / top)}%` }} />
              </div>
              <div className="funnel-val"><b>{n0(s.value)}</b> <span className="muted">{pct1(rate(s.value, top))}</span></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- tall segmented bar (one whole, split into parts) ----------
export function SegmentedBar({ parts, format = n0 }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const [hover, setHover] = useState(null);
  return (
    <div>
      <div className="segbar" role="img" aria-label={parts.map((p) => `${p.label} ${pct1(rate(p.value, total))}`).join(', ')}>
        {parts.filter((p) => p.value > 0).map((p, i) => {
          const share = (100 * p.value) / total;
          return (
            <div key={p.label} className="seg" style={{ flexGrow: p.value, background: p.color, color: p.ink || '#fff', outline: hover === i ? '2px solid var(--text-primary)' : 'none' }}
              onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} title={`${p.label}: ${format(p.value)} (${share.toFixed(1)}%)`}>
              {share >= 9 ? `${share.toFixed(0)}%` : ''}
            </div>
          );
        })}
      </div>
      <div className="legend" style={{ marginTop: 10 }}>
        {parts.map((p) => (
          <span className="key" key={p.label}><i className="key-sq" style={{ background: p.color }} />{p.label} <b>{format(p.value)}</b></span>
        ))}
      </div>
    </div>
  );
}

// ---------- weekday × hour heatmap (sequential, one hue) ----------
const RAMP = ['var(--seq-0)', 'var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-4)', 'var(--seq-5)', 'var(--seq-6)'];
export function Heatmap({ cells, field }) {
  const [hover, setHover] = useState(null);
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  cells.forEach((c) => { grid[c.dow - 1][c.hr] = c[field] || 0; });
  const max = Math.max(...grid.flat(), 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const step = (v) => (v === 0 ? 0 : Math.min(6, 1 + Math.floor((v / max) * 5.999)));
  const hrLabel = (h) => `${h % 12 || 12}${h < 12 ? 'a' : 'p'}`;
  return (
    <div className="heat-wrap">
      <div className="heat" role="table" aria-label={`${field} by weekday and hour, Eastern time`}>
        <div className="heat-row" role="row">
          <div className="heat-day" />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="heat-hr" role="columnheader">{h % 3 === 0 ? hrLabel(h) : ''}</div>
          ))}
        </div>
        {grid.map((row, d) => (
          <div className="heat-row" role="row" key={d}>
            <div className="heat-day" role="rowheader">{days[d]}</div>
            {row.map((v, h) => (
              <div key={h} role="cell" tabIndex={-1} className="heat-cell"
                style={{ background: RAMP[step(v)], outline: hover && hover[0] === d && hover[1] === h ? '2px solid var(--text-primary)' : 'none' }}
                onPointerEnter={() => setHover([d, h, v])} onPointerLeave={() => setHover(null)}
                aria-label={`${days[d]} ${hrLabel(h)}: ${v}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="heat-foot">
        <span className="muted small">{hover ? <><b className="ink">{n0(hover[2])}</b> {field} · {days[hover[0]]} {hrLabel(hover[1])}–{hrLabel((hover[1] + 1) % 24)} ET</> : 'Hover a cell for its value. Hours in Eastern time.'}</span>
        <span className="heat-scale"><span className="muted small">0</span>{RAMP.slice(1).map((c, i) => <i key={i} style={{ background: c }} />)}<span className="muted small">{n0(max)}</span></span>
      </div>
    </div>
  );
}
