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
import HDBanner from '../../components/HDBanner';
import { findMatchingAnalytics } from '../../lib/imageScoring';

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

          {/* HD Banner - High Traffic Categories */}
{['bookshelves-bright', 'bookshelves-dark', 'wall-shelves-bright', 'wall-shelves-dark', 'office-spaces', 'nature-landscapes'].includes(slug) && (
  <HDBanner />
)}

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
  ? '150+ Free Christmas Backgrounds 2025 - Zoom, Teams, Google Meet'
  : categoryName + ' - Free | StreamBackdrops';
  const pageDescription = String(category.seoDescription || `Download free ${categoryName.toLowerCase()} backgrounds. Perfect for Zoom, Teams & Google Meet.`);
  
  const featuredImages = {
    'halloween-backgrounds': 'halloween-background-20.webp',
    'valentines-backgrounds': 'valentines-background-01.webp',
    'christmas-backgrounds': 'christmas-background-1.webp',
    'bookshelves-bright': 'bookshelves-bright-01.webp',
    'bookshelves-dark': 'bookshelves-dark-01.webp',
    'wall-shelves-bright': 'wall-shelves-bright-01.webp',
    'wall-shelves-dark': 'wall-shelves-dark-01.webp',
    'office-spaces': 'office-1.webp',
    'living-rooms': 'living-room-1.webp',
    'kitchens': 'kitchen-1.webp',
    'coffee-shops': 'coffee-shop-01.webp',
    'conference-rooms': 'conference-room-01.webp',
    'art-galleries': 'art-gallery-23.webp',
    'urban-lofts': 'urban-loft-1.webp',
    'gardens-patios': 'garden-patio-1.webp',
    'historic-spaces': 'historic-1.webp',
    'nature-landscapes': 'nature-1.webp',
    'libraries': 'library-1.webp',
    'bokeh-backgrounds': 'bokeh-1.webp',
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

// Import the scoring functions
const { calculateImageScore } = require('../../lib/imageScoring');

export async function getStaticProps({ params }) {
  const { google } = require('googleapis');
  const fs = require('fs');
  const path = require('path');

  let scores = {};
  let imageMetadata = {}; 

  try {
    // Load metadata
    const metadataPath = path.join(process.cwd(), 'public', 'data', 'image-metadata-complete.json');
    imageMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Get analytics from Google Sheets
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I',
    });

    const rows = response.data.values || [];
    const RESET_DATE = new Date('2026-01-25');
    const now = new Date();
    
    // Process analytics data with proper filename matching
    const analyticsData = {};
    
    // Process rows with proper filename cleaning
    rows.slice(1).forEach(row => {
      const timestamp = row[0];
      const eventType = row[1];
      let filename = row[3];
      
      if (!filename || eventType !== 'download') return;
      
      // Strip StreamBackdrops prefix
      if (filename.startsWith('StreamBackdrops-')) {
        filename = filename.replace('StreamBackdrops-', '');
      }
      
      // Skip non-image entries
      if (filename.startsWith('/') ||
          filename.includes('/category/') || 
          filename.includes('/blog') ||
          filename.includes('/contact') ||
          filename.includes('/about') ||
          !filename.match(/\.(webp|png|jpg|jpeg)$/i)) {
        return;
      }
      
      const eventDate = new Date(timestamp);
      
      // Only count events from reset date forward
      if (eventDate < RESET_DATE) return;
      
      // Convert to webp for consistency
      filename = filename.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      
      // Update analytics
      if (!analyticsData[filename]) {
        analyticsData[filename] = {
          downloads: 0,
          lastDownload: null
        };
      }
      
      analyticsData[filename].downloads += 1;
      
      if (!analyticsData[filename].lastDownload || eventDate > analyticsData[filename].lastDownload) {
        analyticsData[filename].lastDownload = eventDate;
      }
    });
    
    // Get category images
    const category = categoryInfo[params.slug];
    if (!category) {
      return { notFound: true };
    }
    
    // Calculate scores using improved matching
    category.images.forEach(image => {
      const filename = image.filename;
      const meta = imageMetadata[filename] || {};
      
      // Find matching analytics using our improved function
      const analytics = findMatchingAnalytics(filename, analyticsData) || {};
      
      // Prepare image data for scoring
      const imageData = {
        createdDate: meta.firstSeen || RESET_DATE,
        totalDownloads: analytics.downloads || 0,
        lastDownload: analytics.lastDownload || null
      };
      
      // Calculate score
      scores[filename] = calculateImageScore(imageData, now);
    });
    
    // Get top 10 images for this category (for popular badges)
    const imagesWithScores = category.images.map(image => ({
      ...image,
      score: scores[image.filename] || 0
    }));
    
  } catch (error) {
    console.error('Build-time scoring failed:', error);
    
    // Fallback: assign base scores
    const category = categoryInfo[params.slug];
    if (category) {
      const now = new Date();
      const RESET_DATE = new Date('2026-01-25');
      
      category.images.forEach(image => {
        // Simple fallback: new images get 65, older get 50
        const meta = imageMetadata[image.filename] || {};
        const createdDate = meta.firstSeen ? new Date(meta.firstSeen) : RESET_DATE;
        const daysOld = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        
        scores[image.filename] = daysOld < 90 ? 65 : 50;
      });
    }
  }

  return {
    props: {
      slug: params.slug,
      scores,
      metadata: imageMetadata
    },
    revalidate: 3600 // Revalidate every hour
  };
}