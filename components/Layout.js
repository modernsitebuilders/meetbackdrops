import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';
import Footer from './Footer';

export default function Layout({
  children,
  title = 'StreamBackdrops - Free Professional Virtual Backgrounds',
  description = `Download free professional HD virtual backgrounds for Zoom, Microsoft Teams, and Google Meet. Over ${TOTAL_IMAGES_FORMATTED} premium images for video calls.
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);

  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [router.asPath]);

  const navigate = (path) => {
    router.push(path);
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

  // Navigation items - RESTORED to original structure
  const navItems = [
    { 
      name: 'Bookshelves', 
      path: '/category/bookshelves-bright', 
      key: 'bookshelves-bright',
      isActive: currentPage === 'bookshelves-bright'
    },
    { 
      name: 'Office Spaces', 
      path: '/category/office-spaces', 
      key: 'office-spaces',
      isActive: currentPage === 'office-spaces'
    },
    { 
      name: 'Living Rooms', 
      path: '/category/living-rooms', 
      key: 'living-rooms',
      isActive: currentPage === 'living-rooms'
    }
  ];

  const dropdownCategories = [
    { name: 'Bookshelves - Dark', path: '/category/bookshelves-dark', key: 'bookshelves-dark' },
    { name: 'Kitchens', path: '/category/kitchens', key: 'kitchens' },
    { name: 'Coffee Shops', path: '/category/coffee-shops', key: 'coffee-shops' },
    { name: 'Art Galleries', path: '/category/art-galleries', key: 'art-galleries' },
    { name: 'Urban Lofts', path: '/category/urban-lofts', key: 'urban-lofts' },
    { name: 'Gardens & Patios', path: '/category/gardens-patios', key: 'gardens-patios' },
    { name: 'Historic Spaces', path: '/category/historic-spaces', key: 'historic-spaces' },
    { name: 'Nature & Landscapes', path: '/category/nature-landscapes', key: 'nature-landscapes' },
    { name: 'Libraries', path: '/category/libraries', key: 'libraries' },
    { name: 'Halloween 🎃', path: '/category/halloween-backgrounds', key: 'halloween-backgrounds' }
  ];

  const navButtonStyle = (isActive = false, isHovered = false) => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    color: isActive ? '#2563eb' : '#374151',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.95rem',
    background: isHovered ? '#f3f4f6' : 'transparent',
    border: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transform: isHovered ? 'translateY(-1px)' : 'none',
    borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent'
  });

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* SEO Meta Tags */}
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="StreamBackdrops" />
        <meta name="trustpilot-one-time-domain-verification-id" content="464ce567-7be5-4bea-a773-e336059256ad"/>

        <meta name="robots" content={noIndex ? 'noindex' : 'index, follow, max-image-preview:large'} />
        <link rel="canonical" href={canonical || `https://streambackdrops.com${router.asPath.split('?')[0]}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`https://streambackdrops.com${image}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="StreamBackdrops" />
        {canonical && <meta property="og:url" content={canonical} />}
        
        {/* Twitter Cards */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={`https://streambackdrops.com${image}`} />
        
        <meta name="theme-color" content="#2563eb" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData || defaultStructuredData)
          }}
        />

        {/* Prefetching */}
        {currentPage === 'home' && (
          <>
            {[...navItems, ...dropdownCategories].map((category) => (
              <link key={category.path} rel="prefetch" href={category.path} />
            ))}
          </>
        )}
      </Head>

      {/* H1 Section */}
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

      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: '#f9fafb'
      }}>
        {/* Header - RESTORED with proper category navigation */}
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
            {/* Logo */}
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
                fontFamily: 'inherit'
              }}
            >
              StreamBackdrops
            </button>
            
            {/* Navigation - RESTORED to original working structure */}
            <nav style={{ 
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              {/* Main category buttons */}
              {navItems.map((item) => (
                <button 
                  key={item.key}
                  onClick={() => navigate(item.path)}
                  style={navButtonStyle(item.isActive, hoveredNav === item.key)}
                  onMouseEnter={() => setHoveredNav(item.key)}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  {item.name}
                </button>
              ))}
              
              {/* More dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  style={{
                    ...navButtonStyle(false, hoveredNav === 'more'),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={() => setHoveredNav('more')}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  More <span style={{ fontSize: '0.7rem' }}>▼</span>
                </button>
                
                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      background: 'white',
                      borderRadius: '0.5rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      padding: '0.5rem',
                      minWidth: '200px',
                      zIndex: 10002,
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    {dropdownCategories.map((category) => (
                      <button 
                        key={category.path}
                        onClick={() => {
                          navigate(category.path);
                          setIsDropdownOpen(false);
                        }}
                        style={{
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
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f0f9ff';
                          e.target.style.color = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#374151';
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}