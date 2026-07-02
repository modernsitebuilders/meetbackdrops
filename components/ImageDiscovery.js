// components/ImageDiscovery.js
//
// The image page's discovery block. Presentational only — it renders the edges
// computed by lib/discovery/imageDiscovery.js (server side), so it stays cheap
// and carries no manifest into the client bundle.
//
// Three connections, each a real navigation path out of the image:
//   • Great for …      metadata-driven use-case context (from matched themes)
//   • Browse by style  → /backgrounds/{theme}
//   • Available for    → /{platform}/{primaryTheme}  (deep link into the matrix)
//
// Styling matches the existing persona-collection chips already on the page.

import Link from 'next/link';

const eyebrowStyle = {
  fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase',
  color: '#9a6a3a', fontWeight: 600, marginBottom: '0.7rem',
};
const h2Style = { fontSize: '1.05rem', fontWeight: 600, color: '#111827', margin: '0 0 0.9rem' };
const chipStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 0.95rem', borderRadius: '999px',
  border: '1px solid #e5e7eb', background: '#fafafa', color: '#374151',
  fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none',
};

export default function ImageDiscovery({ themes = [], platforms = [], useCases = [] }) {
  const hasAnything = themes.length > 0 || platforms.length > 0 || useCases.length > 0;
  if (!hasAnything) return null;

  return (
    <section style={{ marginBottom: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
      {useCases.length > 0 && (
        <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
          <strong style={{ color: '#111827' }}>Great for:</strong>{' '}
          {useCases.join(' · ')} — on Zoom, Microsoft Teams, Google Meet, and Webex.
        </p>
      )}

      {themes.length > 0 && (
        <div style={{ marginBottom: platforms.length > 0 ? '1.75rem' : 0 }}>
          <div style={eyebrowStyle}>Browse by style</div>
          <h2 style={h2Style}>More backgrounds in this style</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {themes.map((t) => (
              <Link prefetch={false} key={t.slug} href={`/backgrounds/${t.slug}`} style={chipStyle}>
                {t.label} backgrounds
                <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {platforms.length > 0 && (
        <div>
          <div style={eyebrowStyle}>Available for</div>
          <h2 style={h2Style}>Set this up on your platform</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {platforms.map((p) => (
              <Link prefetch={false} key={p.slug} href={p.href} style={chipStyle}>
                {p.name}
                <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
