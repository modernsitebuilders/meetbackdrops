// components/MostPopularGrid.js
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
        background: '#f8fafc',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Most Popular Virtual Backgrounds
        </h2>
        <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>
          Based on actual downloads and popularity scoring. Updated automatically.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          fontSize: '0.875rem',
          color: '#475569'
        }}>
          <span>🕒 Last updated: {new Date(popularData.lastUpdated).toLocaleString()}</span>
          <span>📊 Total images tracked: {popularData.totalImages}</span>
          <span>⭐ Average score: {popularData.averageScore}</span>
        </div>
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
            {/* Rank badge */}
            <div style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              background: index < 3 ? '#f59e0b' : '#6b7280',
              color: 'white',
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1rem',
              zIndex: 10
            }}>
              #{index + 1}
            </div>
            
            {/* Score badge */}
            <div style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              background: '#10b981',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              zIndex: 10
            }}>
              {image.score} pts
            </div>
            
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
            
            {/* Info */}
            <div style={{ padding: '1rem' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {image.filename.replace('.webp', '').replace(/-/g, ' ')}
              </h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <span>📁 {image.category}</span>
                <span>📥 {image.downloads} downloads</span>
              </div>
              
              {image.lastDownload && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginTop: '0.5rem'
                }}>
                  Last downloaded: {new Date(image.lastDownload).toLocaleDateString()}
                </div>
              )}
              
              <div style={{ marginTop: '0.75rem' }}>
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
                    display: 'inline-block',
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
                  {downloadingImage === image.filename ? 'Downloading...' : 'Download This Background'}
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

      {/* Refresh button */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          onClick={fetchPopularData}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          ↻ Refresh Popular List
        </button>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          Updates automatically every 5 minutes
        </p>
      </div>
    </div>
  );
}