import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import Head from 'next/head';
import { categoryInfo, folderMap } from '../../../data/categoryData';
import ReviewModal from '../../../components/ReviewModal';
import RateLimitModal from '../../../components/RateLimitModal';
import RelatedCategories from '../../../components/RelatedCategories';
import CategoryHeader from '../../../components/CategoryHeader';
import ImageGrid from '../../../components/ImageGrid';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import CategorySEOContent from '../../../components/CategorySEOContent';
import cloudinaryUrls from '../../../cloudinary-urls.json';
import FAQSchema from '../../../components/FAQSchema';
import { getFAQs } from '../../../data/faqData';
import { useImageDownload } from '../../../lib/useImageDownload';
import BreadcrumbSchema from '../../../components/BreadcrumbSchema';
import ImageObjectSchema from '../../../components/ImageObjectSchema';
import BackToTop from '../../../components/BackToTop';
import HDComparisonHero from '../../../components/HDComparisonHero';
import CategoryHub from '../../../components/CategoryHub/CategoryHub';

const WALL_SHELVES_HUB_FEATURED = [
  { filename: 'wall-shelves-bright-51.webp', title: 'Wall Shelves Bright Background 51', folder: 'wall-shelves-bright' },
  { filename: 'wall-shelves-bright-54.webp', title: 'Wall Shelves Bright Background 54', folder: 'wall-shelves-bright' },
  { filename: 'wall-shelves-bright-55.webp', title: 'Wall Shelves Bright Background 55', folder: 'wall-shelves-bright' },
  { filename: 'wall-shelves-bright-10.webp', title: 'Wall Shelves Bright Background 10', folder: 'wall-shelves-bright' },
  { filename: 'wall-shelves-bright-01.webp', title: 'Wall Shelves Bright Background 1', folder: 'wall-shelves-bright' },
];

