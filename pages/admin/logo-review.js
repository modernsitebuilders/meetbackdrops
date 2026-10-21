import { useState, useEffect } from 'react';
import Head from 'next/head';
import { isAdmin } from '../../lib/adminAuth';
import WebcamSilhouette from '../../components/WebcamSilhouette';

// Review queue for the "Add your logo" product. Click an image where the logo
// should sit by default, then Approve; Reject images with no good open wall.
// Saves straight into data/logoReady.json (dev server only — run locally).

const CANDIDATE_CATEGORIES = new Set([
  'office-spaces', 'home-office', 'bookshelves', 'wall-shelves', 'libraries',
  'urban-lofts', 'neutral-backgrounds', 'living-rooms', 'art-galleries',
]);
const CANDIDATE_COUNT = 90;

export async function getStaticProps() {
  const manifest = require('../../image-pipeline/final_manifest.json');
  const { scores } = require('../../public/data/image-scores-static.json');
  const candidates = manifest
    .filter((e) => CANDIDATE_CATEGORIES.has(e.category))
    .map((e) => {
      const s = scores[e.image_webp] || {};
      return {
        slug: e.slug,
        category: e.category,
        webp: `https://assets.streambackdrops.com/webp/${e.folder || e.category}/${e.image_webp}`,
        hd: Boolean(e.hd),
        score: s.score || 0,
        downloads365d: s.downloads365d || 0,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, CANDIDATE_COUNT);
  const logoReady = JSON.parse(require('fs').readFileSync(require('path').join(process.cwd(), 'data', 'logoReady.json'), 'utf8'));
  return { props: { candidates, initialReady: logoReady } };
}

function SpotMarker({ x, y, pending }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x * 100}%`, top: `${y * 100}%`,
      width: '18%', height: '13%',
      transform: 'translate(-50%, -50%)',
      border: `2px ${pending ? 'dashed' : 'solid'} ${pending ? '#E0A82E' : '#22c55e'}`,
      background: pending ? 'rgba(224,168,46,0.25)' : 'rgba(34,197,94,0.25)',
      color: '#fff', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.6)',
    }}>
      LOGO
    </div>
  );
}

export default function LogoReview({ candidates, initialReady }) {
  const [ready, setReady] = useState(initialReady);
  const [pending, setPending] = useState({});
  const [filter, setFilter] = useState('todo');
  const [showSilhouette, setShowSilhouette] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin()) window.location.href = '/';
  }, []);

  const statusOf = (slug) =>
    ready.approved[slug] ? 'approved' : ready.rejected.includes(slug) ? 'rejected' : 'todo';

  const save = async (slug, action, spot) => {
    setError('');
    const res = await fetch('/api/admin/logo-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, action, ...spot }),
    });
    if (!res.ok) {
      setError('Save failed — this page only saves on the local dev server (npm run dev).');
      return;
    }
    setReady(await res.json());
    setPending((p) => { const n = { ...p }; delete n[slug]; return n; });
  };

  const handleImageClick = (slug, e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPending((p) => ({ ...p, [slug]: { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } }));
  };

  const counts = { todo: 0, approved: 0, rejected: 0 };
  candidates.forEach((c) => { counts[statusOf(c.slug)]++; });
  const shown = candidates.filter((c) => filter === 'all' || statusOf(c.slug) === filter);

  const tab = (key, label) => (
    <button
      onClick={() => setFilter(key)}
      style={{
        padding: '0.45rem 0.9rem', border: '1px solid #d1d5db', cursor: 'pointer',
        background: filter === key ? '#111827' : '#fff', color: filter === key ? '#fff' : '#111827',
        fontSize: '0.85rem',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: '1.5rem', background: '#F5F5F5', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>Logo Review | MeetBackdrops Admin</title>
        <meta name="robots" content="noindex" />
      </Head>

      <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem', color: '#111827' }}>Logo product — image review</h1>
      <p style={{ margin: '0 0 1rem', color: '#4b5563', fontSize: '0.92rem', maxWidth: 760 }}>
        Top {candidates.length} work-call images by popularity. Click where a logo should sit by default
        (open wall, clear of the head outline), then <strong>Approve</strong>. <strong>Reject</strong> images
        with no good spot. Only approved images are sold.
      </p>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        {tab('todo', `To review (${counts.todo})`)}
        {tab('approved', `Approved (${counts.approved})`)}
        {tab('rejected', `Rejected (${counts.rejected})`)}
        {tab('all', 'All')}
        <label style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#374151' }}>
          <input type="checkbox" checked={showSilhouette} onChange={(e) => setShowSilhouette(e.target.checked)} /> Show caller outline
        </label>
      </div>
      {error && <p style={{ color: '#b91c1c', fontWeight: 600 }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))', gap: '1rem' }}>
        {shown.map((c) => {
          const status = statusOf(c.slug);
          const spot = pending[c.slug] || ready.approved[c.slug];
          return (
            <div key={c.slug} style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
              <div
                onClick={(e) => handleImageClick(c.slug, e)}
                style={{ position: 'relative', aspectRatio: '16/9', cursor: 'crosshair', overflow: 'hidden' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.webp} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {showSilhouette && <WebcamSilhouette />}
                {spot && <SpotMarker x={spot.x} y={spot.y} pending={Boolean(pending[c.slug])} />}
              </div>
              <div style={{ padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', wordBreak: 'break-all' }}>{c.slug}</div>
                <div style={{ fontSize: '0.78rem', color: '#374151', margin: '0.25rem 0 0.5rem' }}>
                  {c.category} · {c.downloads365d} downloads/yr {c.hd && <span style={{ color: '#9a6a3a', fontWeight: 700 }}>· HD master</span>}
                  {status !== 'todo' && <strong style={{ marginLeft: 6, color: status === 'approved' ? '#15803d' : '#b91c1c' }}>{status}</strong>}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    disabled={!spot}
                    onClick={() => save(c.slug, 'approve', spot)}
                    style={{ flex: 1, padding: '0.45rem', border: 'none', background: spot ? '#15803d' : '#d1d5db', color: '#fff', fontWeight: 600, cursor: spot ? 'pointer' : 'default' }}
                  >
                    {spot ? 'Approve spot' : 'Click image to set spot'}
                  </button>
                  <button
                    onClick={() => save(c.slug, 'reject')}
                    style={{ padding: '0.45rem 0.8rem', border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                  {status !== 'todo' && (
                    <button
                      onClick={() => save(c.slug, 'reset')}
                      style={{ padding: '0.45rem 0.8rem', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                    >
                      Undo
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
