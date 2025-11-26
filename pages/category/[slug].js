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

function CategoryContent({ slug, scores = {}, topImages = [] }) {
  const [previewImage, setPreviewImage] = useState(null);
  const { 
    handleDownload,
    showReviewModal, 
    setShowReviewModal,
    showRateLimitModal,
    setShowRateLimitModal,
    rateLimitError
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
  topImages={topImages}
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

export default function CategoryPage({ slug, scores, topImages }) {  const router = useRouter();
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
  const pageTitle = categoryName + ' - Free | StreamBackdrops';
  const pageDescription = String(category.seoDescription || `Download free ${categoryName.toLowerCase()} backgrounds. Perfect for Zoom, Teams & Google Meet.`);
  
  const featuredImages = {
    'halloween-backgrounds': 'halloween-background-20.webp',
    'christmas-backgrounds': 'christmas-background-1.webp',
    'bookshelves-bright': 'bookshelves-bright-01.webp',
    'bookshelves-dark': 'bookshelves-dark-01.webp',
    'wall-shelves-bright': 'wall-shelves-bright-01.webp',
    'wall-shelves-dark': 'wall-shelves-dark-01.webp',
    'office-spaces': 'office-1.webp',
    'living-rooms': 'living-room-1.webp',
    'kitchens': 'kitchen-1.webp',
    'coffee-shops': 'coffee-shop-01.webp',
    'art-galleries': 'art-gallery-23.webp',
    'urban-lofts': 'urban-loft-1.webp',
    'gardens-patios': 'garden-patio-1.webp',
    'historic-spaces': 'historic-1.webp',
    'nature-landscapes': 'nature-1.webp',
    'libraries': 'library-1.webp',
    'bokeh-backgrounds': 'bokeh-1.webp'
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
            baseUrl="https://streambackdrops.com"
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
        
<CategoryContent slug={currentSlug} scores={scores} topImages={topImages} />
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
    'christmas-backgrounds',
    'halloween-backgrounds',
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
  const { google } = require('googleapis');
  const fs = require('fs');
  const path = require('path');

  let scores = {};
  let topImages = [];

  try {
    // Get scores
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
    const downloadCounts = {};
    const imageScores = {};

    // Count downloads for popular badge
    rows.slice(1).forEach(row => {
      const actionType = row[1];
      const filename = row[2];
      
      if (actionType === 'download' && filename && filename.match(/\.(webp|png|jpg|jpeg)$/i)) {
        downloadCounts[filename] = (downloadCounts[filename] || 0) + 1;
      }
    });

    // Get top 25
    topImages = Object.entries(downloadCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([filename]) => filename.replace('.png', '.webp'));

    // Calculate scores for this category
    const category = categoryInfo[params.slug];
    if (category) {
      category.images.forEach(image => {
        const baseName = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
        const downloads = downloadCounts[image.filename] || 
                         downloadCounts[`${baseName}.png`] || 
                         downloadCounts[`${baseName}.webp`] || 0;
        imageScores[image.filename] = downloads * 10;
      });
    }

    scores = imageScores;
  } catch (error) {
    console.error('Build-time data fetch failed:', error);
  }

  return {
    props: {
      slug: params.slug,
      scores,
      topImages
    },
    revalidate: 3600 // Rebuild every hour
  };
}