// Complete pages/category/[slug].js file - Replace your entire file with this
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { event } from '../../lib/gtag';
import Layout from '../../components/Layout';
import cloudinaryUrls from '../../cloudinary-urls.json';

// Simple SocialShare component
function SocialShare({ image, title, size = "large", showLabels = false, vertical = true }) {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

const shareLinks = [
  {
    name: 'Twitter',
    url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    icon: 'X',  // ✅ Simple X for Twitter/X
    hoverColor: '#1DA1F2'
  },
  {
    name: 'Facebook',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    icon: 'f',  // ✅ Simple f for Facebook
    hoverColor: '#4267B2'
  },
  {
    name: 'LinkedIn',
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    icon: 'in', // ✅ Simple in for LinkedIn
    hoverColor: '#0077B5'
  },
  {
    name: 'Pinterest',
    url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
    icon: 'P',  // ✅ Simple P for Pinterest
    hoverColor: '#BD081C'
  },
  {
    name: 'Copy Link',
    url: '#',
    icon: '🔗', // ✅ Keep link icon - this one is clear
    hoverColor: '#10B981',
    action: 'copy'
  }
];

  return (
    <div style={{
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      gap: '0.5rem'
    }}>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={link.action === 'copy' ? (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
          } : undefined}
          style={{
            padding: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            color: 'white',
            textDecoration: 'none',
            fontSize: size === 'large' ? '1.5rem' : '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '3rem',
            minHeight: '3rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = link.hoverColor;
            e.target.style.transform = 'scale(1.1)';
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.textContent = `Share on ${link.name}`;
            tooltip.style.cssText = `
              position: absolute;
              bottom: 120%;
              left: 50%;
              transform: translateX(-50%);
              background: #333;
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 14px;
              white-space: nowrap;
              z-index: 1000;
              pointer-events: none;
            `;
            e.target.appendChild(tooltip);
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.transform = 'scale(1)';
            
            // Remove tooltip
            const tooltip = e.target.querySelector('div');
            if (tooltip) tooltip.remove();
          }}
        >
          {link.icon}
          {showLabels && <span style={{ marginLeft: '0.5rem' }}>{link.name}</span>}
        </a>
      ))}
    </div>
  );
}
// Categories with all your actual images
const categoryInfo = {
  'well-lit': {
    name: 'Well Lit',
    description: 'Bright, well-lit backgrounds perfect for professional video calls',
    seoDescription: 'Download free well-lit virtual backgrounds for video calls. Bright, professional backgrounds.',
    images: Array.from({length: 47}, (_, i) => ({
      filename: `well-lit-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Well Lit Background ${i + 1}`
    }))
  },
  
  'ambient-lighting': {
    name: 'Ambient Lighting',
    description: 'Atmospheric backgrounds with ambient lighting for sophisticated video calls',
    seoDescription: 'Download free ambient virtual backgrounds for video calls. Atmospheric, sophisticated backgrounds.',
    images: Array.from({length: 41}, (_, i) => ({
      filename: `ambient-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Ambient Background ${i + 1}`
    }))
  },
  
  'office-spaces': {
    name: 'Office Spaces',
    description: 'Professional office backgrounds for business video calls',
    seoDescription: 'Download free professional office virtual backgrounds for video calls. Executive office backgrounds.',
    images: Array.from({length: 19}, (_, i) => ({
      filename: `office-spaces-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Office Space Background ${i + 1}`
    }))
  },
  
  'living-room': {
    name: 'Living Room',
    description: 'Comfortable living room backgrounds for casual meetings and personal video calls',
    seoDescription: 'Download free living room virtual backgrounds for video calls. Comfortable home settings for casual meetings.',
    images: Array.from({length: 47}, (_, i) => ({
      filename: `living-room-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Living Room Background ${i + 1}`
    }))
  },
  
  'kitchen': {
    name: 'Kitchen Backgrounds',
    description: 'Professional kitchen backgrounds for cooking shows, food blogs, and culinary video calls',
    seoDescription: 'Download free kitchen virtual backgrounds for video calls. Professional kitchen environments for cooking content.',
    images: Array.from({length: 18}, (_, i) => ({
      filename: `kitchen-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Kitchen Background ${i + 1}`
    }))
  }
};

