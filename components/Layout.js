import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from '../styles/Layout.module.css';
import { getFormattedTotalCount } from '../lib/getImageCounts';

export default function Layout({
  children,
  title = 'StreamBackdrops - Free Professional Virtual Backgrounds',
  description = `Download free professional HD virtual backgrounds for Zoom, Microsoft Teams, and Google Meet. Over ${getFormattedTotalCount()} premium images for video calls.
No signup required, no watermarks - just high-quality backgrounds perfect for video calls, remote work, and online meetings.`,
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
const dropdownItemStyle = {
  display: 'block',
  width: '100%',
  padding: '0.75rem 1rem',
  textAlign: 'left',
  background: 'transparent',
  border: 'none',
  color: '#374151',
  fontSize: '0.9rem',
  cursor: 'pointer',
  borderRadius: '0.375rem',
  fontFamily: 'inherit',
  transition: 'background 0.2s ease'
};
useEffect(() => {
  const dropdowns = document.querySelectorAll('nav div[style*="position: absolute"]');
  dropdowns.forEach(dropdown => {
    if (dropdown.style.display === 'block') {
      dropdown.style.display = 'none';
    }
  });
}, [router.asPath]);

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
        {/* TrustPilot Verification */}
        <meta name="trustpilot-one-time-domain-verification-id" content="464ce567-7be5-4bea-a773-e336059256ad"/>

        
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
<link rel="prefetch" href="/category/halloween-backgrounds" />

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
  position: 'relative',
  zIndex: '10001'
}}>
  {/* Featured Categories */}
  <button 
    onClick={() => navigate('/category/bookshelves-bright')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'bookshelves-bright' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.95rem',
      background: 'transparent',
      border: 'none',
      transition: 'color 0.2s ease',
      cursor: 'pointer',
      fontFamily: 'inherit'
    }}
  >
    Bookshelves
  </button>
  
  <button 
    onClick={() => navigate('/category/office-spaces')}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: currentPage === 'office-spaces' ? '#2563eb' : '#374151',
      fontWeight: '500',
      fontSize: '0.95rem',
      background: 'transparent',
      border: 'none',
      transition: 'color 0.2s ease',
      cursor: 'pointer',
      fontFamily: 'inherit'
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
      fontSize: '0.95rem',
      background: 'transparent',
      border: 'none',
      transition: 'color 0.2s ease',
      cursor: 'pointer',
      fontFamily: 'inherit'
    }}
  >
    Living Rooms
  </button>
  
  {/* More Dropdown */}
  <div style={{ position: 'relative' }}>
    <button
      onClick={(e) => {
        const dropdown = e.currentTarget.nextElementSibling;
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      }}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        color: '#374151',
        fontWeight: '500',
        fontSize: '0.95rem',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}
    >
      More <span style={{ fontSize: '0.7rem' }}>▼</span>
    </button>
    
    <div
      style={{
        display: 'none',
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.5rem',
        background: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '0.5rem',
        minWidth: '200px',
        zIndex: 10002
      }}
    >
      <button onClick={() => navigate('/category/bookshelves-dark')} style={dropdownItemStyle}>Bookshelves - Dark</button>
      <button onClick={() => navigate('/category/kitchens')} style={dropdownItemStyle}>Kitchens</button>
      <button onClick={() => navigate('/category/coffee-shops')} style={dropdownItemStyle}>Coffee Shops</button>
      <button onClick={() => navigate('/category/art-galleries')} style={dropdownItemStyle}>Art Galleries</button>
      <button onClick={() => navigate('/category/urban-lofts')} style={dropdownItemStyle}>Urban Lofts</button>
      <button onClick={() => navigate('/category/gardens-patios')} style={dropdownItemStyle}>Gardens & Patios</button>
      <button onClick={() => navigate('/category/historic-spaces')} style={dropdownItemStyle}>Historic Spaces</button>
      <button onClick={() => navigate('/category/nature-landscapes')} style={dropdownItemStyle}>Nature & Landscapes</button>
      <button onClick={() => navigate('/category/libraries')} style={dropdownItemStyle}>Libraries</button>
            <button onClick={() => navigate('/category/halloween-backgrounds')} style={dropdownItemStyle}>Halloween 🎃</button>

    </div>
  </div>
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