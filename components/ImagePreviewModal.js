import Image from 'next/image';
import SocialShare from './SocialShare';
import { folderMap } from '../data/categoryData';
import { useState } from 'react';

// Utility function for consistent image URLs
const getImageUrl = (slug, filename) => {
  const folder = folderMap[slug];
  if (!folder || !filename) return '';
  return `/images/${folder}/${filename}`;
};

export default function ImagePreviewModal({ image, slug, onClose, onDownload }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!image) return null;

  const imageUrl = getImageUrl(slug, image.filename);

  const handleDownload = (e) => {
    e.stopPropagation();
    onDownload(image);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '2rem'
      }}
      onClick={handleClose}
    >
      {/* Close Button */}
      <button
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '3rem',
          height: '3rem',
          cursor: 'pointer',
          fontSize: '1.5rem',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onClick={handleClose}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        ×
      </button>

      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          maxWidth: '95vw',
          maxHeight: '90vh',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Social Share */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'row' : 'column',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <SocialShare 
            image={{...image, category: slug}}
            title={`${image.title} - Free Virtual Background`}
            size="large"
            showLabels={false}
            vertical={!window.innerWidth < 768}
          />
        </div>
        
        {/* Image Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '70vw',
            maxHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!imageLoaded && !imageError && (
              <div style={{
                width: '800px',
                height: '450px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                Loading...
              </div>
            )}
            
            {imageError ? (
              <div style={{
                width: '800px',
                height: '450px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div>Failed to load image</div>
                <button 
                  onClick={() => setImageError(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt={image.title}
                width={800}
                height={450}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  display: imageLoaded ? 'block' : 'none'
                }}
                quality={90}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
          </div>
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}