import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { event } from '../../lib/gtag';
import Layout from '../../components/Layout';
import cloudinaryUrls from '../../cloudinary-urls.json';
import SocialShare from '../../components/SocialShare';
import { categoryInfo, folderMap } from '../../data/categoryData';
import ReviewModal from '../../components/ReviewModal';

  function CategoryContent({ slug }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [downloadedImage, setDownloadedImage] = useState(null);
  const category = categoryInfo[slug];
  
  // Track page view when component loads
  useEffect(() => {
  // Skip tracking if admin
  if (typeof window !== 'undefined' && localStorage.getItem('streambackdrops_admin') === 'true') {
    return;
  }
  
  // Enhanced referrer tracking
  let referrer = document.referrer || 'direct';
  
  // Store original referrer for session
  if (!sessionStorage.getItem('entry_referrer') && document.referrer) {
    sessionStorage.setItem('entry_referrer', document.referrer);
  }
  
  // Use session referrer if current page referrer is your own site
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
    // Skip tracking if admin
    if (localStorage.getItem('streambackdrops_admin') === 'true') {
      // Still do the actual download, just skip tracking
      const link = document.createElement('a');
      link.href = `/images/${folderMap[slug]}/${image.filename}`;
      link.download = image.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // Track download to Google Sheets
    fetch('/api/track-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: image.filename.replace('.webp', '.png'),
        category: slug
      })
    }).catch(() => {}); // Fail silently
    
    // Track the download
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'download', {
        'event_category': 'engagement',
        'event_label': image.filename,
        'image_name': image.filename,
        'category': slug,
        'value': 1
      });
    }

    // Get the base filename without extension
    const baseFilename = image.filename.replace('.webp', '');
    
    // Get the Cloudinary URL
    const imageUrl = cloudinaryUrls[baseFilename];
    
    if (imageUrl) {
      // Force download using Cloudinary's fl_attachment parameter
const downloadUrl = imageUrl.replace('/upload/', '/upload/f_png,fl_attachment/');      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `StreamBackdrops-${baseFilename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      

      setDownloadedImage(image.filename);
      setTimeout(() => {
        setShowReviewModal(true);
      }, 2000); 
      console.error(`No Cloudinary URL found for ${baseFilename}`);
    }
    
  } catch (error) {
    console.error('Download failed:', error);
  }
};

  return (
    <>
      <Head>
        {/* ✅ NEW: Conditional title that works for both found/not found */}
        <title>
  {category 
    ? `${category.name} Backgrounds - Free HD | StreamBackdrops`
    : 'Category Not Found - StreamBackdrops'
  }
</title>
        
        {/* ✅ NEW: Conditional description */}
        <meta name="description" content={
  category 
    ? `Download free ${category.name.toLowerCase()} backgrounds in HD. Perfect for Zoom, Teams & Google Meet.`
    : 'Category not found. Browse our free HD virtual backgrounds.'
} />
        
        {/* ✅ KEEPING: Basic viewport (you already had this) */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* ✅ NEW: Only add SEO meta tags if category exists */}
        {category ? (
          <>
            {/* ✅ NEW: Enhanced SEO keywords */}
            <meta name="keywords" content={`${category.name.toLowerCase()}, virtual backgrounds, video calls, ${slug}, professional backgrounds, HD download, Zoom backgrounds, Teams backgrounds`} />
            
            {/* ✅ NEW: Better robots directive */}
            <meta name="robots" content="index, follow, max-image-preview:large" />
            
            {/* ✅ NEW: Author meta tag */}
            <meta name="author" content="StreamBackdrops" />
            
           {/* ✅ NEW: Enhanced Open Graph tags */}
{(() => {
  // Define featured images for each category
  const featuredImages = {
    'halloween-backgrounds': 'halloween-background-20.webp',
    'bookshelves-bright': 'bookshelf-bright-1.webp',
    'bookshelves-dark': 'bookshelf-dark-1.webp',
    'office-spaces': 'office-1.webp',
    'living-rooms': 'living-room-1.webp',
    'kitchens': 'kitchen-1.webp',
    'coffee-shops': 'coffee-shop-01.webp',
    'art-galleries': 'art-gallery-1.webp',
    'urban-lofts': 'urban-loft-1.webp',
    'gardens-patios': 'garden-patio-1.webp',
    'historic-spaces': 'historic-1.webp',
    'nature-landscapes': 'nature-1.webp',
    'libraries': 'library-1.webp'
  };
  
  const featuredImage = featuredImages[slug] || category.images[0]?.filename || 'default.webp';
  const imageUrl = `https://streambackdrops.com/images/${slug}/${featuredImage}`;
  
  return (
    <>
      <meta property="og:title" content={`${category.name} Backgrounds - Free HD | StreamBackdrops`} />
      <meta property="og:description" content={`Download free ${category.name.toLowerCase()} backgrounds in HD quality. Perfect for professional video calls.`} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1920" />
      <meta property="og:image:height" content="1080" />
      <meta property="og:image:alt" content={`${category.name} Virtual Background Preview`} />
      <meta property="og:url" content={`https://streambackdrops.com/category/${slug}`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="StreamBackdrops" />
      
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={`${category.name} Backgrounds - Free HD`} />
      <meta property="twitter:description" content={`Free HD ${category.name.toLowerCase()} backgrounds for video calls`} />
      <meta property="twitter:image" content={imageUrl} />
    </>
  );
})()}
            {/* FAQ Schema */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": `How do I use ${category.name.toLowerCase()} virtual backgrounds?`,
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": `To use these ${category.name.toLowerCase()} backgrounds, download your chosen image, then upload it in your video conferencing app's virtual background settings. For Zoom, go to Settings > Background & Effects. For Teams, go to Settings > Devices > Background effects.`
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "What format are these backgrounds in?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "All backgrounds are available in high-quality PNG format, optimized for video calls. They work with Zoom, Microsoft Teams, Google Meet, and other video conferencing platforms."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Can I use these backgrounds for commercial purposes?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, all backgrounds on StreamBackdrops are free to download and use for both personal and commercial purposes, including business meetings, webinars, and professional presentations."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "What's the best lighting for virtual backgrounds?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "For best results with virtual backgrounds, ensure you have good front-facing lighting. Natural light from a window or a ring light works well. Avoid backlighting, which can cause poor edge detection."
                      }
                    }
                  ]
                })
              }}
            />
          </>
        ) : (
          /* ✅ NEW: For not-found pages, tell search engines not to index */
          <meta name="robots" content="noindex" />
        )}
      {/* Breadcrumb Schema for better navigation in search results */}
            {category && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                      {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://streambackdrops.com"
                      },
                      {
                        "@type": "ListItem",
                        "position": 2,
                        "name": category.name,
                        "item": `https://streambackdrops.com/category/${slug}`
                      }
                    ]
                  })
                }}
              />
            )}
            
            {/* ItemList Schema for category pages */}
            {category && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "name": `${category.name} Virtual Backgrounds Collection`,
                    "description": category.description,
                    "numberOfItems": category.images.length,
                    "itemListElement": category.images.slice(0, 10).map((image, index) => ({
                      "@type": "ListItem",
                      "position": index + 1,
                      "url": `https://streambackdrops.com/images/${folderMap[slug]}/${image.filename}`,
                      "name": image.title,
                      "image": `https://streambackdrops.com/images/${folderMap[slug]}/${image.filename}`
                    }))
                  })
                }}
              />
            )}
      </Head>

      {/* ✅ NEW: Single conditional content section (replaces early return) */}
      {!category ? (
        /* ✅ NEW: Not found content (replaces the early return block) */
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Category Not Found</h1>
          <Link href="/">Back to Home</Link>
        </div>
      ) : (

        <>
      {/* Page Content */}
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
         {/* Page Title */}
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            {category.name}
          </h1>
          
          <h2 style={{
            color: '#6b7280',
            fontSize: '1.1rem',
            marginBottom: '2rem'
          }}>
            {category.description}
          </h2>
          
          {/* Clean Instructions */}
          <p style={{
            color: '#6b7280',
            marginBottom: '2rem'
          }}>
            Click on any image to preview
          </p>

          {/* Clean Image Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {category.images.map((image, index) => (
  <div
    key={image.filename}
    style={{
      position: 'relative',
      cursor: 'pointer',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      transition: 'transform 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    onClick={() => setPreviewImage(image)}
  >
    {/* ImageObject Schema for each image */}
   <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ImageObject",
          "contentUrl": `https://streambackdrops.com/images/${folderMap[slug]}/${image.filename}`,
          "name": image.title,
          "description": `Free ${image.title} - HD virtual background for Zoom, Teams, and Google Meet`,
          "thumbnail": `https://streambackdrops.com/images/${folderMap[slug]}/${image.filename}`,
          "license": "https://creativecommons.org/publicdomain/zero/1.0/",
          "acquireLicensePage": "https://streambackdrops.com/about",
          "creator": {
            "@type": "Organization",
            "name": "StreamBackdrops"
          },
          "creditText": "StreamBackdrops",
          "copyrightNotice": "© 2025 StreamBackdrops - CC0 Public Domain"
        })
      }}
    />
    <div style={{
      position: 'relative',
                  width: '100%',
                  aspectRatio: '16/9',
                  overflow: 'hidden'
                }}>
                  <Image
                    src={`/images/${folderMap[slug]}/${image.filename}`}
                    alt={image.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    loading={index < 8 ? 'eager' : 'lazy'}
                    quality={75}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
                  />
                  
                  {/* Hover Overlay - Clean Download Button + Social Icons */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                  className="image-overlay">
                    
                    {/* Clean Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                      style={{
                        background: '#2563eb',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Download
                    </button>

                    {/* Social Share on Hover */}
                    <SocialShare 
                      image={{...image, category: slug}}
                      title={`${image.title} - Free Virtual Background`}
                      size="small"
                      showLabels={false}
                      vertical={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Simple SEO content - after image grid */}
          <section style={{
            background: 'white',
            padding: '2rem',
            marginTop: '3rem',
            borderRadius: '0.5rem',
            maxWidth: '800px',
            margin: '3rem auto 0'
          }}>
            <p style={{ 
              lineHeight: '1.8', 
              color: '#374151',
              fontSize: '1.05rem'
            }}>
              Download free {category.name.toLowerCase()} virtual backgrounds optimized for Zoom, Microsoft Teams, Google Meet, and other video conferencing platforms. These professional HD backgrounds are designed specifically for video calls, providing excellent edge detection and clear image quality even with standard webcam setups. Perfect for remote work, online meetings, and professional presentations. All backgrounds are free to download and use for personal or commercial purposes. Simply click any image to preview in full size, then download directly to your device. For best results, ensure adequate front-facing lighting and position your camera at eye level before your video calls.
            </p>
          </section>
        </div>
      </div>

      {/* Clean Preview Modal */}
      {previewImage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '4rem'
        }}
        onClick={() => setPreviewImage(null)}>
          
          {/* Close Button */}
          <button
            style={{
              position: 'fixed',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '3rem',
              height: '3rem',
              cursor: 'pointer',
              fontSize: '1.5rem',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
            }}
          >
            ×
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3rem',
            maxWidth: '95vw',
            maxHeight: '90vh'
          }}
          onClick={(e) => e.stopPropagation()}>
            
            {/* Vertical Social Share */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <SocialShare 
                image={{...previewImage, category: slug}}
                title={`${previewImage.title} - Free Virtual Background`}
                size="large"
                showLabels={false}
                vertical={true}
              />
            </div>
            
            {/* Image Container */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem'
            }}>
              {/* Pure Image */}
              <div style={{
                position: 'relative',
                maxWidth: '70vw',
                maxHeight: '70vh'
              }}>
                <Image
                  src={`/images/${folderMap[slug]}/${previewImage.filename}`}
                  alt={previewImage.title}
                  width={800}
                  height={450}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                  }}
                  quality={90}
                />
              </div>
              
              {/* Download Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(previewImage);
                }}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for hover effects */}
      <style jsx>{`
        .image-overlay:hover {
          opacity: 1 !important;
        }
        
        div:hover .image-overlay {
          opacity: 1;
        }
     `}</style>
        </>
      )}
      
      {/* Review Modal */}
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

  return (
  <Layout
  title={category ? `${category.name} Backgrounds - Free HD | StreamBackdrops` : 'Category Not Found'}
  description={category ? category.seoDescription : 'Category not found'}
  canonical={`https://streambackdrops.com/category/${currentSlug}`}
  currentPage={currentSlug}
  seoContent={null}
>
    <CategoryContent slug={currentSlug} />
  </Layout>
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