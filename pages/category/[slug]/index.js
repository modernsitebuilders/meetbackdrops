// pages/category/[slug]/index.js
//
// SEO is supplied by a single pure deterministic function: `seo(slug)` from
// `lib/seo/seo.js`. The function returns a frozen object — Layout and
// children receive its fields directly and reconstruct nothing. There is no
// pipeline, no boundary, no fallback layer: the function IS the contract.

import Link from 'next/link';
import { useState } from 'react';
import Layout from '../../../components/Layout';
import Head from 'next/head';
import { categoryInfo } from '../../../data/categoryData.js';
import ReviewModal from '../../../components/ReviewModal';
import RateLimitModal from '../../../components/RateLimitModal';
import RelatedCategories from '../../../components/RelatedCategories';
import CategoryHeader from '../../../components/CategoryHeader';
import ImageGrid from '../../../components/ImageGrid';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import CategorySEOContent from '../../../components/CategorySEOContent';
import cloudinaryUrls from '../../../cloudinary-urls.json';
import { useImageDownload } from '../../../lib/useImageDownload';
import BackToTop from '../../../components/BackToTop';
import HDComparisonHero from '../../../components/HDComparisonHero';
import CategoryHub from '../../../components/CategoryHub/CategoryHub';
import CollectionsForCategory from '../../../components/CollectionsForCategory';
import { seo } from '../../../lib/seo/seo.js';

const WALL_SHELVES_HUB_FEATURED = [
  { filename: 'minimalist-interior-wooden-shelf-holding-books-potted-plant-47fe79fc.webp', title: 'Wall Shelves Bright Background 51', folder: 'wall-shelves-bright' },
  { filename: 'minimalist-shelving-books-dried-plants-neutral-tones-softly-6536c05c.webp', title: 'Wall Shelves Bright Background 54', folder: 'wall-shelves-bright' },
  { filename: 'minimalist-shelf-various-vases-neutral-tones-soft-greenery-e6eddef7.webp', title: 'Wall Shelves Bright Background 55', folder: 'wall-shelves-bright' },
  { filename: 'bright-modern-interior-white-wall-shelves-holding-books-35facfd9.webp', title: 'Wall Shelves Bright Background 10', folder: 'wall-shelves-bright' },
  { filename: 'two-wooden-shelves-against-white-wall-one-books-plant-other-d50bd43b.webp', title: 'Wall Shelves Bright Background 1' , folder: 'wall-shelves-bright' },
];

const HUB_SUBHEAD =
  'Studio-styled wall shelves — designed shelf by shelf for camera, not lifted from a stock library.';

