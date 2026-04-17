import Link from 'next/link';
import Layout from '../../../components/Layout';
import Head from 'next/head';
import cloudinaryUrls from '../../../cloudinary-urls.json';
import { useImageDownload } from '../../../lib/useImageDownload';
import ReviewModal from '../../../components/ReviewModal';
import RateLimitModal from '../../../components/RateLimitModal';
import BreadcrumbSchema from '../../../components/BreadcrumbSchema';
import BackToTop from '../../../components/BackToTop';

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

  const webpUrl = `${CDN}/webp/${image.category}/${image.image_webp}`;
  const canonicalUrl = `https://streambackdrops.com/category/${image.category}/${image.slug}`;
  const categoryUrl = `/category/${image.category}`;

  const pageTitle = `${image.title} | Free Virtual Background | StreamBackdrops`;
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
            { name: 'Home', url: 'https://streambackdrops.com' },
            { name: categoryName, url: `https://streambackdrops.com${categoryUrl}` },
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
              width: 1920,
              height: 1080,
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
              <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <Link href={categoryUrl} style={{ color: '#2563eb', textDecoration: 'none' }}>{categoryName}</Link>
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
                style={{ width: '100%', display: 'block' }}
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
                  background: isDownloading ? '#9ca3af' : '#2563eb',
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
                  <Link href={categoryUrl} style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}>
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
