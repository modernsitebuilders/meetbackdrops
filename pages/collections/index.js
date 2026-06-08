// pages/collections/index.js
//
// Hub for persona / industry collections. Lists every published collection
// (those that clear their minCount gate), giving each a representative
// thumbnail and a link. This is the internal-linking backbone that lets
// crawlers — and buyers — discover the persona pages.

import Link from 'next/link';
import Layout from '../../components/Layout';
import {
  getPublishedCollections,
  rankedImages,
  BASE_URL,
  ASSET_BASE_URL,
} from '../../lib/collections/engine';

const SEO = {
  title: 'Virtual Backgrounds by Profession | MeetBackdrops',
  description:
    'Curated virtual background collections for lawyers, therapists, realtors, consultants, and more — studio-designed for Zoom, Teams, and Google Meet.',
};

export default function CollectionsHub({ cards, schema }) {
  return (
    <Layout
      title={SEO.title}
      description={SEO.description}
      canonical={`${BASE_URL}/collections`}
      keywords="virtual backgrounds by profession, zoom backgrounds for work, industry video call backgrounds"
      structuredData={schema}
    >
      <div style={{ padding: '3rem 2rem 4.5rem', background: '#fff', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <nav style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem',
            fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6b7280',
          }}>
            <Link href="/" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span style={{ color: '#111827', fontWeight: 600 }}>Collections</span>
          </nav>

          <header style={{ marginBottom: '2.5rem', maxWidth: '720px' }}>
            <div style={{
              fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#9a6a3a', fontWeight: 600, marginBottom: '0.9rem',
            }}>
              Curated by Profession
            </div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-0.02em',
              color: '#111827', margin: '0 0 1.25rem', lineHeight: 1.1,
            }}>
              Virtual Backgrounds for Your Profession
            </h1>
            <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
              Hand-picked sets from the MeetBackdrops catalog, chosen for how they read on camera in
              your line of work — studio-designed and 4K-upscaled for Zoom, Microsoft Teams, and Google Meet.
            </p>
          </header>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {cards.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  borderRadius: '0.5rem', overflow: 'hidden', background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0eee9',
                  height: '100%', display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#f5f5f5' }}>
                    {c.thumb && (
                      <img
                        src={c.thumb}
                        alt={`${c.persona} virtual backgrounds for Zoom, Teams, and Google Meet`}
                        loading="lazy"
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    )}
                  </div>
                  <div style={{ padding: '1rem 1.1rem 1.25rem' }}>
                    <div style={{
                      fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: '#9a6a3a', fontWeight: 600, marginBottom: '0.5rem',
                    }}>
                      {c.count} backgrounds
                    </div>
                    <div style={{
                      fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.2rem', fontWeight: 600,
                      color: '#111827', marginBottom: '0.4rem', lineHeight: 1.2,
                    }}>
                      {c.h1}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
                      {c.eyebrow}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const fs = require('fs');
  const path = require('path');

  let rawScores = {};
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'image-scores-static.json');
    rawScores = JSON.parse(fs.readFileSync(p, 'utf8')).scores || {};
  } catch (e) {
    console.error('Collections hub scores unavailable:', e.message);
  }

  const published = getPublishedCollections();

  const cards = published.map((def) => {
    const { images } = rankedImages(def, rawScores);
    const thumb = images[0] ? `${ASSET_BASE_URL}/webp/${images[0].folder}/${images[0].filename}` : null;
    return {
      slug: def.slug,
      persona: def.persona,
      h1: def.h1,
      eyebrow: def.eyebrow,
      thumb,
      count: images.length,
    };
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: `${BASE_URL}/collections`,
    name: 'Virtual Backgrounds by Profession',
    description: SEO.description,
    isPartOf: { '@type': 'WebSite', name: 'MeetBackdrops', url: BASE_URL },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: cards.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${BASE_URL}/collections/${c.slug}`,
        name: c.h1,
      })),
    },
  };

  return { props: { cards, schema }, revalidate: 86400 };
}
