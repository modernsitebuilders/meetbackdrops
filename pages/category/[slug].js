import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Head from 'next/head';
import { categoryInfo, folderMap } from '../../data/categoryData';
import ReviewModal from '../../components/ReviewModal';
import RelatedCategories from '../../components/RelatedCategories';
import CategoryHeader from '../../components/CategoryHeader';
import ImageGrid from '../../components/ImageGrid';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import CategorySEOContent from '../../components/CategorySEOContent';
import cloudinaryUrls from '../../cloudinary-urls.json';
import FAQSchema from '../../components/FAQSchema';
import { getFAQs } from '../../data/faqData';
import BreadcrumbSchema from '../../components/BreadcrumbSchema'; 
import ImageObjectSchema from '../../components/ImageObjectSchema';
import BackToTop from '../../components/BackToTop';

function CategoryContent({ slug }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [downloadedImage, setDownloadedImage] = useState(null);
  const category = categoryInfo[slug];
  
  const handleDownload = async (image) => {
    try {
      if (localStorage.getItem('streambackdrops_admin') === 'true') {
        const baseFilename = image.filename.replace('.webp', '');
        const link = document.createElement('a');
        link.href = `/images/${folderMap[slug]}/${image.filename}`;
        link.download = `StreamBackdrops-${baseFilename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: image.filename.replace('.webp', '.png'),
          category: slug
        })
      }).catch(() => {});
      
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'download', {
          'event_category': 'engagement',
          'event_label': image.filename,
          'image_name': image.filename,
          'category': slug,
          'value': 1
        });
      }

      const baseFilename = image.filename.replace('.webp', '');
      const imageUrl = cloudinaryUrls[baseFilename];
      
      if (imageUrl) {
        const cloudinaryPngUrl = imageUrl.replace('/upload/', '/upload/f_png/');
        const filename = `StreamBackdrops-${baseFilename}.png`;
        
        const link = document.createElement('a');
        link.href = `/api/download?url=${encodeURIComponent(cloudinaryPngUrl)}&filename=${encodeURIComponent(filename)}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error(`No Cloudinary URL found for ${baseFilename}`);
      }
      
      setDownloadedImage(image.filename);
      setTimeout(() => {
        setShowReviewModal(true);
      }, 2000);
      
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    
    <>
      {!category ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Category Not Found</h1>
          <Link href="/">Back to Home</Link>
        </div>
      ) : (
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
                slug={slug}
                onImageClick={setPreviewImage}
                onDownload={handleDownload}
              />

              <RelatedCategories currentSlug={slug} />
              <CategorySEOContent category={category} />
            </div>
          </div>

          <ImagePreviewModal
            image={previewImage}
            slug={slug}
            onClose={() => setPreviewImage(null)}
            onDownload={handleDownload}
          />
        </>
      )}
      
      {showReviewModal && (
  <ReviewModal 
    onClose={() => setShowReviewModal(false)}
  />
)}
      
      <BackToTop hide={!!previewImage} />
    </>
  );
}

export default function CategoryPage({ slug }) {
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

  // CRITICAL: Build title string BEFORE using it - ensure it's never undefined
const categoryName = String(category.name || 'Virtual');
const pageTitle = categoryName + ' - Free HD | StreamBackdrops';
  const pageDescription = String(category.seoDescription || `Download free ${categoryName.toLowerCase()} backgrounds in HD. Perfect for Zoom, Teams & Google Meet.`);
  
  const featuredImages = {
    'halloween-backgrounds': 'halloween-background-20.webp',
    'christmas-backgrounds': 'christmas-background-1.webp',
    'bookshelves-bright': 'bookshelf-bright-1.webp',
    'bookshelves-dark': 'bookshelf-dark-1.webp',
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
  const imageUrl = `https://streambackdrops.com/images/${currentSlug}/${featuredImage}`;

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
  </Head>
  
  <CategoryContent slug={currentSlug} />
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
  return {
    props: {
      slug: params.slug
    }
  };
}