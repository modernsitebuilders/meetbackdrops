import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Footer from '../components/Footer';

export default function Layout({ 
  children, 
  title = 'StreamBackdrops - Free HD Virtual Backgrounds',
  description = 'Download free HD virtual backgrounds for Zoom, Teams, and Google Meet. Professional quality backgrounds for video calls.',
  currentPage = null,
  canonical,
  keywords = 'virtual backgrounds, Zoom backgrounds, Teams backgrounds, professional video calls, free download',
  image = '/og-image.png',
  structuredData,
  noIndex = false,
  h1 = null,
  seoContent = null,
  alternates = {
    canonical: '/',
  },
  
}) {
  const router = useRouter();
  
  // Conditional navigation - uses window.location.href in development, router.push in production
  const navigate = (path) => {
    if (process.env.NODE_ENV === 'development') {
      window.location.href = path;
    } else {
      router.push(path);
    }
  };
  
 const defaultStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "StreamBackdrops",
  "description": "Free professional virtual backgrounds for video calls",
  "url": "https://streambackdrops.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://streambackdrops.com/?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

  return (
    <>
      <Head>
  <title>{title}</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* ✅ SEO Meta Tags */}
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="StreamBackdrops" />
        
        {/* ✅ Robots directive */}
        <meta name="robots" content={noIndex ? 'noindex' : 'index, follow, max-image-preview:large'} />
        
        {/* ✅ Canonical URL - UPDATED */}
<link rel="canonical" href={canonical || `https://streambackdrops.com${router.asPath.split('?')[0]}`} />
        
        {/* ✅ Open Graph for Social Sharing */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`https://streambackdrops.com${image}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="StreamBackdrops" />
        {canonical && <meta property="og:url" content={canonical} />}
        
        {/* ✅ Twitter Cards */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={`https://streambackdrops.com${image}`} />
        
        {/* ✅ Theme and additional meta */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* ✅ Structured Data */}
       <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(structuredData || defaultStructuredData)
  }}
