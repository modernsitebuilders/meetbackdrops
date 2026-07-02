// components/CategoryPlatformLinks.js
//
// Category-page discovery strip. Closes two loops from the ~21 highest-traffic
// browse pages into the rest of the discovery graph:
//   1. "Browse by style" → the standalone theme collections (/backgrounds/{theme})
//      relevant to THIS category (derived purely from theme defs — no manifest,
//      so it stays out of the client bundle).
//   2. "Set up on your app" → the four platform hubs (/{platform}).
// Pure/presentational; safe to drop anywhere below a category grid.

import Link from 'next/link';
import { getThemesForCategory } from '../lib/collections/categoryThemes';

const PLATFORMS = [
  { slug: 'zoom-backgrounds', label: 'Zoom' },
  { slug: 'google-meet-backgrounds', label: 'Google Meet' },
  { slug: 'microsoft-teams-backgrounds', label: 'Microsoft Teams' },
  { slug: 'webex-backgrounds', label: 'Webex' },
];

const eyebrowStyle = {
  fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase',
  color: '#9a6a3a', fontWeight: 600, marginBottom: '0.9rem',
};
const chipStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
  padding: '0.6rem 1.1rem', borderRadius: '999px',
  border: '1px solid #e5e7eb', background: '#fafafa', color: '#374151',
  fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none',
};

export default function CategoryPlatformLinks({ categoryName, categorySlug }) {
  const themes = getThemesForCategory(categorySlug);

  return (
    <section style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' }}>
      {themes.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={eyebrowStyle}>Browse by style</div>
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
            fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: '0 0 1.25rem',
          }}>
            {categoryName ? `${categoryName} by style` : 'Browse by style'}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {themes.map((t) => (
              <Link prefetch={false} key={t.slug} href={`/backgrounds/${t.slug}`} style={chipStyle}>
                {t.label}
                <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={eyebrowStyle}>Setting up on a specific app?</div>
      <h2 style={{
        fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
        fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: '0 0 0.6rem',
      }}>
        Use {categoryName ? `${categoryName.toLowerCase()} backgrounds` : 'these backgrounds'} on your platform
      </h2>
      <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0 0 1.25rem', lineHeight: 1.6, maxWidth: '640px' }}>
        Step-by-step setup and curated picks for each video-call app.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        {PLATFORMS.map((p) => (
          <Link prefetch={false} key={p.slug} href={`/${p.slug}`} style={chipStyle}>
            {p.label}
            <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