function CategoryContent({ slug, scores = {}, metadata = {}, seoData, collections = [] }) {
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
  const category = categoryInfo[slug];
  if (!category) return null; // unreachable: gated by getStaticProps

  const eyebrow = `The Collection · ${category.name}`;

  return (
    <>
      <div style={{ padding: '2.5rem 2rem 4rem', background: '#fff', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.5rem',
            fontSize: '0.72rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#6b7280',
          }}>
            <Link href="/" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>
              Home
            </Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span style={{ color: '#111827', fontWeight: 600 }}>{category.name}</span>
          </nav>

          {slug === 'wall-shelves' ? (
            <>
              <CategoryHub
                slug={slug}
                scores={scores}
                featuredImages={WALL_SHELVES_HUB_FEATURED}
                onImageClick={setPreviewImage}
                h1={seoData.h1}
                subhead={HUB_SUBHEAD}
              />

              <section
                id="full-library"
                style={{
                  marginTop: '5rem',
                  paddingTop: '3rem',
                  borderTop: '1px solid #e6e2dc',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#9a6a3a',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  The full collection
                </div>
                <h2 style={{
                  fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#111827',
                  margin: '0 0 0.75rem',
                }}>
                  Every Wall Shelf background
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0 0 2.5rem', lineHeight: 1.6 }}>
                  The complete category library, composed for camera and tuned for codec compression.
                </p>
              </section>

              <HDComparisonHero slug={slug} images={category.images} scores={scores} />

              <ImageGrid
                images={category.images}
                scores={scores}
                slug={slug}
                metadata={metadata}
                onImageClick={setPreviewImage}
                onDownload={(image) => handleDownload(image, slug)}
                cloudinaryUrls={cloudinaryUrls}
                downloadingImage={downloadingImage}
              />

              <CollectionsForCategory collections={collections} />
              <RelatedCategories currentSlug={slug} />
              <CategorySEOContent category={category} slug={slug} />
            </>
          ) : (
            <>
              <CategoryHeader
                h1={seoData.h1}
                eyebrow={eyebrow}
                description={category.description}
              />

              <HDComparisonHero slug={slug} images={category.images} scores={scores} />

              <ImageGrid
                images={category.images}
                scores={scores}
                slug={slug}
                metadata={metadata}
                onImageClick={setPreviewImage}
                onDownload={(image) => handleDownload(image, slug)}
                cloudinaryUrls={cloudinaryUrls}
                downloadingImage={downloadingImage}
              />

              <CollectionsForCategory collections={collections} />
              <RelatedCategories currentSlug={slug} />
              <CategorySEOContent category={category} slug={slug} />
            </>
          )}
        </div>
      </div>

      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          slug={slug}
          onClose={() => setPreviewImage(null)}
          onDownload={(image, eventType) => handleDownload(image, slug, eventType)}
          cloudinaryUrls={cloudinaryUrls}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          onClose={() => setShowReviewModal(false)}
          downloadCount={downloadCount}
        />
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
    </>
  );
}

export default function CategoryPage({ slug, scores, metadata = {}, collections = [] }) {
  // `slug` is supplied by getStaticProps (fallback:false + notFound:true on
  // missing). seo() throws on invalid input — there is no fallback branch,
  // no router-derived inference, no defensive "if (!seo)".
  const s = seo(slug);

  return (
    <Layout
      title={s.title}
      description={s.description}
      canonical={s.canonical}
      currentPage={slug}
      keywords={s.keywords}
      image={s.ogImage}
      structuredData={s.schema}
    >
      <Head>
        {categoryInfo[slug].images.slice(0, 2).map((image, i) => (
          <link
            key={i}
            rel="preload"
            as="image"
            href={`https://assets.streambackdrops.com/webp/${image.folder || slug}/${image.filename}`}
            media="(max-width: 768px)"
          />
        ))}
      </Head>

      <CategoryContent slug={slug} scores={scores} metadata={metadata} seoData={s} collections={collections} />
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = [
    'bookshelves',
    'wall-shelves',
    'office-spaces',
    'home-office',
    'living-rooms',
    'kitchens',
    'coffee-shops',
    'art-galleries',
    'urban-lofts',
    'gardens-patios',
    'historic-spaces',
    'nature-landscapes',
    'libraries',
    'christmas-backgrounds',
    'halloween-backgrounds',
    'valentines-backgrounds',
    'easter-backgrounds',
    'spring-backgrounds',
    'summer-backgrounds',
    'bokeh-backgrounds',
  ].map((slug) => ({ params: { slug } }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const fs = require('fs');
  const path = require('path');

  let scores = {};
  let imageMetadata = {};

  const category = categoryInfo[params.slug];
  if (!category) {
    return { notFound: true };
  }

  // Persona collections that draw from this category — powers the
  // "popular with these professions" strip. Deterministic, manifest-driven.
  let collections = [];
  try {
    const { getCollectionsForCategory } = require('../../../lib/collections/engine');
    collections = getCollectionsForCategory(params.slug);
  } catch (e) {
    console.error('Collections-for-category lookup failed:', e.message);
  }

  try {
    const { getCategoryIndex } = require('../../../lib/imageIndex');
    const categoryFilenames = new Set(category.images.map((img) => img.filename));
    const manifestImages = getCategoryIndex(params.slug)
      .filter((img) => categoryFilenames.has(img.filename));
    imageMetadata = Object.fromEntries(
      manifestImages.map((img) => [img.filename, {
        filename: img.filename,
        title: img.title,
        description: img.description,
        alt: img.alt,
        keywords: img.keywords,
        width: img.width,
        height: img.height,
      }])
    );

    let liveLoaded = false;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://meetbackdrops.com');
      const response = await fetch(`${baseUrl}/api/calculate-scores`, { signal: AbortSignal.timeout(8000) });
      if (response.ok) {
        const data = await response.json();
        const allScores = data.scores || {};
        category.images.forEach((image) => {
          const imageStats = allScores[image.filename];
          scores[image.filename] = imageStats?.score ?? 30;
        });
        liveLoaded = Object.keys(scores).length > 0;
      }
    } catch (e) {
      console.log('Live scores unavailable, falling back to static file:', e.message);
    }

    if (!liveLoaded) {
      const staticScoresPath = path.join(process.cwd(), 'public', 'data', 'image-scores-static.json');
      if (fs.existsSync(staticScoresPath)) {
        try {
          const staticData = JSON.parse(fs.readFileSync(staticScoresPath, 'utf8'));
          const allScores = staticData.scores || {};
          category.images.forEach((image) => {
            const entry = allScores[image.filename];
            scores[image.filename] = entry?.score ?? 30;
          });
        } catch (e) {
          console.error('Failed to read static scores file:', e.message);
        }
      }
    }
  } catch (error) {
    console.error('Build-time scoring failed, using fallback scores:', error.message);
  }

  if (Object.keys(scores).length === 0) {
    category.images.forEach((image) => {
      scores[image.filename] = 30;
    });
  }

  return {
    props: {
      slug: params.slug,
      scores,
      metadata: imageMetadata,
      collections,
    },
    revalidate: 3600,
  };
}
