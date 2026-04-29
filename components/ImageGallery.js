// CREATE a new file: components/ImageGallery.js

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function ImageGallery() {
  const [imageMetadata, setImageMetadata] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch('/api/metadata');
        if (response.ok) {
          const data = await response.json();
          setImageMetadata(data || {});
        }
      } catch (error) {
        console.error('Failed to load metadata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, []);

  const handleDownload = useCallback(async (image) => {
    try {
      const response = await fetch(`/images/${image.filename}`);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = image.filename.replace('.webp', '.png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
      const link = document.createElement('a');
      link.href = `/images/${image.filename}`;
      link.download = image.filename;
      link.click();
    }
  }, []);

  // Get featured images from each category
  const getFeaturedImages = useCallback(() => {
    if (!imageMetadata) return [];

    const categories = ['home-lifestyle', 'home-lifestyle', 'professional-shelves', 'professional-shelves', 'professional-shelves'];
    const featured = [];

    categories.forEach(category => {
      const categoryImages = Object.entries(imageMetadata)
        .filter(([_, data]) => data?.category === category)
        .map(([key, data]) => ({ key, ...data }))
        .slice(0, 2); // Get 2 from each category

      featured.push(...categoryImages);
    });

    return featured.slice(0, 12); // Limit to 12 total
  }, [imageMetadata]);

  if (loading) {
    return (
      <section style={{ 
        padding: '4rem 2rem',
        background: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 'bold',
            marginBottom: '2rem',
            color: '#111827'
          }}>
            Featured Backgrounds
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #111827',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        </div>
      </section>
    );
  }

  const featuredImages = getFeaturedImages();

  if (featuredImages.length === 0) {
    return null;
  }

  return (
    <>
      <section style={{ 
        padding: 'clamp(3rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
        background: 'white'
      }}>
        <div className="container">
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 'clamp(1rem, 2vw, 2rem)',
            color: '#111827'
          }}>
            Featured Backgrounds
          </h2>
          
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: 'clamp(2rem, 4vw, 3rem)',
            maxWidth: '600px',
            margin: '0 auto clamp(2rem, 4vw, 3rem)'
          }}>
            Explore our most popular professional virtual backgrounds
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2rem)',
            marginTop: '2rem'
          }}>
            {featuredImages.map((image, index) => (
              <div
                key={image.key}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedImage(image)}
              >
                <div style={{
                  position: 'relative',
                  height: 'clamp(180px, 20vw, 200px)',
                  overflow: 'hidden'
                }}>
                  <Image
                    src={`/images/${image.filename}`}
                    alt={image.title || 'Virtual background'}
                    fill
                    style={{ objectFit: 'cover' }}
                    loading={index < 6 ? "eager" : "lazy"}
                    quality={70}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
                  />
                  
                  <div style={{
                    position: 'absolute',
                    bottom: '0.5rem',
                    left: '0.5rem',
                    right: '0.5rem',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(image);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#374151',
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      👁️ Preview
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                      style={{
                        background: '#111827',
                        color: 'white',
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      📥 Download
                    </button>
                  </div>
                </div>

                <div style={{
                  padding: 'clamp(1rem, 2vw, 1.5rem)'
                }}>
                  <h3 style={{
                    fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '0.5rem'
                  }}>
                    {image.title || 'Virtual Background'}
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {image.description || 'Professional virtual background'}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      color: '#16a34a',
                      fontWeight: '600',
                      fontSize: 'clamp(0.9rem, 1.5vw, 1rem)'
                    }}>
                      Free Download
                    </span>
                    <span style={{
                      background: '#f3f4f6',
                      color: '#6b7280',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize'
                    }}>
                      {image.category?.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1rem',
              maxWidth: '95vw',
              maxHeight: '90vh',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ✕
            </button>
            
            <h3 style={{
              marginBottom: '1rem',
              paddingRight: '3rem',
              fontSize: 'clamp(1.1rem, 2vw, 1.2rem)',
              fontWeight: '600'
            }}>
              {selectedImage.title || 'Preview'}
            </h3>
            
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Image
                src={`/images/${selectedImage.filename}`}
                alt={selectedImage.alt || 'Preview'}
                width={600}
                height={338}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
                priority
                quality={90}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => handleDownload(selectedImage)}
                style={{
                  backgroundColor: '#111827',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  flex: 1
                }}
              >
                📥 Download
              </button>
              
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        div:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
      `}</style>
    </>
  );
}