function CategoryContent({ slug }) {
  const [previewImage, setPreviewImage] = useState(null);
  const folderMap = {
    'well-lit': 'well-lit',
    'ambient-lighting': 'ambient',  // <- Changed this!
    'office-spaces': 'office-spaces',
    'living-room': 'living-room',
    'kitchen': 'kitchen'
  };

  const category = categoryInfo[slug];
// Track page view when component loads
useEffect(() => {
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
    // Track the download
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        'event_category': 'outbound',
        'event_label': image.filename,
        'transport_type': 'beacon',
        'value': 1
      });
    }

    // Get the base filename without extension
    const baseFilename = image.filename.replace('.webp', '');
    
    // Get the Cloudinary URL
    const imageUrl = cloudinaryUrls[baseFilename];
    
    if (imageUrl) {
      // Force download using Cloudinary's fl_attachment parameter
      const downloadUrl = imageUrl.replace('/upload/', '/upload/fl_attachment/');
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `StreamBackdrops-${baseFilename}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
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
            ? `${category.name} Virtual Backgrounds - Free HD Downloads | StreamBackdrops`
            : 'Category Not Found - StreamBackdrops'
          }
        </title>
        
        {/* ✅ NEW: Conditional description */}
        <meta name="description" content={
          category 
            ? `Download free ${category.name.toLowerCase()} virtual backgrounds in HD quality. Perfect for Zoom, Teams & Google Meet video calls. ${category.description}`
            : 'The requested category was not found. Browse our collection of free HD virtual backgrounds.'
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
            
            {/* ✅ NEW: Canonical URL for SEO */}
            <link rel="canonical" href={`https://streambackdrops.com/category/${slug}`} />
            
            {/* ✅ NEW: Enhanced Open Graph tags */}
            <meta property="og:title" content={`${category.name} Virtual Backgrounds - StreamBackdrops`} />
            <meta property="og:description" content={`Download free ${category.name.toLowerCase()} virtual backgrounds in HD quality. Perfect for professional video calls.`} />
            <meta property="og:url" content={`https://streambackdrops.com/category/${slug}`} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="StreamBackdrops" />
            
            {/* ✅ NEW: Twitter Card tags */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:title" content={`${category.name} Virtual Backgrounds`} />
            <meta property="twitter:description" content={`Free HD ${category.name.toLowerCase()} backgrounds for video calls`} />
            
            {/* ✅ NEW: Structured Data for better Google results */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "ImageGallery",
                  "name": `${category.name} Virtual Backgrounds`,
                  "description": category.description,
                  "url": `https://streambackdrops.com/category/${slug}`,
                  "breadcrumb": {
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
                  }
                })
              }}
            />
          </>
        ) : (
          /* ✅ NEW: For not-found pages, tell search engines not to index */
          <meta name="robots" content="noindex" />
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
        /* ✅ KEEPING: All your existing content stays exactly the same */
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
          {/* SEO Content Section - to add after image grid in [slug].js */}
<section style={{
  background: 'white',
  padding: '2rem',
  marginTop: '3rem',
  borderRadius: '0.5rem'
}}>
  <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.6', color: '#374151' }}>
    
    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    }}>
      Professional {category.name} Virtual Backgrounds
    </h3>
    
    <p style={{ marginBottom: '1.5rem' }}>
      Our {category.name.toLowerCase()} virtual background collection features professionally designed backgrounds perfect for video conferencing, remote work, and online meetings. Each background is optimized for popular video platforms including Zoom, Microsoft Teams, Google Meet, and Skype.
    </p>
    
    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    }}>
      How to Use These Backgrounds
    </h3>
    
    <p style={{ marginBottom: '1.5rem' }}>
      These high-quality {category.name.toLowerCase()} backgrounds help create a professional appearance during video calls while maintaining privacy in your home or office space. All backgrounds are available as free HD downloads and work seamlessly with virtual background technology.
    </p>
    
    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    }}>
      Download Instructions
    </h3>
    
    <p style={{ marginBottom: '1rem' }}>
      Simply click on any image below to preview and download. Our {category.name.toLowerCase()} backgrounds are designed to provide clear edge detection and work well with standard webcam setups and lighting conditions.
    </p>
    
    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    }}>
      Platform Compatibility
    </h3>
    
    <p style={{ marginBottom: '1rem' }}>
      These {category.name.toLowerCase()} virtual backgrounds work seamlessly across all major video platforms including Zoom, Microsoft Teams, Google Meet, Skype, Discord, and WebEx. The high-resolution files ensure crisp, professional appearance regardless of your video call setup or internet connection speed.
    </p>
    
    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    }}>
      Setup Tips for Best Results
    </h3>
    
    <p style={{ marginBottom: '1rem' }}>
      For optimal virtual background performance, ensure you have adequate lighting facing toward you and avoid complex patterns in your clothing that may interfere with edge detection. Position your camera at eye level and maintain consistent distance from your webcam. Test your chosen background before important meetings to ensure smooth operation across your specific hardware setup.
    </p>
  </div>
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
</>
);
}

const DynamicCategoryContent = dynamic(() => Promise.resolve(CategoryContent), {
  ssr: false
});

export default function CategoryPage({ slug }) {
  const router = useRouter();
  const currentSlug = slug || router.query.slug;
  const category = categoryInfo[currentSlug];

  return (
  <Layout
  title={category ? `${category.name} Virtual Backgrounds - StreamBackdrops` : 'Category Not Found'}
  description={category ? category.seoDescription : 'Category not found'}
  canonical={`https://streambackdrops.com/category/${currentSlug}`}
  currentPage={currentSlug}
  seoContent={null}  // <-- CHANGE THIS TO NULL
>
    <DynamicCategoryContent slug={currentSlug} />
  </Layout>
);
}

export async function getStaticPaths() {
  const paths = ['well-lit', 'ambient-lighting', 'office-spaces', 'living-room', 'kitchen'].map((slug) => ({
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