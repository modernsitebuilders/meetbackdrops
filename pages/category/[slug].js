import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Head from 'next/head';
import { categoryInfo, folderMap } from '../../data/categoryData';
import ReviewModal from '../../components/ReviewModal';
import RateLimitModal from '../../components/RateLimitModal';
import RelatedCategories from '../../components/RelatedCategories';
import CategoryHeader from '../../components/CategoryHeader';
import ImageGrid from '../../components/ImageGrid';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import CategorySEOContent from '../../components/CategorySEOContent';
import cloudinaryUrls from '../../cloudinary-urls.json';
import FAQSchema from '../../components/FAQSchema';
import { getFAQs } from '../../data/faqData';
import { useImageDownload } from '../../lib/useImageDownload';
import BreadcrumbSchema from '../../components/BreadcrumbSchema'; 
import ImageObjectSchema from '../../components/ImageObjectSchema';
import BackToTop from '../../components/BackToTop';
import HDComparisonHero from '../../components/HDComparisonHero';

function CategoryContent({ slug, scores = {}}) {
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
        padding: '2rem',
        background: '#f9fafb',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: '#6b7280'
          }}>
            <Link href="/" style={{
              color: '#2563eb',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}>
              Home
            </Link>
            <span>›</span>
            <span style={{ color: '#111827', fontWeight: '500' }}>
              {category.name}
            </span>
          </nav>

          <CategoryHeader category={category} />

<ImageGrid
  images={category.images}
  scores={scores}
  slug={slug}
  onImageClick={setPreviewImage}
  onDownload={(image) => handleDownload(image, slug)}
  cloudinaryUrls={cloudinaryUrls}
  downloadingImage={downloadingImage}
/>

          <HDComparisonHero slug={slug} images={category.images} scores={scores} />
          <RelatedCategories currentSlug={slug} />
          <CategorySEOContent category={category} />
        </div>
       </div>

      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          slug={slug}
          onClose={() => setPreviewImage(null)}
          onDownload={(image) => handleDownload(image, slug)}
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
          <title>Category Not Found - StreamBackdrops</title>
          <meta name="description" content="The category you're looking for doesn't exist." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="canonical" href="https://streambackdrops.com" />
        </Head>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Category Not Found</h1>
          <Link href="/">Back to Home</Link>
        </div>
      </>
    );
  }

  const categoryName = String(category.name || 'Virtual');
  const pageTitle = currentSlug === 'christmas-backgrounds'
  ? '150+ Free Christmas Backgrounds for Google Meet, Zoom & Teams'
  : currentSlug === 'valentines-backgrounds'
  ? 'Free Valentine\'s Day Backgrounds for Zoom, Teams & Google Meet'
  : `Free ${categoryName} Backgrounds for Zoom & Teams | StreamBackdrops`;
  const pageDescription = currentSlug === 'christmas-backgrounds'
  ? 'Download 150+ free Christmas virtual backgrounds for Google Meet, Zoom & Teams. Festive holiday scenes, Christmas trees & winter decorations. No signup required.'
  : currentSlug === 'valentines-backgrounds'
  ? 'Download free Valentine\'s Day virtual backgrounds for Zoom, Teams & Google Meet. Romantic hearts, flowers & Valentine scenes. Free instant download, no watermarks.'
  : String(category.seoDescription || `Download free ${categoryName.toLowerCase()} virtual backgrounds for Zoom, Teams & Google Meet. No signup required, no watermarks — instant download. Perfect for remote work and video calls.`);
  
  const featuredImages = {
    'halloween-backgrounds': 'halloween-background-20.webp',
    'valentines-backgrounds': 'valentines-background-01.webp',
    'christmas-backgrounds': 'christmas-background-1.webp',
    'easter-backgrounds': 'easter-background-01.webp',
    'bookshelves-bright': 'bookshelves-bright-01.webp',
    'bookshelves-dark': 'bookshelves-dark-01.webp',
    'wall-shelves-bright': 'wall-shelves-bright-01.webp',
    'wall-shelves-dark': 'wall-shelves-dark-01.webp',
    'office-spaces': 'office-1.webp',
    'home-office': 'home-offices-05.webp',
    'living-rooms': 'living-room-1.webp',
    'kitchens': 'kitchen-1.webp',
    'coffee-shops': 'coffee-shop-01.webp',
    'conference-rooms': 'conference-room-01.webp',
    'art-galleries': 'art-gallery-23.webp',
    'urban-lofts': 'urban-loft-01.webp',
    'gardens-patios': 'garden-patio-01.webp',
    'historic-spaces': 'historic-space-01.webp',
    'nature-landscapes': 'nature-1.webp',
    'libraries': 'library-01.webp',
    'bokeh-backgrounds': 'bokeh-01.webp',
  };
  
  const featuredImage = featuredImages[currentSlug] || 'og-image.png';

  return (
    <>
      <Layout
        title={pageTitle}
        description={pageDescription}
        canonical={'https://streambackdrops.com/category/' + currentSlug}
        currentPage={currentSlug}
        keywords={categoryName.toLowerCase() + ' virtual backgrounds'}
        image={'/images/' + currentSlug + '/' + featuredImage}
      >
        <Head>
          <FAQSchema questions={getFAQs(currentSlug)} />
          <BreadcrumbSchema items={[
            { name: "Home", url: "https://streambackdrops.com" },
            { name: categoryName, url: 'https://streambackdrops.com/category/' + currentSlug }
          ]} />
          <ImageObjectSchema 
  images={category.images} 
  category={categoryName}
  categorySlug={currentSlug}
  baseUrl="https://streambackdrops.com"
  scores={scores}
  metadata={metadata}
/>
          {/* Preload first row images - mobile only */}
          {category.images.slice(0, 2).map((image, i) => (
            <link
              key={i}
              rel="preload"
              as="image"
              href={`/images/${currentSlug}/${image.filename}`}
              media="(max-width: 768px)"
            />
          ))}
        </Head>
        
<CategoryContent slug={currentSlug} scores={scores} />
      </Layout>
    </>
  );
}

export async function getStaticPaths() {
  const paths = [
    'bookshelves-bright',
    'bookshelves-dark',
    'wall-shelves-bright',
    'wall-shelves-dark',
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
    // Load metadata
    const metadataPath = path.join(process.cwd(), 'public', 'data', 'image-metadata-complete.json');
    imageMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // ── Primary: fetch live scores from Google Sheets via API ──
    // During ISR revalidation (nightly cron) this gives fresh real-time scores.
    // During initial build on Vercel the server isn't up yet, so this will fail
    // gracefully and fall through to the static seed file below.
    let liveLoaded = false;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://streambackdrops.com');
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