// Complete pages/category/[slug].js file - Replace your entire file with this
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
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
rel="noopener noreferrer nofollow"
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
};
// Categories with all your actual images
const categoryInfo = {
  'bookshelves-bright': {
    name: 'Bookshelves - Bright',
    description: 'Bright bookshelf backgrounds for professional video calls',
    seoDescription: 'Download free well-lit bookshelf virtual backgrounds for video calls. Bright, professional backgrounds.',
    images: Array.from({length: 47}, (_, i) => ({
      filename: `well-lit-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Bright Bookshelf Background ${i + 1}`
    }))
  },
  
  'bookshelves-dark': {
    name: 'Bookshelves - Dark',
    description: 'Warm bookshelf backgrounds with ambient lighting',
    seoDescription: 'Download free ambient bookshelf virtual backgrounds for video calls. Atmospheric, sophisticated backgrounds.',
    images: Array.from({length: 41}, (_, i) => ({
      filename: `ambient-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Dark Bookshelf Background ${i + 1}`
    }))
  },
  
  'office-spaces': {
    name: 'Office Spaces',
    description: 'Professional office backgrounds for business calls',
    seoDescription: 'Download free professional office virtual backgrounds for video calls. Executive office backgrounds.',
    images: Array.from({length: 19}, (_, i) => ({
      filename: `office-spaces-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Office Space Background ${i + 1}`
    }))
  },
  
  'living-rooms': {
    name: 'Living Rooms',
    description: 'Comfortable home backgrounds for casual video calls',
    seoDescription: 'Download free living room virtual backgrounds for video calls. Comfortable home settings for casual meetings.',
    images: Array.from({length: 47}, (_, i) => ({
      filename: `living-room-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Living Room Background ${i + 1}`
    }))
  },
  
  'kitchens': {
    name: 'Kitchens',
    description: 'Kitchen backgrounds for cooking shows and casual calls',
    seoDescription: 'Download free kitchen virtual backgrounds for video calls. Professional kitchen environments for cooking content.',
    images: Array.from({length: 18}, (_, i) => ({
      filename: `kitchen-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Kitchen Background ${i + 1}`
    }))
  },
  
 'coffee-shops': {
  name: 'Coffee Shops',
  description: 'Cozy coffee shop backgrounds for casual meetings',
  seoDescription: 'Download free coffee shop virtual backgrounds for video calls. Perfect for casual meetings and creative collaboration.',
  images: Array.from({length: 19}, (_, i) => ({
    filename: `coffee-shop-${String(i + 1).padStart(2, '0')}.webp`,
    title: `Coffee Shop Background ${i + 1}`
  }))
},
  
  'art-galleries': {
    name: 'Art Galleries',
    description: 'Sophisticated art gallery spaces with clean walls',
    seoDescription: 'Download free art gallery virtual backgrounds for video calls. Clean, artistic spaces for professional presentations.',
    images: Array.from({length: 17}, (_, i) => ({
      filename: `art-gallery-${i + 1}.webp`,
      title: `Art Gallery Background ${i + 1}`
    }))
  },
  
  'urban-lofts': {
    name: 'Urban Lofts',
    description: 'Modern industrial loft spaces with contemporary design',
    seoDescription: 'Download free urban loft virtual backgrounds for video calls. Industrial spaces for creative professionals.',
    images: Array.from({length: 17}, (_, i) => ({
      filename: `urban-loft-${i + 1}.webp`,
      title: `Urban Loft Background ${i + 1}`
    }))
  },
  
  'gardens-patios': {
    name: 'Gardens & Patios',
    description: 'Beautiful outdoor garden and patio backgrounds',
    seoDescription: 'Download free garden and patio virtual backgrounds for video calls. Natural outdoor beauty for your meetings.',
    images: Array.from({length: 13}, (_, i) => ({
      filename: `garden-patio-${i + 1}.webp`,
      title: `Garden Patio Background ${i + 1}`
    }))
  },
  
  'historic-spaces': {
    name: 'Historic Spaces',
    description: 'Elegant historic interiors and architectural spaces',
    seoDescription: 'Download free historic space virtual backgrounds for video calls. Ballrooms and Art Deco spaces for distinguished calls.',
    images: Array.from({length: 7}, (_, i) => ({
      filename: `historic-space-${i + 1}.webp`,
      title: `Historic Space Background ${i + 1}`
    }))
  },
  
  'nature-landscapes': {
    name: 'Nature & Landscapes',
    description: 'Stunning natural landscapes and scenic outdoor views',
    seoDescription: 'Download free nature and landscape virtual backgrounds for video calls. Mountains, deserts, and scenic environments.',
    images: Array.from({length: 49}, (_, i) => ({
      filename: `nature-landscape-${i + 1}.webp`,
      title: `Nature Landscape Background ${i + 1}`
    }))
  },
  
  'libraries': {
    name: 'Libraries',
    description: 'Classic library rooms with floor-to-ceiling books',
    seoDescription: 'Download free library virtual backgrounds for video calls. Perfect for academic presentations and professional settings.',
    images: Array.from({length: 18}, (_, i) => ({
      filename: `library-${i + 1}.webp`,
      title: `Library Background ${i + 1}`
    }))
  }
};

function CategoryContent({ slug }) {
  const [previewImage, setPreviewImage] = useState(null);
  const folderMap = {
  'bookshelves-bright': 'bookshelves-bright',
  'bookshelves-dark': 'bookshelves-dark',
  'office-spaces': 'office-spaces',
  'living-rooms': 'living-rooms',
  'kitchens': 'kitchens',
  'coffee-shops': 'coffee-shops',
  'art-galleries': 'art-galleries',
  'urban-lofts': 'urban-lofts',
  'gardens-patios': 'gardens-patios',
  'historic-spaces': 'historic-spaces',
  'nature-landscapes': 'nature-landscapes',
  'libraries': 'libraries'
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
    // Track download to Google Sheets
    fetch('/api/track-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: image.filename,
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
<meta property="og:title" content={`${category.name} Backgrounds - Free HD | StreamBackdrops`} />
<meta property="og:description" content={`Download free ${category.name.toLowerCase()} backgrounds in HD quality. Perfect for professional video calls.`} />
<meta property="og:url" content={`https://streambackdrops.com/category/${slug}`} />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="StreamBackdrops" />

{/* ✅ NEW: Twitter Card tags */}
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content={`${category.name} Backgrounds - Free HD`} />
<meta property="twitter:description" content={`Free HD ${category.name.toLowerCase()} backgrounds for video calls`} />
            {/* ✅ NEW: Structured Data for better Google results */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "ImageGallery",
                  "name": `${category.name} Backgrounds`,
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
          "acquireLicensePage": "https://streambackdrops.com/about"
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
    'libraries'
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