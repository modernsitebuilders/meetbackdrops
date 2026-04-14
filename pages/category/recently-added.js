import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ReviewModal from '../../components/ReviewModal';
import RateLimitModal from '../../components/RateLimitModal';
import BreadcrumbSchema from '../../components/BreadcrumbSchema';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import { useImageDownload } from '../../lib/useImageDownload';
import cloudinaryUrls from '../../cloudinary-urls.json';
import styles from '../../styles/CategoryPage.module.css';

export default function RecentlyAdded() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  
  const { 
    handleDownload, 
    showReviewModal, 
    setShowReviewModal,
    showRateLimitModal,
    setShowRateLimitModal,
    rateLimitError
  } = useImageDownload(cloudinaryUrls);

  const fetchRecentImages = async (currentOffset = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/recently-added?offset=${currentOffset}&limit=25`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent images');
      }
      
      const data = await response.json();
      
      if (append) {
        setImages(prev => [...prev, ...data.images]);
      } else {
        setImages(data.images);
      }
      
      setHasMore(data.hasMore);
      setOffset(data.nextOffset);
      setTotal(data.total);
      setLoading(false);
      setLoadingMore(false);
      
    } catch (err) {
      console.error('Failed to load recent images:', err);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRecentImages();
  }, []);

  const handleLoadMore = () => {
    fetchRecentImages(offset, true);
  };

  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| StreamBackdrops" or any other suffix.
  // Do not flag these as too short — they are intentionally optimised for SEO character limits.
  return (
    <Layout
      title="Recently Added Virtual Backgrounds | StreamBackdrops"
      description="Browse our newest virtual backgrounds added in the last 30 days. Fresh professional backgrounds for Zoom, Teams & Google Meet."
      canonical="https://streambackdrops.com/category/recently-added"
      currentPage="recently-added"
    >
      <Head>
        <BreadcrumbSchema items={[
          { name: "Home", url: "https://streambackdrops.com" },
          { name: "Recently Added", url: "https://streambackdrops.com/category/recently-added" }
        ]} />
      </Head>

      <div className={styles.categoryPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            ✨ Recently Added Backgrounds
          </h1>
          <p className={styles.description}>
            Our newest virtual backgrounds uploaded in the last 30 days
          </p>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading recent backgrounds...</p>
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>No new backgrounds in the last 30 days.</p>
            <Link href="/browse" style={{ color: '#2563eb', textDecoration: 'underline' }}>
              Browse all backgrounds →
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.stats}>
              <span>Showing {images.length} of {total} new backgrounds</span>
            </div>

            <div className={styles.gallery}>
              {images.map((image, index) => (
                <div 
                  key={`${image.filename}-${index}`}
                  className={styles.imageCard}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className={styles.imageWrapper}>
                    <img
                      src={`https://assets.streambackdrops.com/webp/${image.category}/${image.filename}`}
                      alt={`Recently added ${image.title}`}
                      loading={index < 6 ? 'eager' : 'lazy'}
                      style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                    />
                    <div className={styles.hoverOverlay}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDownload(image, image.category);
                        }}
                        className={styles.hoverDownloadButton}
                      >
                        Download
                      </button>
                    </div>
                    <div className={styles.newBadge}>New</div>
                  </div>
                  <div style={{ 
                    padding: '0.5rem', 
                    fontSize: '0.85rem', 
                    color: '#6b7280',
                    textAlign: 'center'
                  }}>
                    {image.category.replace(/-/g, ' ')}
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                padding: '2rem 0',
                marginTop: '2rem'
              }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    background: loadingMore ? '#9ca3af' : '#2563eb',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: loadingMore ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMore) e.target.style.background = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingMore) e.target.style.background = '#2563eb';
                  }}
                >
                  {loadingMore ? 'Loading...' : `Load More (${total - images.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        {selectedImage && (
          <ImagePreviewModal
            image={selectedImage}
            slug={selectedImage.category}
            onClose={() => setSelectedImage(null)}
            onDownload={(image, eventType) => handleDownload(image, image.category, eventType)}
          />
        )}

        {showReviewModal && (
          <ReviewModal 
            onClose={() => setShowReviewModal(false)}
          />
        )}

        {showRateLimitModal && (
          <RateLimitModal 
            onClose={() => setShowRateLimitModal(false)}
            errorMessage={rateLimitError}
          />
        )}
      </div>
    </Layout>
  );
}