// pages/[platform]/[theme].js
//
// Platform × THEME programmatic pages: /zoom-backgrounds/office,
// /microsoft-teams-backgrounds/conference-room, /google-meet-backgrounds/bookshelf …
//
// One template generates the entire matrix (platforms × published themes). The
// image grid is the THEME's curated set (decided by the shared collections
// engine); the platform supplies the intent, the setup HowTo, and the FAQ. This
// is what keeps the pages distinct rather than duplicative: same grid, genuinely
// different query, copy, and instructions per platform.
//
// Anti-thin-content: getStaticPaths only emits themes that clear their minCount
// gate, so no page ever ships with a sparse grid.

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

export default function PlatformThemePage({
  platform, theme, images, scores, metadata, seoData,
  sourceCategories, siblingThemes, crossPlatform,
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
          {/* Breadcrumb: Home · Platform · Theme */}
          <nav style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap',
            fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6b7280',
          }}>
            <Link prefetch={false} href="/" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <Link prefetch={false} href={`/${platform.slug}`} style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>{platform.name}</Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span style={{ color: '#111827', fontWeight: 600 }}>{theme.label}</span>
          </nav>

          {/* Header — platform intro para + theme intro para = distinct copy per cell */}
          <header style={{ marginBottom: '2.5rem', maxWidth: '760px' }}>
            <div style={eyebrowStyle}>{theme.label} · {platform.eyebrow}</div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-0.02em',
              color: '#111827', margin: '0 0 1.25rem', lineHeight: 1.1,
            }}>
              {seoData.h1}
            </h1>
            <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.7, margin: '0 0 1rem' }}>
              {theme.intro}
            </p>
            <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
              {platform.intro[0]}
            </p>
            <Link prefetch={false} href={`/backgrounds/${theme.slug}`} style={{
              color: '#9a6a3a', fontWeight: 600, textDecoration: 'underline',
              textUnderlineOffset: '3px', fontSize: '0.95rem',
            }}>
              See all {theme.modifier} backgrounds →
            </Link>
          </header>

          <ImageGrid
            images={images}
            scores={scores}
            slug={`${platform.slug}/${theme.slug}`}
            metadata={metadata}
            onImageClick={setPreviewImage}
            onDownload={(image) => handleDownload(image, image.category || platform.slug)}
            cloudinaryUrls={cloudinaryUrls}
            downloadingImage={downloadingImage}
          />

          {/* Setup — platform-specific, visible + HowTo schema */}
          <PlatformSetup platform={platform} />

          {/* Same look, other platforms — horizontal edges of the matrix */}
          {crossPlatform.length > 0 && (
            <section style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' }}>
              <div style={eyebrowStyle}>Same look, another platform</div>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: '0 0 1.25rem' }}>
                {theme.label} backgrounds for other apps
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {crossPlatform.map((o) => (
                  <Link prefetch={false} key={o.slug} href={`/${o.slug}/${theme.slug}`} style={chipStyle}>
                    {theme.label} for {o.shortName}
                    <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Source categories — down into the full library */}
          {sourceCategories.length > 0 && (
            <section style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' }}>
              <div style={eyebrowStyle}>Browse the full categories</div>
              <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0 0 1.25rem', lineHeight: 1.6, maxWidth: '640px' }}>
                These {theme.plural} are drawn from the categories below. Browse each in full for every option.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {sourceCategories.map((c) => (
                  <Link prefetch={false} key={c.slug} href={`/category/${c.slug}`} style={chipStyle}>
                    {c.name}
                    <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Other looks on this platform — vertical edges of the matrix */}
          {siblingThemes.length > 0 && (
            <section style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: '0 0 1.25rem' }}>
                Other {platform.name} background styles
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {siblingThemes.map((t) => (
                  <Link prefetch={false} key={t.slug} href={`/${platform.slug}/${t.slug}`} style={chipStyle}>
                    {t.label}
                    <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ — platform-specific, visible + FAQPage schema */}
          <FaqAccordion faqs={platform.faqs} heading={`${theme.label} backgrounds on ${platform.name} — FAQ`} />
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
  const { getPlatformThemePaths } = require('../../lib/platforms/engine');
  return {
    paths: getPlatformThemePaths().map(({ platform, theme }) => ({ params: { platform, theme } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const fs = require('fs');
  const path = require('path');
  const { getByFilename } = require('../../lib/manifest');
  const {
    getPlatformBySlug, getThemeBySlug, getPublishedThemeSlugs,
    imagesForPlatformTheme, platformThemeSeo, getPublishedThemes, otherPlatforms,
  } = require('../../lib/platforms/engine');
  const { CATEGORIES } = require('../../lib/categories-config');

  const platform = getPlatformBySlug(params.platform);
  const theme = getThemeBySlug(params.theme);
  if (!platform || !theme) return { notFound: true };
  if (!getPublishedThemeSlugs().includes(theme.slug)) return { notFound: true };

  let rawScores = {};
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'image-scores-static.json');
    rawScores = JSON.parse(fs.readFileSync(p, 'utf8')).scores || {};
  } catch (e) {
    console.error('Platform-theme scores unavailable, using fallback:', e.message);
  }

  const { images, scores } = imagesForPlatformTheme(theme, rawScores);

  const metadata = {};
  images.forEach((img) => {
    const m = getByFilename(img.filename);
    if (m) metadata[img.filename] = { alt: m.alt, title: m.title };
  });

  const seoData = platformThemeSeo(platform, theme, images);

  const sourceCategories = (theme.rule?.categoriesAny || [])
    .map((slug) => (CATEGORIES[slug] ? { slug, name: CATEGORIES[slug].name } : null))
    .filter(Boolean);

  const siblingThemes = getPublishedThemes()
    .filter((t) => t.slug !== theme.slug)
    .map((t) => ({ slug: t.slug, label: t.label }));

  return {
    props: {
      platform,
      theme,
      images,
      scores,
      metadata,
      seoData,
      sourceCategories,
      siblingThemes,
      crossPlatform: otherPlatforms(platform.slug),
    },
    revalidate: 86400,
  };
}
