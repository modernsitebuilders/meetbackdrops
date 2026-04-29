// components/MostPopularGrid.js
'use client';

import { useState, useEffect } from 'react';

function trackAnalytics(eventType, filename, category) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, filename, category }),
  }).catch(() => {});
}
import { useImageDownload } from '../lib/useImageDownload';
import ReviewModal from './ReviewModal';
import RateLimitModal from './RateLimitModal';
import ImagePreviewModal from './ImagePreviewModal';

export default function MostPopularGrid() {
  const [popularData, setPopularData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cloudinaryUrls, setCloudinaryUrls] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const {
    handleDownload,
    showReviewModal,
    setShowReviewModal,
    showRateLimitModal,
    setShowRateLimitModal,
    rateLimitError,
    downloadingImage
  } = useImageDownload(cloudinaryUrls);

  useEffect(() => {
    fetchPopularData();
    fetch('/cloudinary-urls.json')
      .then(r => r.ok ? r.json() : {})
      .then(setCloudinaryUrls)
      .catch(() => {});
    
    const interval = setInterval(fetchPopularData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPopularData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/popular/images');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load popular images');
      }
      
      setPopularData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching popular images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔄</div>
        <p>Loading most popular backgrounds...</p>
      </div>
    );
  }

  if (error || !popularData) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚠️</div>
        <p>Unable to load popular images</p>
        <button 
          onClick={fetchPopularData}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {popularData.images.map((image, index) => (
          <div
            key={image.filename}
            style={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              setHoveredIndex(index);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              setHoveredIndex(null);
            }}
            onClick={() => { trackAnalytics('popular_image_click', image.filename, image.category); setSelectedImage({ filename: image.filename, title: image.filename.replace('.webp', '').replace(/-/g, ' '), category: image.category }); }}
          >
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              overflow: 'hidden'
            }}>
              <img
                src={image.webPath?.startsWith('/images/') ? `https://assets.streambackdrops.com/webp${image.webPath.slice('/images'.length)}` : image.webPath}
                alt={`${image.filename} - Popular virtual background`}
                loading="lazy"
                style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
              />

              {/* Hover overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (hoveredIndex === index || downloadingImage === image.filename) ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: (hoveredIndex === index || downloadingImage === image.filename) ? 'auto' : 'none'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const baseFilename = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
                    trackAnalytics('popular_download', `StreamBackdrops-${baseFilename}.png`, image.category);
                    handleDownload(
                      { filename: image.filename, category: image.category },
                      image.category
                    );
                  }}
                  disabled={downloadingImage === image.filename}
                  style={{
                    background: downloadingImage === image.filename ? '#10b981' : '#111827',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: downloadingImage === image.filename ? 'not-allowed' : 'pointer',
                    minWidth: '140px'
                  }}
                >
                  {downloadingImage === image.filename ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedImage && (
        <ImagePreviewModal
          image={selectedImage}
          slug={selectedImage.category}
          onClose={() => setSelectedImage(null)}
          onDownload={(img, eventType) => handleDownload(img, img.category, eventType)}
        />
      )}

      {showReviewModal && (
        <ReviewModal onClose={() => setShowReviewModal(false)} />
      )}

      {showRateLimitModal && (
        <RateLimitModal 
          onClose={() => setShowRateLimitModal(false)}
          errorMessage={rateLimitError}
        />
      )}

    </div>
  );
}