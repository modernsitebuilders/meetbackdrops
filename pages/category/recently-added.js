import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ReviewModal from '../../components/ReviewModal';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import cloudinaryUrls from '../../cloudinary-urls.json';
import styles from '../../styles/CategoryPage.module.css';

export default function RecentlyAdded() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

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

  const handleDownload = async (image, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    try {
      // Admin bypass
      if (typeof window !== 'undefined' && localStorage.getItem('streambackdrops_admin') === 'true') {
        const link = document.createElement('a');
        link.href = `/images/${image.category}/${image.filename}`;
        link.download = `StreamBackdrops-${image.filename.replace('.webp', '.png')}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Track download
      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: image.downloadName,
          category: image.category
        })
      }).catch(() => {});

      // Get Cloudinary URL
      const baseFilename = image.filename.replace('.webp', '');
      const imageUrl = cloudinaryUrls[baseFilename];
      
      if (imageUrl) {
        const cloudinaryPngUrl = imageUrl.replace('/upload/', '/upload/f_png/');
        const filename = `StreamBackdrops-${baseFilename}.png`;
        const downloadUrl = `/api/download?url=${encodeURIComponent(cloudinaryPngUrl)}&filename=${encodeURIComponent(filename)}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('No Cloudinary URL found for', baseFilename);
      }
      
      // Show review modal
      setTimeout(() => setShowReviewModal(true), 2000);
      
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Layout
      title="Recently Added Virtual Backgrounds | StreamBackdrops"
      description="Browse our newest virtual backgrounds added in the last 30 days. Fresh professional backgrounds for Zoom, Teams & Google Meet."
      canonical="https://streambackdrops.com/category/recently-added"
      currentPage="recently-added"
    >
      <Head>
        <link rel="canonical" href="https://streambackdrops.com/category/recently-added" />
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
                    <Image
                      src={`/images/${image.category}/${image.filename}`}
                      alt={`Recently added ${image.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      loading={index < 6 ? 'eager' : 'lazy'}
                      priority={index < 3}
                    />
                    <div className={styles.hoverOverlay}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(image);
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
            onDownload={handleDownload}
          />
        )}

        {showReviewModal && (
          <ReviewModal 
            onClose={() => setShowReviewModal(false)}
          />
        )}
      </div>
    </Layout>
  );
}