'use client';

import SocialShare from './SocialShare';
import { folderMap } from '../data/categoryData';
import { useState, useEffect } from 'react';
import PopularBadge from './PopularBadge';
import { useRouter } from 'next/router';
import allImageMetadata from '../public/data/image-metadata-complete.json';
import { useWishlist } from '../lib/WishlistContext';
import { webpUrl } from '../lib/cloudinaryUrl';

function trackAnalytics(eventType, filename, category) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, filename, category }),
  }).catch(() => {});
}

const hdOnlyFilenames = new Set(
  allImageMetadata.filter(img => img.hdOnly).map(img => img.filename)
);

export default function ImageGrid({ images, slug, onImageClick, onDownload = [], scores = {}, downloadingImage }) {
  const [sortedImages, setSortedImages] = useState(images);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const imagesWithScores = images.map(image => {
      const baseName = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
      const score = scores[image.filename] || scores[`${baseName}.png`] || scores[`${baseName}.webp`] || 0;
      return { ...image, score };
    });

    // Split into free and HD-only pools, each sorted by score
    const free = imagesWithScores.filter(i => !hdOnlyFilenames.has(i.filename)).sort((a, b) => b.score - a.score);
    const hdOnly = imagesWithScores.filter(i => hdOnlyFilenames.has(i.filename)).sort((a, b) => b.score - a.score);

    // Inject HD-only images at fixed slots so free images always lead
    const HD_SLOTS = [10, 17, 27, 36, 47];
    const result = [...free];
    hdOnly.forEach((img, i) => {
      const slot = HD_SLOTS[i];
      if (slot !== undefined && slot <= result.length) {
        result.splice(slot, 0, img);
      } else {
        result.push(img); // fallback: append if category has fewer free images than slot
      }
    });

    setSortedImages(result);
  }, [images, scores]);

  // Enhanced download handler with retry logic
  const handleDownloadWithRetry = async (image) => {
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📥 Download attempt ${attempt}/${maxRetries} for:`, image.filename);
        await onDownload(image);
        console.log(`✅ Download successful on attempt ${attempt}:`, image.filename);
        break; // Success, exit loop
      } catch (error) {
        console.error(`❌ Download attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          console.log('🔄 Last attempt failed, using direct download fallback');
          
          // Last attempt failed, use direct download
          const link = document.createElement('a');
          link.href = webpUrl(folderMap[slug] || slug, image.filename);
          link.download = `StreamBackdrops-${image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Still try to track asynchronously without blocking
          setTimeout(() => {
            fetch('/api/track-download', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: `StreamBackdrops-${image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '')}.png`, // PNG filename
    originalFilename: image.filename, // Original WebP
    category: slug,
    fallback: true,
    timestamp: new Date().toISOString(),
    note: 'Direct download fallback after retry failure'
  })
})
            .then(response => response.json())
            .then(data => {
              console.log('📊 Fallback tracking result:', data);
            })
            .catch(e => console.error('❌ Fallback tracking failed:', e));
          }, 1000);
          
          // Show success feedback for user even with fallback
          setTimeout(() => {
            if (window.gtag) {
              window.gtag('event', 'download', {
                'event_category': 'engagement',
                'event_label': image.filename,
                'image_name': image.filename,
                'category': slug,
                'value': 1,
                'fallback': true
              });
            }
          }, 500);
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = 1000 * attempt; // 1s, 2s
          console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  };

  return (
    <>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '1rem'
      }}>
        {(() => {
          const hdCount = images.filter(i => hdOnlyFilenames.has(i.filename)).length;
          const freeCount = images.length - hdCount;
          return `Browse ${freeCount} Free Backgrounds`;
        })()}
      </h2>

      <p style={{
        color: '#6b7280',
        marginBottom: '2rem'
      }}>
        Click to preview · 💎 HD Only images available on our HD page
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {sortedImages.map((image, index) => {
          const hdOnly = hdOnlyFilenames.has(image.filename);
          return (
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
            onClick={() => { if (hdOnly) { trackAnalytics('hd_cat_exclusive_click', image.filename, slug); window.location.href = '/hd'; } else { onImageClick(image); } }}
          >
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              overflow: 'hidden'
            }}>
              <img
                src={webpUrl(folderMap[slug] || slug, image.filename)}
                alt={`${image.title} - Free virtual background for Zoom, Teams & Google Meet`}
                title={`Download ${image.title} - Professional video call background`}
                loading={index < 4 ? 'eager' : 'lazy'}
                decoding={index < 4 ? 'sync' : 'async'}
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }}
              />

              {/* HD-only corner badge */}
              {hdOnly && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '4px 9px',
                  borderRadius: '4px',
                  letterSpacing: '0.03em',
                  zIndex: 2,
                  pointerEvents: 'none',
                  boxShadow: '0 2px 6px rgba(91,33,182,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  💎 HD Only · tap to view
                </div>
              )}

              {/* Wishlist heart — hdOnly cards only */}
              {hdOnly && (() => {
                const hdId = image.filename.replace(/\.webp$/, '-hd');
                const saved = isWishlisted(hdId);
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      trackAnalytics(saved ? 'wishlist_remove' : 'wishlist_add', hdId, slug);
                      toggleWishlist({
                        id: hdId,
                        name: image.filename.replace(/\.webp$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                        category: slug,
                        hdOnly: true,
                        thumb: webpUrl(folderMap[slug] || slug, image.filename),
                      });
                    }}
                    aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: saved ? 'rgba(37,99,235,0.9)' : 'rgba(0,0,0,0.45)',
                      border: 'none', borderRadius: '50%',
                      width: '28px', height: '28px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', zIndex: 3,
                      fontSize: '0.85rem',
                      opacity: hoveredIndex === index || saved ? 1 : 0,
                      transition: 'opacity 0.2s, background 0.15s',
                    }}
                  >{saved ? '💙' : '🤍'}</button>
                );
              })()}

              {/* Hover Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: hdOnly ? 'rgba(91, 33, 182, 0.78)' : 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (hoveredIndex === index || downloadingImage === image.filename) ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  flexDirection: 'column',
                  gap: '1rem',
                  pointerEvents: (hoveredIndex === index || downloadingImage === image.filename) ? 'auto' : 'none'
                }}
              >
                {hdOnly ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/hd';
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      minWidth: '140px',
                    }}
                  >
                    💎 View HD
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadWithRetry(image);
                      }}
                      disabled={downloadingImage !== null}
                      style={{
                        background: downloadingImage === image.filename ? '#10b981' : '#2563eb',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: downloadingImage !== null ? 'not-allowed' : 'pointer',
                        opacity: downloadingImage === image.filename ? 0.9 : 1,
                        transition: 'background 0.1s',
                        minWidth: '140px'
                      }}
                    >
                      {downloadingImage === image.filename ? (
                        <>
                          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>↻</span>
                          Downloading...
                        </>
                      ) : (
                        'Download Now'
                      )}
                    </button>

                    <SocialShare
                      image={{...image, category: slug}}
                      title={`${image.title} - Free Virtual Background`}
                      size="small"
                      showLabels={false}
                      vertical={false}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}