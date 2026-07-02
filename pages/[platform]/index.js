// pages/[platform]/index.js
//
// Platform LANDING pages: /zoom-backgrounds, /google-meet-backgrounds,
// /microsoft-teams-backgrounds, /webex-backgrounds.
//
// A reusable, data-driven template — one file serves every platform in
// data/platforms.js. The image grid is "best of the whole library" (platform
// never filters images); the SEO value is the platform-specific intent, copy,
// setup HowTo, and FAQ, plus the internal-link hub into themes, categories, and
// sibling platforms.
//
// Route safety: this is a root dynamic segment, but getStaticPaths returns ONLY
// the four platform slugs with fallback:false, so every other single-segment
// path (/about, /faq, …) is served by its explicit page and unknown paths 404.

import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';
import Layout from '../../components/Layout';
import ImageGrid from '../../components/ImageGrid';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import FaqAccordion from '../../components/FaqAccordion';
import ReviewModal from '../../components/ReviewModal';
import RateLimitModal from '../../components/RateLimitModal';
import BackToTop from '../../components/BackToTop';
import PlatformSetup from '../../components/PlatformSetup';
import cloudinaryUrls from '../../cloudinary-urls.json';
import { useImageDownload } from '../../lib/useImageDownload';

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

export default function PlatformLanding({
  platform, images, scores, metadata, seoData, themes, categories, others,
}) {
  const [previewImage, setPreviewImage] = useState(null);
  const {
    handleDownload, showReviewModal, setShowReviewModal,
    showRateLimitModal, setShowRateLimitModal, rateLimitError,
    downloadCount, downloadingImage, emailBonusUsed, handleEmailBonus,
  } = useImageDownload(cloudinaryUrls);

  return (
    <Layout
      title={seoData.title}
      description={seoData.description}
      canonical={seoData.canonical}
      keywords={seoData.keywords}
      image={seoData.ogImage}
      structuredData={seoData.schema}
      currentPage={platform.slug}
    >
      <Head>
        {images.slice(0, 2).map((image, i) => (
          <link key={i} rel="preload" as="image"
            href={`https://assets.streambackdrops.com/webp/${image.folder}/${image.filename}`}
            media="(max-width: 768px)" />
        ))}
      </Head>

      <div style={{ padding: '2.5rem 2rem 4rem', background: '#fff', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem',
            fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6b7280',
          }}>
            <Link prefetch={false} href="/" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span style={{ color: '#111827', fontWeight: 600 }}>{platform.name}</span>
          </nav>

          {/* Header */}
          <header style={{ marginBottom: '2.5rem', maxWidth: '760px' }}>
            <div style={eyebrowStyle}>{platform.eyebrow}</div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-0.02em',
              color: '#111827', margin: '0 0 1.25rem', lineHeight: 1.1,
            }}>
              {platform.h1}
            </h1>
            {platform.intro.map((para, i) => (
              <p key={i} style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.7, margin: i === 0 ? '0 0 1rem' : 0 }}>
                {para}
              </p>
            ))}
          </header>

          {/* Browse by space — theme cards (the platform × theme matrix entry point) */}
          {themes.length > 0 && (
            <section style={{ marginBottom: '3rem' }}>
              <div style={eyebrowStyle}>Browse by space</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {themes.map((t) => (
                  <Link prefetch={false} key={t.slug} href={`/${platform.slug}/${t.slug}`} style={chipStyle}>
                    {t.label}
                    <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Featured grid — best of the library */}
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: 600,
            color: '#111827', margin: '0 0 1.25rem',
          }}>
            Popular backgrounds for {platform.name}
          </h2>
          <ImageGrid
            images={images}
            scores={scores}
            slug={platform.slug}
            metadata={metadata}
            onImageClick={setPreviewImage}
            onDownload={(image) => handleDownload(image, image.category || platform.slug)}
            cloudinaryUrls={cloudinaryUrls}
            downloadingImage={downloadingImage}
          />

          {/* Setup steps — visible + mirrors the HowTo schema */}
          <PlatformSetup platform={platform} />

          {/* Works great for — category cross-links */}
          {categories.length > 0 && (
            <section style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' }}>
              <div style={eyebrowStyle}>Browse full categories</div>
              <h2 style={{
                fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: 600,
                color: '#111827', margin: '0 0 1.25rem',
              }}>
                Categories that work great on {platform.name}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {categories.map((c) => (
                  <Link prefetch={false} key={c.slug} href={`/category/${c.slug}`} style={chipStyle}>
                    {c.name}
                    <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ — visible + FAQPage schema */}
          <FaqAccordion faqs={platform.faqs} heading={`${platform.name} backgrounds — frequently asked`} />

          {/* Sibling platforms */}
          {others.length > 0 && (
            <section style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: '0 0 1.25rem' }}>
                Backgrounds for other platforms
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {others.map((o) => (
                  <Link prefetch={false} key={o.slug} href={`/${o.slug}`} style={chipStyle}>
                    {o.name}
                    <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
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
          slug={previewImage.category || platform.slug}
          onClose={() => setPreviewImage(null)}
          onDownload={(image, eventType) => handleDownload(image, image.category || platform.slug, eventType)}
          cloudinaryUrls={cloudinaryUrls}
        />
      )}
      {showReviewModal && <ReviewModal onClose={() => setShowReviewModal(false)} downloadCount={downloadCount} />}
      {showRateLimitModal && (
        <RateLimitModal onClose={() => setShowRateLimitModal(false)} errorMessage={rateLimitError} onEmailBonus={handleEmailBonus} emailBonusUsed={emailBonusUsed} />
      )}
      <BackToTop hide={!!previewImage} />
    </Layout>
  );
}

export async function getStaticPaths() {
  const { getPlatforms } = require('../../lib/platforms/engine');
  return {
    paths: getPlatforms().map((p) => ({ params: { platform: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const fs = require('fs');
  const path = require('path');
  const { getByFilename } = require('../../lib/manifest');
  const {
    getPlatformBySlug, featuredForPlatform, platformSeo,
    platformCategories, themeCards, otherPlatforms,
  } = require('../../lib/platforms/engine');

  const platform = getPlatformBySlug(params.platform);
  if (!platform) return { notFound: true };

  let rawScores = {};
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'image-scores-static.json');
    rawScores = JSON.parse(fs.readFileSync(p, 'utf8')).scores || {};
  } catch (e) {
    console.error('Platform landing scores unavailable, using fallback:', e.message);
  }

  const { images, scores } = featuredForPlatform(rawScores, 24);

  const metadata = {};
  images.forEach((img) => {
    const m = getByFilename(img.filename);
    if (m) metadata[img.filename] = { alt: m.alt, title: m.title };
  });

  const seoData = platformSeo(platform, images);

  return {
    props: {
      platform,
      images,
      scores,
      metadata,
      seoData,
      themes: themeCards(),
      categories: platformCategories(platform),
      others: otherPlatforms(platform.slug),
    },
    revalidate: 86400,
  };
}
