import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { categoryInfo, folderMap } from '../../data/categoryData';
import ReviewModal from '../../components/ReviewModal';
import RelatedCategories from '../../components/RelatedCategories';
import CategoryMeta from '../../components/CategoryMeta';
import CategoryHeader from '../../components/CategoryHeader';
import ImageGrid from '../../components/ImageGrid';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import CategorySEOContent from '../../components/CategorySEOContent';
import cloudinaryUrls from '../../cloudinary-urls.json';
import FAQSchema from '../../components/FAQSchema';
import { getFAQs } from '../../data/faqData';
import BreadcrumbSchema from '../../components/BreadcrumbSchema'; 
import ImageObjectSchema from '../../components/ImageObjectSchema';
import Footer from '../../components/Footer';

function CategoryContent({ slug }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [downloadedImage, setDownloadedImage] = useState(null);
  const category = categoryInfo[slug];
  
  // Track page view when component loads
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('streambackdrops_admin') === 'true') {
      return;
    }
    
    let referrer = document.referrer || 'direct';
    
    if (!sessionStorage.getItem('entry_referrer') && document.referrer) {
      sessionStorage.setItem('entry_referrer', document.referrer);
    }
    
    const sessionReferrer = sessionStorage.getItem('entry_referrer');
    if (sessionReferrer && (referrer === 'direct' || referrer.includes('streambackdrops.com'))) {
      referrer = sessionReferrer;
    }

    fetch('/api/track-page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: `/category/${slug}`,
        category: category?.name || slug,
        referrer: referrer
      })
    });
  }, [slug, category]);

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
      <CategoryMeta category={category} slug={slug} />
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
              {/* Breadcrumbs */}
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
      
      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        imageName={downloadedImage}
      />
    </>
  );
}

export default function CategoryPage({ slug }) {
  const router = useRouter();
  const currentSlug = slug || router.query.slug;
  const category = categoryInfo[currentSlug];

  // If category doesn't exist, show error page
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

  // ALL Head content in ONE place - this is the key fix!
  return (
    <>
      <Head>
        {/* CRITICAL: Title tag - must be first and explicit */}
        <title>{`${category.name} Backgrounds - Free HD | StreamBackdrops`}</title>
        
        {/* Meta tags */}
        <meta name="description" content={category.seoDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content={`${category.name} virtual backgrounds, ${category.name} Zoom backgrounds, professional video call backgrounds`} />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://streambackdrops.com/category/${currentSlug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${category.name} Backgrounds - Free HD | StreamBackdrops`} />
        <meta property="og:description" content={category.seoDescription} />
        <meta property="og:url" content={`https://streambackdrops.com/category/${currentSlug}`} />
        <meta property="og:type" content="website" />
        
        {/* Structured Data Schemas */}
        <FAQSchema questions={getFAQs(currentSlug)} />
        <BreadcrumbSchema items={[
          { name: "Home", url: "https://streambackdrops.com" },
          { name: category.name, url: `https://streambackdrops.com/category/${currentSlug}` }
        ]} />
        <ImageObjectSchema 
          images={category.images} 
          category={category.name}
          baseUrl="https://streambackdrops.com"
        />
      </Head>
      
      {/* Navigation Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <Link href="/" style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2563eb',
            textDecoration: 'none'
          }}>
            StreamBackdrops
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        <CategoryContent slug={currentSlug} />
      </main>
      
      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  const paths = [
    'bookshelves-bright',
    'bookshelves-dark',
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
    'halloween-backgrounds'
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