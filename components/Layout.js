import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';
import Footer from './Footer';
import Header from './Header';
import EasterBanner from './EasterBanner';

export default function Layout({
  children,
  title = 'StreamBackdrops - Free Professional Virtual Backgrounds',
  description = `Download free professional virtual backgrounds for Zoom, Microsoft Teams, and Google Meet. Over ${TOTAL_IMAGES_FORMATTED} premium images for video calls.
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

        {/* ✅ Google AdSense */}
  <script 
    async 
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8364914545820320"
    crossOrigin="anonymous"
  />
        
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

        {/* Add prefetching for popular categories on homepage */}
        {currentPage === 'home' && (
          <>
            <link rel="prefetch" href="/category/bookshelves-bright" />
            <link rel="prefetch" href="/category/bookshelves-dark" />
            <link rel="prefetch" href="/category/office-spaces" />
            <link rel="prefetch" href="/category/living-rooms" />
            <link rel="prefetch" href="/category/kitchens" />
            <link rel="prefetch" href="/category/conference-rooms" />
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
        {router.asPath !== '/category/easter-backgrounds' && <EasterBanner />}

        {/* Main Content */}
        <main id="main-content" style={{ flex: 1 }}>
          {children}
        </main>
       <Footer />
      </div>
    </>
  );
}