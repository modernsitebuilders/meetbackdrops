// pages/backgrounds/index.js
//
// The "browse by style/room" hub — a single indexable page that links every
// published theme collection (/backgrounds/{theme}) and bridges to the two
// sibling discovery systems: profession collections (/collections) and the
// platform hubs. This is the top of the theme axis of the discovery graph.

import Link from 'next/link';
import Layout from '../../components/Layout';

const BASE_URL = 'https://meetbackdrops.com';
const ASSET_BASE_URL = 'https://assets.streambackdrops.com';

const SEO = {
  title: 'Virtual Backgrounds by Style & Room | MeetBackdrops',
  description:
    'Browse studio-designed virtual backgrounds by style and room — office, bookshelf, minimalist, executive, cozy and more, for Zoom, Teams, Meet, and Webex.',
  canonical: `${BASE_URL}/backgrounds`,
};

export default function BackgroundsHub({ cards, schema }) {
  return (
    <Layout
      title={SEO.title}
      description={SEO.description}
      canonical={SEO.canonical}
      keywords="virtual backgrounds by style, office backgrounds, bookshelf backgrounds, minimalist backgrounds, professional video call backgrounds"
      structuredData={schema}
    >
      <div style={{ padding: '2.5rem 2rem 4rem', background: '#fff', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem',
            fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6b7280',
          }}>
            <Link prefetch={false} href="/" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span style={{ color: '#111827', fontWeight: 600 }}>Backgrounds by Style</span>
          </nav>

          <header style={{ marginBottom: '2.5rem', maxWidth: '760px' }}>
            <div style={{
              fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#9a6a3a', fontWeight: 600, marginBottom: '0.9rem',
            }}>
              Browse by style
            </div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-0.02em',
              color: '#111827', margin: '0 0 1.25rem', lineHeight: 1.1,
            }}>
              Virtual backgrounds by style &amp; room
            </h1>
            <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
              Every look, curated from the full MeetBackdrops catalog. Pick the kind of space
              that fits your call — then set it up on Zoom, Microsoft Teams, Google Meet, or Webex.
            </p>
          </header>

          {/* Theme cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}>
            {cards.map((c) => (
              <Link prefetch={false} key={c.slug} href={`/backgrounds/${c.slug}`} style={{
                display: 'block', textDecoration: 'none', color: 'inherit',
                border: '1px solid #e5e7eb', borderRadius: '14px', overflow: 'hidden', background: '#fff',
              }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#f3f4f6' }}>
                  {c.hero && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`${ASSET_BASE_URL}/webp/${c.hero.folder}/${c.hero.filename}`}
                      alt={`${c.label} virtual backgrounds for Zoom, Teams, and Google Meet`}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                </div>
                <div style={{ padding: '1rem 1.1rem 1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                      {c.label}
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: '#9a6a3a', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {c.count}+
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.5, margin: '0.4rem 0 0' }}>
                    {c.blurb}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Bridge to the other discovery systems */}
          <section style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc', display: 'grid', gap: '0.75rem', maxWidth: '640px' }}>
            <Link prefetch={false} href="/collections" style={{ color: '#9a6a3a', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Browse by profession instead →
            </Link>
            <Link prefetch={false} href="/zoom-backgrounds" style={{ color: '#9a6a3a', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Browse by platform (Zoom, Teams, Meet, Webex) →
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const fs = require('fs');
  const path = require('path');
  const { themeHubCards } = require('../../lib/collections/themeEngine');

  let rawScores = {};
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'image-scores-static.json');
    rawScores = JSON.parse(fs.readFileSync(p, 'utf8')).scores || {};
  } catch (e) {
    console.error('Backgrounds hub scores unavailable, using fallback:', e.message);
  }

  const cards = themeHubCards(rawScores);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        url: SEO.canonical,
        name: 'Virtual Backgrounds by Style & Room',
        description: SEO.description,
        isPartOf: { '@type': 'WebSite', name: 'MeetBackdrops', url: BASE_URL },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: cards.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${c.label} Virtual Backgrounds`,
            url: `${BASE_URL}/backgrounds/${c.slug}`,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Backgrounds by Style', item: SEO.canonical },
        ],
      },
    ],
  };

  return { props: { cards, schema }, revalidate: 86400 };
}
