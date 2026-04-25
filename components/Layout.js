import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';
import { useWishlist } from '../lib/WishlistContext';
import Header from './Header';
import SpringBanner from './SpringBanner';

// Below-the-fold / on-demand components: defer their JS off the critical path.
const Footer = dynamic(() => import('./Footer'));
const WishlistDrawer = dynamic(() => import('./WishlistDrawer'), { ssr: false });

export default function Layout({
  children,
  title = 'StreamBackdrops - Free Professional Virtual Background Images',
  description = `Download free professional still image virtual backgrounds for Zoom, Microsoft Teams, and Google Meet. Over ${TOTAL_IMAGES_FORMATTED} static photo backgrounds for video calls.
No signup required, no watermarks - just high-quality background images perfect for video calls, remote work, and online meetings.`,
  currentPage = null,
  canonical,
  keywords = 'virtual backgrounds, virtual background images, Zoom backgrounds, Teams backgrounds, still image backgrounds, photo backgrounds, professional video calls, free download',
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
  const { drawerOpen } = useWishlist();

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StreamBackdrops",
    "description": "Free professional still image virtual backgrounds for video calls — static photos, not video streams",
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
        {/* NOTE: title values passed to Layout are the COMPLETE string shown in search results.
            There is no "| StreamBackdrops" suffix appended here — each page includes it in its
            own title prop. Do not shorten titles just because they look long; they are
            intentionally optimised to fit the 50-60 character SEO limit including the suffix. */}
        <meta charSet="utf-8" />
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
        
        {/* ✅ Canonical URL */}
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

        {/* Prefetch the few highest-traffic categories. Each prefetch downloads
            an HTML page + its JS chunk, so keep this list small. */}
        {currentPage === 'home' && (
          <>
            <link rel="prefetch" href="/category/bookshelves" />
            <link rel="prefetch" href="/category/wall-shelves" />
            <link rel="prefetch" href="/category/office-spaces" />
            <link rel="prefetch" href="/category/living-rooms" />
          </>
        )}
      </Head>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <a
          href="#main-content"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
          onFocus={(e) => {
            e.target.style.left = '0';
            e.target.style.width = 'auto';
            e.target.style.height = 'auto';
            e.target.style.padding = '0.75rem 1.5rem';
            e.target.style.background = '#2563eb';
            e.target.style.color = '#fff';
            e.target.style.zIndex = '9999';
            e.target.style.textDecoration = 'none';
            e.target.style.fontWeight = '600';
            e.target.style.borderRadius = '0 0 0.375rem 0';
          }}
          onBlur={(e) => {
            e.target.style.left = '-9999px';
            e.target.style.width = '1px';
            e.target.style.height = '1px';
          }}
        >
          Skip to content
        </a>
        <Header currentPage={currentPage} />
        {router.asPath !== '/category/spring-backgrounds' && <SpringBanner />}
        {drawerOpen && <WishlistDrawer />}

        {/* Main Content */}
        <main id="main-content" style={{ flex: 1 }}>
          {children}
        </main>
       <Footer />
      </div>
    </>
  );
}