function CategoryContent({ slug, scores = {}, metadata = {} }) {
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

  if (!category) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Category Not Found</h1>
        <Link href="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <>
      <div style={{
        padding: '2.5rem 2rem 4rem',
        background: '#fff',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.5rem',
            fontSize: '0.72rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#6b7280'
          }}>
            <Link href="/" style={{
              color: '#9a6a3a',
              textDecoration: 'none',
              fontWeight: 600
            }}>
              Home
            </Link>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span style={{ color: '#111827', fontWeight: 600 }}>
              {category.name}
            </span>
          </nav>

          {slug === 'wall-shelves' ? (
            <>
              <CategoryHub
                slug={slug}
                scores={scores}
                featuredImages={WALL_SHELVES_HUB_FEATURED}
                onImageClick={setPreviewImage}
                onDownload={(image) => handleDownload(image, slug)}
                downloadingImage={downloadingImage}
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
                <p style={{
                  fontSize: '0.95rem',
                  color: '#6b7280',
                  margin: '0 0 2.5rem',
                  lineHeight: 1.6,
                }}>
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

              <RelatedCategories currentSlug={slug} />
              <CategorySEOContent category={category} slug={slug} />
            </>
          ) : (
            <>
              <CategoryHeader category={category} />

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

export default function CategoryPage({ slug, scores, metadata = {} }) {
  const router = useRouter();
  const currentSlug = slug || router.query.slug;
  const category = categoryInfo[currentSlug];

  if (!category) {
    return (
      <>
        <Head>
          <title>Category Not Found - MeetBackdrops</title>
          <meta name="description" content="The category you're looking for doesn't exist." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="canonical" href="https://meetbackdrops.com" />
        </Head>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Category Not Found</h1>
          <Link href="/">Back to Home</Link>
        </div>
      </>
    );
  }

  const categoryName = String(category.name || 'Virtual');
  // Title template: if name already ends in "Backgrounds" (e.g. "Easter Backgrounds"),
  // we must NOT repeat the word — instead append a Zoom/Teams/Meet qualifier.
  // If the constructed title would exceed 65 chars (Bing limit), fall back to a shorter form.
  const nameLower = categoryName.toLowerCase();
  const longTitle = nameLower.endsWith('backgrounds')
    ? `${categoryName} for Zoom, Teams & Meet | MeetBackdrops`
    : `${categoryName} Virtual Backgrounds | MeetBackdrops`;
  const pageTitle = longTitle.length <= 65
    ? longTitle
    : `${categoryName} | MeetBackdrops`;
  const pageDescription = String(
    category.seoDescription
    || `Studio-designed ${nameLower} virtual backgrounds for Zoom, Teams, and Google Meet. Composed for camera, not pulled from stock. Free samples available.`
  );

  const featuredImages = {
    'halloween-backgrounds': 'halloween-background-20.webp',
    'valentines-backgrounds': 'valentines-background-01.webp',
    'christmas-backgrounds': 'christmas-background-1.webp',
    'easter-backgrounds': 'easter-background-01.webp',
    'bookshelves-bright': 'bookshelves-bright-01.webp',
    'bookshelves-dark': 'bookshelves-dark-01.webp',
    'wall-shelves-bright': 'wall-shelves-bright-01.webp',
    'wall-shelves-dark': 'wall-shelves-dark-01.webp',
    'office-spaces': 'office-spaces-01.webp',
    'home-office': 'home-offices-05.webp',
    'living-rooms': 'living-room-01.webp',
    'kitchens': 'kitchen-01.webp',
    'coffee-shops': 'coffee-shop-01.webp',
    'conference-rooms': 'conference-room-01.webp',
    'art-galleries': 'art-gallery-23.webp',
    'urban-lofts': 'urban-loft-01.webp',
    'gardens-patios': 'garden-patio-01.webp',
    'historic-spaces': 'historic-space-01.webp',
    'nature-landscapes': 'nature-landscape-01.webp',
    'libraries': 'library-01.webp',
    'bokeh-backgrounds': 'bokeh-01.webp',
  };

  const featuredFilename = featuredImages[currentSlug] || 'og-image.png';
  const featuredImageObj = category.images.find(img => img.filename === featuredFilename);
  const featuredFolder = featuredImageObj?.folder || currentSlug;

  // NOTE: pageTitle and pageDescription below are the COMPLETE values seen in search results.
  // Layout does not append "| MeetBackdrops" or any other suffix.
  // Length budgets enforced by scripts/check-seo-meta.js: title ≤ 65, description 110-160.
  return (
    <>
      <Layout
        title={pageTitle}
        description={pageDescription}
        canonical={'https://meetbackdrops.com/category/' + currentSlug}
        currentPage={currentSlug}
        keywords={categoryName.toLowerCase() + ' virtual backgrounds'}
        image={`https://assets.streambackdrops.com/webp/${featuredFolder}/${featuredFilename}`}
      >
        <Head>
          <FAQSchema questions={getFAQs(currentSlug)} />
          <BreadcrumbSchema items={[
            { name: "Home", url: "https://meetbackdrops.com" },
            { name: categoryName, url: 'https://meetbackdrops.com/category/' + currentSlug }
          ]} />
          <ImageObjectSchema
  images={category.images}
  category={categoryName}
  categorySlug={currentSlug}
  baseUrl="https://meetbackdrops.com"
  scores={scores}
  metadata={metadata}
/>
          {/* Preload first row images - mobile only */}
          {category.images.slice(0, 2).map((image, i) => (
            <link
              key={i}
              rel="preload"
              as="image"
              href={`https://assets.streambackdrops.com/webp/${image.folder || currentSlug}/${image.filename}`}
              media="(max-width: 768px)"
            />
          ))}
        </Head>

<CategoryContent slug={currentSlug} scores={scores} metadata={metadata} />
      </Layout>
    </>
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
    'conference-rooms',
    'christmas-backgrounds',
    'halloween-backgrounds',
    'valentines-backgrounds',
    'easter-backgrounds',
    'spring-backgrounds',
    'summer-backgrounds',
    'eid-backgrounds',
    'bokeh-backgrounds'
  ].map((slug) => ({
    params: { slug }
  }));

  return {
    paths,
    fallback: false
  };
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

  try {
    // Build metadata from canonical manifest (keyed by filename to match
    // ImageObjectSchema's lookup). Scope to this category only so ISR payloads
    // stay small. Intersect with categoryData.js so only images that the page
    // actually renders contribute metadata.
    const { getCategoryIndex } = require('../../../lib/imageIndex');
    const categoryFilenames = new Set(category.images.map(img => img.filename));
    const manifestImages = getCategoryIndex(params.slug)
      .filter(img => categoryFilenames.has(img.filename));
    imageMetadata = Object.fromEntries(
      manifestImages.map(img => [img.filename, {
        filename: img.filename,
        title: img.title,
        description: img.description,
        alt: img.alt,
        keywords: img.keywords,
        width: img.width,
        height: img.height,
      }])
    );

    // ── Primary: fetch live scores from Google Sheets via API ──
    // During ISR revalidation (nightly cron) this gives fresh real-time scores.
    // During initial build on Vercel the server isn't up yet, so this will fail
    // gracefully and fall through to the static seed file below.
    let liveLoaded = false;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://meetbackdrops.com');
      const response = await fetch(`${baseUrl}/api/calculate-scores`, { signal: AbortSignal.timeout(8000) });

      if (response.ok) {
        const data = await response.json();
        const allScores = data.scores || {};
        category.images.forEach(image => {
          const imageStats = allScores[image.filename];
          scores[image.filename] = imageStats?.score ?? 30;
        });
        liveLoaded = Object.keys(scores).length > 0;
      }
    } catch (e) {
      // Expected to fail during initial build — static file handles that case
      console.log('Live scores unavailable, falling back to static file:', e.message);
    }

    // ── Fallback: static seed file (committed to repo, used on initial build) ──
    // Generated once from CSV via: node scripts/generate-scores.js <csv>
    // The nightly cron keeps pages fresh via ISR so this file rarely needs updating.
    if (!liveLoaded) {
      const staticScoresPath = path.join(process.cwd(), 'public', 'data', 'image-scores-static.json');
      if (fs.existsSync(staticScoresPath)) {
        try {
          const staticData = JSON.parse(fs.readFileSync(staticScoresPath, 'utf8'));
          const allScores = staticData.scores || {};
          category.images.forEach(image => {
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

  // ── Last resort: neutral defaults ──
  if (Object.keys(scores).length === 0) {
    category.images.forEach(image => {
      scores[image.filename] = 30;
    });
  }

  return {
    props: {
      slug: params.slug,
      scores,
      metadata: imageMetadata
    },
    revalidate: 3600
  };
}