/>
{/* Add FAQ schema for homepage */}
{currentPage === 'home' && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I download virtual backgrounds?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Simply browse our categories, click on any background image, and download it instantly. No signup required - all backgrounds are completely free."
            }
          },
          {
            "@type": "Question", 
            "name": "What video platforms support virtual backgrounds?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our backgrounds work with Zoom, Microsoft Teams, Google Meet, Skype, Discord, and most video calling platforms that support custom virtual backgrounds."
            }
          }
        ]
      })
    }}  
  />
)}
{/* Add prefetching for popular categories on homepage */}
{currentPage === 'home' && (
  <>
    <link rel="prefetch" href="/category/bookshelves-bright" />
<link rel="prefetch" href="/category/bookshelves-dark" />
<link rel="prefetch" href="/category/office-spaces" />
<link rel="prefetch" href="/category/living-rooms" />
<link rel="prefetch" href="/category/kitchens" />
<link rel="prefetch" href="/category/coffee-shops" />
<link rel="prefetch" href="/category/art-galleries" />
<link rel="prefetch" href="/category/urban-lofts" />
<link rel="prefetch" href="/category/gardens-patios" />
<link rel="prefetch" href="/category/historic-spaces" />
<link rel="prefetch" href="/category/nature-landscapes" />
<link rel="prefetch" href="/category/libraries" />
  </>
)}
      </Head>

      {/* Add this section after your header closes but before main content */}
{h1 && (
  <section style={{
    background: 'white',
    padding: '2rem 0',
    textAlign: 'center'
  }}>
    <h1 style={{
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    }}>
      {h1}
    </h1>
  </section>
)}
{/* Add SEO content section */}
{seoContent && (
  <section style={{
    background: 'white',
    padding: '2rem',
    margin: '2rem',
    borderRadius: '0.5rem'
  }}>
    <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.6', color: '#374151' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '1rem'
      }}>
        {seoContent.name} Virtual Backgrounds
      </h2>
      
      <p style={{ marginBottom: '1rem' }}>
        Browse our collection of professional {seoContent.name.toLowerCase()} virtual backgrounds. Download free HD backgrounds for Zoom, Teams, and Google Meet.
      </p>
    </div>
  </section>
)}
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: '#f9fafb'
      }}>
        {/* ✅ Consistent Header */}
        <header style={{ 
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 0',
          position: 'sticky',
          top: '0',
          zIndex: '10000'
        }}>
          <div style={{ 
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* ✅ Logo */}
            <button 
              onClick={() => navigate('/')}
              style={{ 
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2563eb',
                textDecoration: 'none',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                fontFamily: 'inherit',
                position: 'relative',
                zIndex: '10001'
              }}
            >
              StreamBackdrops
            </button>
            
            {/* ✅ Navigation */}
           <nav style={{ 
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
  flexWrap: 'wrap',
  position: 'relative',
  zIndex: '10001'
}}>
  <button 
  onClick={() => navigate('/category/bookshelves-bright')}
  style={{
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    color: currentPage === 'bookshelves-bright' ? '#2563eb' : '#374151',
    fontWeight: '500',
    fontSize: '0.9rem',
    background: '#f9fafb',
    border: currentPage === 'bookshelves-bright' ? '2px solid #2563eb' : '1px solid #d1d5db',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    fontFamily: 'inherit',
    position: 'relative',
    zIndex: '10002'
  }}
>
  Bookshelves - Bright
</button>
  
  <button 
  onClick={() => navigate('/category/bookshelves-dark')}
  style={{
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    color: currentPage === 'bookshelves-dark' ? '#2563eb' : '#374151',
    fontWeight: '500',
    fontSize: '0.9rem',
    background: '#f9fafb',
    border: currentPage === 'bookshelves-dark' ? '2px solid #2563eb' : '1px solid #d1d5db',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    fontFamily: 'inherit',
    position: 'relative',
    zIndex: '10002'
  }}
>
  Bookshelves - Dark
</button>
  
  <button 
    onClick={() => navigate('/category/office-spaces')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'office-spaces' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: '#f9fafb',
      border: currentPage === 'office-spaces' ? '2px solid #2563eb' : '1px solid #d1d5db',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      zIndex: '10002'
    }}
  >
    Office Spaces
  </button>
  
  <button 
    onClick={() => navigate('/category/living-rooms')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'living-rooms' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: '#f9fafb',
      border: currentPage === 'living-rooms' ? '2px solid #2563eb' : '1px solid #d1d5db',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      zIndex: '10002'
    }}
  >
    Living Rooms
  </button>
  
  <button 
    onClick={() => navigate('/category/kitchens')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'kitchens' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: '#f9fafb',
      border: currentPage === 'kitchens' ? '2px solid #2563eb' : '1px solid #d1d5db',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      zIndex: '10002'
    }}
  >
    Kitchens
  </button>
  <button 
    onClick={() => navigate('/category/coffee-shops')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'coffee-shops' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: '#f9fafb',
      border: currentPage === 'coffee-shops' ? '2px solid #2563eb' : '1px solid #d1d5db',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      zIndex: '10002'
    }}
  >
    Coffee Shops
  </button>
  
  <button 
    onClick={() => navigate('/category/art-galleries')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'art-galleries' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: '#f9fafb',
      border: currentPage === 'art-galleries' ? '2px solid #2563eb' : '1px solid #d1d5db',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      zIndex: '10002'
    }}
  >
    Art Galleries
  </button>
  
  <button 
    onClick={() => navigate('/category/urban-lofts')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'urban-lofts' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: '#f9fafb',
      border: currentPage === 'urban-lofts' ? '2px solid #2563eb' : '1px solid #d1d5db',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      zIndex: '10002'
    }}
  >
    Urban Lofts
  </button>
  
  <button 
    onClick={() => navigate('/category/gardens-patios')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'gardens-patios' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: '#f9fafb',
      border: currentPage === 'gardens-patios' ? '2px solid #2563eb' : '1px solid #d1d5db',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      zIndex: '10002'
    }}
  >
    Gardens & Patios
  </button>
  
  <button 
    onClick={() => navigate('/category/historic-spaces')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'historic-spaces' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: '#f9fafb',
      border: currentPage === 'historic-spaces' ? '2px solid #2563eb' : '1px solid #d1d5db',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      zIndex: '10002'
    }}
  >
    Historic Spaces
  </button>
  
  <button 
    onClick={() => navigate('/category/nature-landscapes')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'nature-landscapes' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: '#f9fafb',
      border: currentPage === 'nature-landscapes' ? '2px solid #2563eb' : '1px solid #d1d5db',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      zIndex: '10002'
    }}
  >
    Nature & Landscapes
  </button>
  
  <button 
    onClick={() => navigate('/category/libraries')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'libraries' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: '#f9fafb',
      border: currentPage === 'libraries' ? '2px solid #2563eb' : '1px solid #d1d5db',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      zIndex: '10002'
    }}
  >
    Libraries
  </button>
</nav>
          </div>
        </header>

        {/* ✅ Main Content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}