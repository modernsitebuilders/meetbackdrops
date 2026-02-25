// components/MostPopularGrid.js
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
            background: '#2563eb',
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
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
          Most Popular Virtual Backgrounds
        </h2>
      </div>

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
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Image */}
            <div 
              onClick={() => setSelectedImage({
                filename: image.filename,
                title: image.filename.replace('.webp', '').replace(/-/g, ' '),
                category: image.category
              })}
              style={{ cursor: 'pointer' }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                overflow: 'hidden'
              }}>
                <Image
                  src={image.webPath}
                  alt={`${image.filename} - Popular virtual background`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
            
            {/* Download button */}
            <div style={{ padding: '0.75rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(
                    { filename: image.filename, category: image.category },
                    image.category
                  );
                }}
                disabled={downloadingImage === image.filename}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: '0.5rem',
                  background: downloadingImage === image.filename ? '#93c5fd' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: downloadingImage === image.filename ? 'wait' : 'pointer'
                }}
              >
                {downloadingImage === image.filename ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedImage && (
        <ImagePreviewModal
          image={selectedImage}
          slug={selectedImage.category}
          onClose={() => setSelectedImage(null)}
          onDownload={(img) => handleDownload(img, img.category)}
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