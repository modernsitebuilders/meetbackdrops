// pages/collections/[slug].js
//
// Persona / industry collection pages (/collections/{slug}). A curated view
// over the EXISTING catalog — membership is decided deterministically by
// lib/collections/engine.js from canonical facets + category. No new images.
//
// These are new indexable URLs that aggregate cross-category sets with unique,
// buyer-intent copy. Each image card links to the canonical image page under
// its REAL category (ImageGrid uses image.category), so collections never
// create duplicate image routes.

import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';
import Layout from '../../components/Layout';
import ImageGrid from '../../components/ImageGrid';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import ReviewModal from '../../components/ReviewModal';
import RateLimitModal from '../../components/RateLimitModal';
import BackToTop from '../../components/BackToTop';
import cloudinaryUrls from '../../cloudinary-urls.json';
import { useImageDownload } from '../../lib/useImageDownload';
import {
  getCollectionBySlug,
  getPublishedSlugs,
  getPublishedCollections,
  rankedImages,
  collectionSeo,
} from '../../lib/collections/engine';

export default function CollectionPage({ def, images, scores, metadata, seoData, others }) {
  const [previewImage, setPreviewImage] = useState(null);
  const {
    handleDownload,
    showReviewModal,
    setShowReviewModal,
    showRateLimitModal,
    setShowRateLimitModal,
    rateLimitError,
    downloadCount,
    downloadingImage,
    emailBonusUsed,
    handleEmailBonus,
  } = useImageDownload(cloudinaryUrls);

  return (
    <Layout
      title={seoData.title}
      description={seoData.description}
      canonical={seoData.canonical}
      keywords={seoData.keywords}
      image={seoData.ogImage}
      structuredData={seoData.schema}
    >
      <Head>
        {images.slice(0, 2).map((image, i) => (
          <link
            key={i}
            rel="preload"
            as="image"
            href={`https://assets.streambackdrops.com/webp/${image.folder}/${image.filename}`}
            media="(max-width: 768px)"
          />
        ))}
      </Head>

      <div style={{ padding: '2.5rem 2rem 4rem', background: '#fff', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem',
            fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6b7280',
          }}>
            <Link href="/" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <Link href="/collections" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>Collections</Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span style={{ color: '#111827', fontWeight: 600 }}>{def.persona}</span>
          </nav>

          {/* Header */}
          <header style={{ marginBottom: '2.5rem', maxWidth: '760px' }}>
            <div style={{
              fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#9a6a3a', fontWeight: 600, marginBottom: '0.9rem',
            }}>
              {def.eyebrow}
            </div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-0.02em',
              color: '#111827', margin: '0 0 1.25rem', lineHeight: 1.1,
            }}>
              {def.h1}
            </h1>
            {def.intro.map((para, i) => (
              <p key={i} style={{
                fontSize: '1rem', color: '#4b5563', lineHeight: 1.7,
                margin: i === 0 ? '0 0 1rem' : 0,
              }}>
                {para}
              </p>
            ))}
          </header>

          <ImageGrid
            images={images}
            scores={scores}
            slug={def.slug}
            metadata={metadata}
            onImageClick={setPreviewImage}
            onDownload={(image) => handleDownload(image, image.category || def.slug)}
            cloudinaryUrls={cloudinaryUrls}
            downloadingImage={downloadingImage}
          />

          {/* Cross-links to sibling collections — crawl depth + discovery */}
          {others.length > 0 && (
            <section style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' }}>
              <h2 style={{
                fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: 600,
                color: '#111827', margin: '0 0 1.25rem',
              }}>
                Collections for other professions
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {others.map((o) => (
                  <Link
                    key={o.slug}
                    href={`/collections/${o.slug}`}
                    style={{
                      display: 'inline-block', padding: '0.55rem 1rem', borderRadius: '999px',
                      border: '1px solid #e5e7eb', background: '#fafafa', color: '#374151',
                      fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none',
                    }}
                  >
                    {o.persona}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          slug={previewImage.category || def.slug}
          onClose={() => setPreviewImage(null)}
          onDownload={(image, eventType) => handleDownload(image, image.category || def.slug, eventType)}
          cloudinaryUrls={cloudinaryUrls}
        />
      )}

      {showReviewModal && (
        <ReviewModal onClose={() => setShowReviewModal(false)} downloadCount={downloadCount} />
      )}

      {showRateLimitModal && (
        <RateLimitModal
          onClose={() => setShowRateLimitModal(false)}
          errorMessage={rateLimitError}
          onEmailBonus={handleEmailBonus}
          emailBonusUsed={emailBonusUsed}
        />
      )}

      <BackToTop hide={!!previewImage} />
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: getPublishedSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const fs = require('fs');
  const path = require('path');
  const { getByFilename } = require('../../lib/manifest');

  const def = getCollectionBySlug(params.slug);
  if (!def) return { notFound: true };
  if (!getPublishedSlugs().includes(def.slug)) return { notFound: true };

  // Static popularity feeds the composite ranking (relevance dominant,
  // popularity as tiebreaker). The composite scores are passed straight to
  // ImageGrid so the displayed order matches the relevance-first selection.
  let rawScores = {};
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'image-scores-static.json');
    rawScores = JSON.parse(fs.readFileSync(p, 'utf8')).scores || {};
  } catch (e) {
    console.error('Collection scores unavailable, using fallback:', e.message);
  }

  const { images, scores } = rankedImages(def, rawScores);

  const metadata = {};
  images.forEach((img) => {
    const m = getByFilename(img.filename);
    if (m) metadata[img.filename] = { alt: m.alt, title: m.title };
  });

  const seoData = collectionSeo(def, images);

  const others = getPublishedCollections()
    .filter((c) => c.slug !== def.slug)
    .map((c) => ({ slug: c.slug, persona: c.persona }));

  return {
    props: { def, images, scores, metadata, seoData, others },
    revalidate: 86400,
  };
}
