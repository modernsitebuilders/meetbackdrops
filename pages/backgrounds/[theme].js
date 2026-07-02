// pages/backgrounds/[theme].js
//
// Standalone THEME collection pages: /backgrounds/office, /backgrounds/bookshelf,
// /backgrounds/minimalist … — the "browse by style/room" axis of discovery.
//
// A curated view over the existing catalog, decided by the same rule engine as
// personas and the platform matrix (lib/collections/themeEngine.js → the shared
// ./engine). No new images. These pages target exact-match style intent
// ("office virtual backgrounds") and act as the hub that ties a theme to its
// four platform×theme pages, its source categories, and the professions that use
// it — every edge of the discovery graph meets here.
//
// Route safety: an explicit /backgrounds/* segment always wins over the root
// [platform] dynamic, and getStaticPaths (fallback:false) emits only published
// themes, so no thin page and no collision.

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
const sectionStyle = { marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' };
const h2Style = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: 600,
  color: '#111827', margin: '0 0 1.25rem',
};

export default function ThemeCollectionPage({
  theme, images, scores, metadata, seoData, faqs = [],
  platforms, sourceCategories, relatedPersonas, siblingThemes,
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
          {/* Breadcrumb: Home · Backgrounds by Style · Theme */}
          <nav style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap',
            fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6b7280',
          }}>
            <Link prefetch={false} href="/" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <Link prefetch={false} href="/backgrounds" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>Backgrounds by Style</Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span style={{ color: '#111827', fontWeight: 600 }}>{theme.label}</span>
          </nav>

          {/* Header */}
          <header style={{ marginBottom: '2.5rem', maxWidth: '760px' }}>
            <div style={eyebrowStyle}>Browse by style</div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-0.02em',
              color: '#111827', margin: '0 0 1.25rem', lineHeight: 1.1,
            }}>
              {seoData.h1}
            </h1>
            <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
              {theme.intro}
            </p>
          </header>

          <ImageGrid
            images={images}
            scores={scores}
            slug={`backgrounds/${theme.slug}`}
            metadata={metadata}
            onImageClick={setPreviewImage}
            onDownload={(image) => handleDownload(image, image.category || theme.slug)}
            cloudinaryUrls={cloudinaryUrls}
            downloadingImage={downloadingImage}
          />

          {/* Use on a platform — the four platform×theme pages */}
          {platforms.length > 0 && (
            <section style={sectionStyle}>
              <div style={eyebrowStyle}>Set up on your app</div>
              <h2 style={h2Style}>{theme.label} backgrounds by platform</h2>
              <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0 0 1.25rem', lineHeight: 1.6, maxWidth: '640px' }}>
                Step-by-step setup and picks tuned for each video-call app.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {platforms.map((p) => (
                  <Link prefetch={false} key={p.slug} href={`/${p.slug}/${theme.slug}`} style={chipStyle}>
                    {theme.label} for {p.shortName}
                    <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Source categories */}
          {sourceCategories.length > 0 && (
            <section style={sectionStyle}>
              <div style={eyebrowStyle}>Browse the full categories</div>
              <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0 0 1.25rem', lineHeight: 1.6, maxWidth: '640px' }}>
                These {theme.plural} are drawn from the categories below — browse each in full for every option.
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

          {/* Related professions — connects the style axis to the persona axis */}
          {relatedPersonas.length > 0 && (
            <section style={sectionStyle}>
              <div style={eyebrowStyle}>Curated for professions</div>
              <h2 style={h2Style}>Professionals who use {theme.modifier} backgrounds</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {relatedPersonas.map((p) => (
                  <Link prefetch={false} key={p.slug} href={`/collections/${p.slug}`} style={chipStyle}>
                    {p.persona}
                    <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ — theme-specific, visible + FAQPage schema */}
          <FaqAccordion faqs={faqs} heading={`${theme.label} backgrounds — frequently asked`} />

          {/* Sibling themes */}
          {siblingThemes.length > 0 && (
            <section style={sectionStyle}>
              <h2 style={h2Style}>Browse other styles</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {siblingThemes.map((t) => (
                  <Link prefetch={false} key={t.slug} href={`/backgrounds/${t.slug}`} style={chipStyle}>
                    {t.label}
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
          slug={previewImage.category || theme.slug}
          onClose={() => setPreviewImage(null)}
          onDownload={(image, eventType) => handleDownload(image, image.category || theme.slug, eventType)}
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
  const { getPublishedThemeSlugs } = require('../../lib/collections/themeEngine');
  return {
    paths: getPublishedThemeSlugs().map((theme) => ({ params: { theme } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const fs = require('fs');
  const path = require('path');
  const { getByFilename } = require('../../lib/manifest');
  const {
    getThemeBySlug, getPublishedThemeSlugs, getPublishedThemes,
    resolveThemeImages, themeCollectionSeo, themeSourceCategories, relatedPersonasForTheme,
  } = require('../../lib/collections/themeEngine');
  const { getPlatforms } = require('../../lib/platforms/engine');
  const { getThemeFaqs } = require('../../data/collections/themeFaqs');

  const theme = getThemeBySlug(params.theme);
  if (!theme) return { notFound: true };
  if (!getPublishedThemeSlugs().includes(theme.slug)) return { notFound: true };

  let rawScores = {};
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'image-scores-static.json');
    rawScores = JSON.parse(fs.readFileSync(p, 'utf8')).scores || {};
  } catch (e) {
    console.error('Theme collection scores unavailable, using fallback:', e.message);
  }

  const { images, scores } = resolveThemeImages(theme, rawScores);

  const metadata = {};
  images.forEach((img) => {
    const m = getByFilename(img.filename);
    if (m) metadata[img.filename] = { alt: m.alt, title: m.title };
  });

  const faqs = getThemeFaqs(theme.slug);
  const seoData = themeCollectionSeo(theme, images, faqs);

  const platforms = getPlatforms().map((p) => ({ slug: p.slug, shortName: p.shortName }));
  const siblingThemes = getPublishedThemes()
    .filter((t) => t.slug !== theme.slug)
    .map((t) => ({ slug: t.slug, label: t.label }));

  return {
    props: {
      theme,
      images,
      scores,
      metadata,
      seoData,
      faqs,
      platforms,
      sourceCategories: themeSourceCategories(theme),
      relatedPersonas: relatedPersonasForTheme(theme),
      siblingThemes,
    },
    revalidate: 86400,
  };
}
