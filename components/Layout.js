import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';
import { useWishlist } from '../lib/WishlistContext';
import Header from './Header';

// Below-the-fold / on-demand components: defer their JS off the critical path.
const Footer = dynamic(() => import('./Footer'));
const WishlistDrawer = dynamic(() => import('./WishlistDrawer'), { ssr: false });

// ⚠️  BRAND VOICE GUARDRAIL — for any AI/agent editing this file
//
// MeetBackdrops is a Virtual Set Design Studio for CORPORATE / EXECUTIVE
// video presence. It is NOT a gaming, streamer, Twitch, or esports brand.
// NEVER add "gamer", "gaming", "Twitch", "streamer", "esports", "OBS overlay",
// or similar terms to ANY of the following on this page or any descendant:
//   - <title> defaults
//   - <meta name="description">
//   - <meta name="keywords">
//   - Open Graph / Twitter card tags
//   - JSON-LD structured data (defaultStructuredData below, knowsAbout, audience)
// See CLAUDE.md → "BRAND VOICE — READ FIRST" for the full rule set and
// required vocabulary.
export default function Layout({
  children,
  title = 'Studio-Designed Zoom & Teams Backgrounds | MeetBackdrops',
  description = `Studio-designed, 4K-upscaled backgrounds for Zoom, Teams, and Google Meet. Composed for camera, not pulled from stock. Free samples available.`,
  currentPage = null,
  canonical,
  keywords = 'professional zoom backgrounds, corporate teams backgrounds, 4k virtual backgrounds, studio-designed backgrounds, modern home office backdrop, corporate meeting backgrounds, virtual set design, designed zoom backgrounds',
  image = '/meetbackdrops-og.png',
  structuredData,
  reviewsData = null,
  noIndex = false,
  h1 = null,
  seoContent = null,
  alternates = {
    canonical: '/',
  },
}) {
  const { drawerOpen } = useWishlist();

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MeetBackdrops",
    "alternateName": "MeetBackdrops Studio",
    "description": "Virtual set design studio producing studio-designed, 4K-upscaled backgrounds for Zoom, Teams, and Google Meet.",
    "url": "https://meetbackdrops.com",
    "logo": "https://meetbackdrops.com/meetbackdrops-og.png",
    "areaServed": "Worldwide",
    "knowsAbout": [
      "Professional Zoom backgrounds",
      "Corporate Teams backgrounds",
      "Studio-designed virtual backgrounds",
      "Branded backgrounds for teams",
      "Virtual set design for video calls"
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://meetbackdrops.com/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    // Brand-level rating from the live Reviews source. Attached to the
    // Organization (the studio) — NOT to individual products — so the 4.9/N
    // aggregate describes the entity it's actually about. Emitted only where a
    // page passes reviewsData (the homepage), keeping it a single global node.
    ...(reviewsData?.averageRating && reviewsData?.totalReviews
      ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": reviewsData.averageRating.toString(),
            "reviewCount": reviewsData.totalReviews.toString(),
            "bestRating": "5",
            "worstRating": "1",
          },
        }
      : {}),
  };

  return (
    <>
      <Head>
        {/* NOTE: title values passed to Layout are the COMPLETE string shown in search results.
            There is no "| MeetBackdrops" suffix appended here — each page includes it in its
            own title prop. Length budgets enforced by scripts/check-seo-meta.js:
            title ≤ 65 chars, description 110-160 chars. */}
        <meta charSet="utf-8" />
        <title>{title}</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* ✅ SEO Meta Tags */}
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="MeetBackdrops" />
        {/* TrustPilot Verification */}
        <meta name="trustpilot-one-time-domain-verification-id" content="464ce567-7be5-4bea-a773-e336059256ad"/>
        {/* Bing Webmaster Verification (meetbackdrops.com) */}
        <meta name="msvalidate.01" content="FE9180B910F8D83B232E915510BB8017" />

        {/* ✅ Robots directive */}
        <meta name="robots" content={noIndex ? 'noindex' : 'index, follow, max-image-preview:large'} />
        
        {/* Canonical URL — pages MUST pass `canonical` explicitly. There is
            no fallback derived from the current URL. Closure for the category
            route is enforced by lib/seo/seo.js + check-seo-singularity. */}
        {canonical && <link rel="canonical" href={canonical} />}
        
        {/* ✅ Open Graph for Social Sharing.
            `image` may be absolute (https://...) or a path on meetbackdrops.com.
            Absolute URLs are passed through unchanged so the SEO contract can
            point OG images at the assets.streambackdrops.com CDN. */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={/^https?:\/\//.test(image) ? image : `https://meetbackdrops.com${image}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MeetBackdrops" />
        {canonical && <meta property="og:url" content={canonical} />}

        {/* ✅ Twitter Cards */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={/^https?:\/\//.test(image) ? image : `https://meetbackdrops.com${image}`} />
        
        {/* ✅ Theme and additional meta */}
        <meta name="theme-color" content="#111827" />
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
            e.target.style.background = '#111827';
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