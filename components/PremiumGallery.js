// UPDATE components/PremiumGallery.js - Fix pricing to $7.99

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function PremiumGallery() {
  const [premiumImages, setPremiumImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  const loadPremiumImages = useCallback(async () => {
    try {
      const response = await fetch('/api/metadata');
      if (response.ok) {
        const metadata = await response.json();
        const premium = Object.entries(metadata)
          .filter(([_, data]) => data?.isPremium)
          .map(([key, data]) => ({ key, ...data }));
        setPremiumImages(premium);
      }
    } catch (error) {
      console.error('Failed to load premium images:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPremiumImages();
  }, [loadPremiumImages]);

  const handlePreview = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  const handlePurchase = useCallback(async (image) => {
    if (!purchaseEmail || !purchaseEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('/api/premium-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageKey: image.key,
          email: purchaseEmail,
          imageTitle: image.title
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${image.key}-4k.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        setShowPurchaseForm(false);
        setPurchaseEmail('');
        alert('Thank you for your purchase! Your 4K image has been downloaded.');
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again or contact support.');
    }
  }, [purchaseEmail]);

  if (loading) {
    return (
      <section style={{padding: '2rem'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', padding: '4rem 0'}}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #111827',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
            <p style={{color: '#6b7280', marginTop: '1rem'}}>Loading premium collection...</p>
          </div>
        </div>
      </section>
    );
  }

  if (premiumImages.length === 0) {
    return (
      <section style={{padding: '2rem'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', padding: '4rem 0'}}>
            <h3 style={{color: '#111827', marginBottom: '1rem'}}>Premium Collection Coming Soon</h3>
            <p style={{color: '#6b7280', marginBottom: '2rem'}}>
              We're preparing our ultra high-quality 4K backgrounds. Check back soon!
            </p>
            <a href="/" style={{
              color: '#111827',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              ← Browse Free Backgrounds
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* PREMIUM IMAGES GRID */}
      <section style={{padding: 'clamp(1rem, 3vw, 2rem)'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2rem)'
          }}>
            {premiumImages.map((image, index) => (
              <div key={image.key} style={{
                background: 'white',
                borderRadius: '1rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#fbbf24';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              >
                <div style={{
                  position: 'relative', 
                  height: 'clamp(200px, 25vw, 280px)', 
                  overflow: 'hidden'
                }}>
                  <Image
                    src={`/images/${image.filename}`}
                    alt={image.title || 'Premium 4K Virtual Background'}
                    fill
                    style={{objectFit: 'cover'}}
                    loading={index < 3 ? "eager" : "lazy"}
                    quality={80}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                  />
                  
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                    fontWeight: 'bold'
                  }}>
                    4K Premium
                  </div>
                  
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    right: '1rem',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => handlePreview(image)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#374151',
                        padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        flex: 1,
                        minHeight: '44px'
                      }}
                    >
                      👁️ Preview
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedImage(image);
                        setShowPurchaseForm(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        color: 'white',
                        padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        flex: 1,
                        minHeight: '44px'
                      }}
                    >
                      💎 Buy $7.99
                    </button>
                  </div>
                </div>

                <div style={{padding: 'clamp(1.5rem, 3vw, 2rem)'}}>
                  <h3 style={{
                    fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '0.75rem'
                  }}>
                    {image.title || 'Premium 4K Background'}
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    marginBottom: '1.5rem',
                    lineHeight: 1.6,
                    fontSize: 'clamp(0.9rem, 1.5vw, 1rem)'
                  }}>
                    {image.description || 'Ultra high-resolution professional virtual background'}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{
                        color: '#f59e0b',
                        fontWeight: 'bold',
                        fontSize: 'clamp(1.1rem, 2vw, 1.25rem)'
                      }}>
                        $7.99
                      </div>
                      <div style={{
                        color: '#6b7280',
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
                      }}>
                        4K • Commercial License
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      color: 'white',
                      padding: '0.75rem',
                      borderRadius: '50%',
                      fontSize: 'clamp(1.2rem, 2vw, 1.5rem)'
                    }}>
                      💎
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PURCHASE MODAL */}
      {showPurchaseForm && selectedImage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={() => setShowPurchaseForm(false)}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: 'clamp(1.5rem, 3vw, 2rem)',
            maxWidth: '400px',
            width: '100%'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#111827'
            }}>
              Purchase 4K Background
            </h3>
            
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
              fontSize: 'clamp(0.9rem, 1.5vw, 1rem)'
            }}>
              {selectedImage.title} - $7.99
            </p>
            
            <input
              type="email"
              placeholder="Enter your email address"
              value={purchaseEmail}
              onChange={(e) => setPurchaseEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                marginBottom: '1.5rem',
                minHeight: '44px'
              }}
            />
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button
                onClick={() => setShowPurchaseForm(false)}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  flex: 1,
                  minHeight: '44px'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={() => handlePurchase(selectedImage)}
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  flex: 1,
                  minHeight: '44px'
                }}
              >
                Purchase $7.99
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {selectedImage && !showPurchaseForm && (
        <div style={{
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
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
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
              {selectedImage.title || 'Premium 4K Preview'}
            </h3>
            
            <Image
              src={`/images/${selectedImage.filename}`}
              alt={selectedImage.alt || 'Premium preview'}
              width={600}
              height={338}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '60vh',
                objectFit: 'contain',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}
              priority
              quality={90}
            />
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button
                onClick={() => {
                  setShowPurchaseForm(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  flex: 1,
                  minHeight: '44px'
                }}
              >
                💎 Purchase 4K Version - $7.99
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
                  fontWeight: '600',
                  minHeight: '44px'
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
      `}</style>
    </>
  );
}