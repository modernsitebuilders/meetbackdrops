import Link from 'next/link';
import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import Head from 'next/head';
import cloudinaryUrls from '../../../cloudinary-urls.json';
import { useImageDownload } from '../../../lib/useImageDownload';
import ReviewModal from '../../../components/ReviewModal';
import RateLimitModal from '../../../components/RateLimitModal';
import PostCompareModal from '../../../components/PostCompareModal';
import BreadcrumbSchema from '../../../components/BreadcrumbSchema';
import BackToTop from '../../../components/BackToTop';
import { HD_BASE_IDS } from '../../../lib/hdProducts';

const CDN = 'https://assets.streambackdrops.com';

export default function ImagePage({ image, related, categoryName }) {
  const {
    handleDownload,
    showReviewModal,
    setShowReviewModal,
    showRateLimitModal,
    setShowRateLimitModal,
    rateLimitError,
    downloadCount,
    downloadingImage,
    emailBonusUsed,
    handleEmailBonus,
  } = useImageDownload(cloudinaryUrls);

  const hasHd = HD_BASE_IDS.has(image.slug);
  const hdHref = hasHd ? `/hd?product=${image.slug}-hd` : '/hd';
  const [showHdModal, setShowHdModal] = useState(false);

  useEffect(() => {
    if (showReviewModal && hasHd) {
      setShowReviewModal(false);
      setShowHdModal(true);
    }
  }, [showReviewModal]);

  const webpUrl = `${CDN}/webp/${image.category}/${image.image_webp}`;
  const canonicalUrl = `https://meetbackdrops.com/category/${image.category}/${image.slug}`;
  const categoryUrl = `/category/${image.category}`;

  const pageTitle = `${image.title} | Free Virtual Background | MeetBackdrops`;
  const pageDescription = image.description ||
    `Download this free ${categoryName.toLowerCase()} virtual background for Zoom, Teams & Google Meet. No signup, no watermarks.`;

  const downloadImage = { filename: image.image_webp, title: image.title };
  const isDownloading = downloadingImage === image.image_webp;

  return (
    <>
      <Layout
        title={pageTitle}
        description={pageDescription}
        canonical={canonicalUrl}
        image={webpUrl}
      >
        <Head>
          <BreadcrumbSchema items={[
            { name: 'Home', url: 'https://meetbackdrops.com' },
            { name: categoryName, url: `https://meetbackdrops.com${categoryUrl}` },
            { name: image.title, url: canonicalUrl },
          ]} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ImageObject',
              name: image.title,
              description: image.description,
              contentUrl: webpUrl,
              url: canonicalUrl,
              encodingFormat: 'image/webp',
              width: 1456,
              height: 816,
              creator: {
                '@type': 'Organization',
                name: 'MeetBackdrops Studio',
                url: 'https://meetbackdrops.com',
              },
              creditText: 'MeetBackdrops Studio',
              copyrightNotice: '© MeetBackdrops Studio. Free for personal and commercial use under the site license.',
              license: 'https://meetbackdrops.com/license',
              acquireLicensePage: 'https://meetbackdrops.com/license',
            }) }}
          />
        </Head>

        <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Breadcrumb */}
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: '#6b7280',
              flexWrap: 'wrap',
            }}>
              <Link href="/" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.04em' }}>Home</Link>
              <span>›</span>
              <Link href={categoryUrl} style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.04em' }}>{categoryName}</Link>
              <span>›</span>
              <span style={{ color: '#111827' }}>{image.title}</span>
            </nav>

            {/* Main image */}
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}>
              <img
                src={webpUrl}
                alt={image.alt || image.title}
                width={1456}
                height={816}
                loading="eager"
                fetchpriority="high"
                decoding="async"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Title + download */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '2rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem', lineHeight: '1.3' }}>
                  {image.title}
                </h1>
                <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: '1.7', margin: 0 }}>
                  {image.description}
                </p>
              </div>
              <button
                onClick={() => handleDownload(downloadImage, image.category)}
                disabled={isDownloading}
                style={{
                  background: isDownloading ? '#9ca3af' : '#111827',
                  color: '#fff',
                  border: 'none',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                {isDownloading ? 'Downloading…' : '⬇ Free Download'}
              </button>
            </div>

            {/* How to use — visible after the user has the file. Lightweight, no JS state. */}
            <details style={{
              marginBottom: '1.5rem',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '0.85rem 1.1rem',
            }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#111827',
                listStyle: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ fontSize: '1.1rem' }}>💡</span>
                How to use this on Zoom, Teams, and Google Meet
              </summary>
              <div style={{ marginTop: '0.85rem', display: 'grid', gap: '0.85rem', fontSize: '0.9rem', color: '#374151', lineHeight: 1.55 }}>
                <div>
                  <strong style={{ color: '#111827' }}>Zoom:</strong> Settings → Backgrounds &amp; Effects → click <em>+</em> next to Virtual Backgrounds → Add Image → choose this PNG.
                </div>
                <div>
                  <strong style={{ color: '#111827' }}>Microsoft Teams:</strong> Before joining a call, click <em>Background filters</em> → Add new → upload this PNG. Or in-call: <em>More</em> → <em>Apply background effects</em>.
                </div>
                <div>
                  <strong style={{ color: '#111827' }}>Google Meet:</strong> Click the visual-effects icon (bottom-right of self-view) → <em>Backgrounds</em> tab → upload this PNG with the <em>+</em> button.
                </div>
                <div style={{ paddingTop: '0.4rem', borderTop: '1px solid #f3f4f6', color: '#6b7280', fontSize: '0.85rem' }}>
                  Tip: 16:9 aspect ratio, designed for codec compression so it stays crisp on calls.
                </div>
              </div>
            </details>

            {/* HD Upsell Strip — always rendered. Copy + CTA differ when this specific image has an HD variant. */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: '1.25rem',
              alignItems: 'center',
              background: '#111827',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#facc15', color: '#111', padding: '0.15rem 0.5rem', borderRadius: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>HD</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {hasHd ? 'This image in HD — 2912 × 1632' : 'For 27"+ monitors, recordings, and Teams Premium'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  Free version is <strong style={{ color: '#fff' }}>1456 × 816</strong> (1.18 MP — below 1080p). HD is <strong style={{ color: '#fff' }}>2912 × 1632</strong> (4.75 MP — covers QHD natively). On large monitors, executive cameras, and recorded calls, the free version softens; HD doesn't.
                </p>
              </div>
              <Link
                href={hdHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#facc15',
                  color: '#111827',
                  textDecoration: 'none',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {hasHd ? 'Get HD — $4.99' : 'Browse HD Editions →'}
              </Link>
            </div>

            {/* Tags */}
            {image.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '3rem' }}>
                {image.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      background: '#e5e7eb',
                      color: '#374151',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Related images */}
            {related.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  More {categoryName} Backgrounds
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}>
                  {related.map(rel => (
                    <Link
                      key={rel.slug}
                      href={`/category/${rel.category}/${rel.slug}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}>
                        <img
                          src={`${CDN}/webp/${rel.category}/${rel.image_webp}`}
                          alt={rel.alt || rel.title}
                          loading="lazy"
                          style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}
                        />
                        <p style={{ margin: 0, padding: '0.75rem', fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                          {rel.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <Link href={categoryUrl} style={{ color: '#9a6a3a', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                    View all {categoryName} backgrounds →
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {showReviewModal && (
          <ReviewModal onClose={() => setShowReviewModal(false)} downloadCount={downloadCount} />
        )}
        {showRateLimitModal && (
          <RateLimitModal
            onClose={() => setShowRateLimitModal(false)}
            errorMessage={rateLimitError}
            onEmailBonus={handleEmailBonus}
            emailBonusUsed={emailBonusUsed}
          />
        )}
        {showHdModal && (
          <PostCompareModal
            isOpen={showHdModal}
            imageId={image.slug}
            slug={image.category}
            primaryHref={hdHref}
            secondaryHref="/hd"
            onClose={() => setShowHdModal(false)}
          />
        )}

        {/* Sticky mobile download CTA — keeps the action in reach while scrolling related images */}
        <div className="mb-sticky-cta">
          <button
            onClick={() => handleDownload(downloadImage, image.category)}
            disabled={isDownloading}
            style={{
              flex: 1,
              background: isDownloading ? '#9ca3af' : '#111827',
              color: '#fff',
              border: 'none',
              padding: '0.95rem 1rem',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            }}
          >
            {isDownloading ? 'Downloading…' : '⬇ Free PNG Download'}
          </button>
          {hasHd && (
            <Link
              href={hdHref}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#facc15',
                color: '#111827',
                textDecoration: 'none',
                padding: '0.95rem 1.1rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              }}
            >
              HD $4.99
            </Link>
          )}
        </div>
        <style jsx>{`
          .mb-sticky-cta {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            display: none;
            gap: 0.6rem;
            padding: 0.7rem 0.9rem calc(0.7rem + env(safe-area-inset-bottom));
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(8px);
            border-top: 1px solid #e5e7eb;
            z-index: 50;
          }
          @media (max-width: 767px) {
            .mb-sticky-cta { display: flex; }
          }
        `}</style>

        <BackToTop />
      </Layout>
    </>
  );
}

export async function getStaticPaths() {
  const { getAllImages } = require('../../../lib/manifest');
  return {
    paths: getAllImages().map(img => ({
      params: { slug: img.category, imageSlug: img.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { getImageBySlug, getImagesByCategory } = require('../../../lib/manifest');
  const { CATEGORIES } = require('../../../lib/categories-config');

  const image = getImageBySlug(params.imageSlug);
  if (!image || image.category !== params.slug) return { notFound: true };

  const siblings = getImagesByCategory(image.category);
  const currentIdx = siblings.findIndex(s => s.slug === image.slug);
  const related = [];
  for (let i = 1; related.length < 6; i++) {
    const candidate = siblings[(currentIdx + i) % siblings.length];
    if (!candidate || candidate.slug === image.slug) break;
    related.push(candidate);
  }

  const categoryConfig = CATEGORIES[image.category];
  const categoryName = categoryConfig?.name ||
    image.category.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

  return {
    props: { image, related, categoryName },
    revalidate: 86400,
  };
}
