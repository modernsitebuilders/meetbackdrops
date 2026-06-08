'use client';

import SocialShare from './SocialShare';
import { folderMap } from '../data/categoryData';
import { useState, useEffect } from 'react';
import PopularBadge from './PopularBadge';
import { useRouter } from 'next/router';
import { isHdOnlyFilename } from '../lib/hdOnly';
import { useWishlist } from '../lib/WishlistContext';
import { webpUrl } from '../lib/cloudinaryUrl';
import { useShowFilenames } from '../lib/useShowFilenames';

function trackAnalytics(eventType, filename, category) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, filename, category }),
  }).catch(() => {});
}

export default function ImageGrid({ images, slug, onImageClick, onDownload = [], scores = {}, metadata = {}, downloadingImage }) {
  const [sortedImages, setSortedImages] = useState(images);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const showFilenames = useShowFilenames();

  useEffect(() => {
    const imagesWithScores = images.map(image => {
      const baseName = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
      const score = scores[image.filename] || scores[`${baseName}.png`] || scores[`${baseName}.webp`] || 0;
      return { ...image, score };
    });

    // Split into free and HD-only pools, each sorted by score
    const free = imagesWithScores.filter(i => !isHdOnlyFilename(i.filename)).sort((a, b) => b.score - a.score);
    const hdOnly = imagesWithScores.filter(i => isHdOnlyFilename(i.filename)).sort((a, b) => b.score - a.score);

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
          link.href = webpUrl(image.folder || folderMap[slug] || slug, image.filename);
          link.download = `MeetBackdrops-${image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Still try to track asynchronously without blocking
          setTimeout(() => {
            fetch('/api/track-download', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: `MeetBackdrops-${image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '')}.png`, // PNG filename
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

  const freeCount = images.filter(i => !isHdOnlyFilename(i.filename)).length;

  return (
    <>
      <div style={{
        fontSize: '0.72rem',
        color: '#6b7280',
        marginBottom: '1.25rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        {freeCount} environments in this collection
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1rem'
      }}>
        {sortedImages.map((image, index) => {
          const hdOnly = isHdOnlyFilename(image.filename);
          const imageSlug = image.filename.replace(/\.webp$/i, '');
          // Collections pass cross-category images each carrying their own
          // `category`; canonical image page lives under the real category,
          // not the collection slug. Category pages omit `image.category`,
          // so this falls back to `slug` and behaves exactly as before.
          const imagePage = `/category/${image.category || slug}/${imageSlug}`;
          return (
          <div
            key={image.filename}
            style={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              background: '#fff',
              boxShadow: hoveredIndex === index
                ? '0 8px 20px rgba(0, 0, 0, 0.12)'
                : '0 1px 3px rgba(0, 0, 0, 0.06)',
              transform: hoveredIndex === index ? 'translateY(-3px)' : 'translateY(0)',
              transition: 'transform 0.22s ease, box-shadow 0.22s ease',
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => { if (hdOnly) { trackAnalytics('hd_cat_exclusive_click', image.filename, slug); window.location.href = '/hd'; } else { onImageClick(image); } }}
          >
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              overflow: 'hidden'
            }}>
              <img
                src={webpUrl(image.folder || folderMap[slug] || slug, image.filename)}
                alt={metadata[image.filename]?.alt || `${image.title} — high-fidelity 4K virtual environment for Zoom, Teams, and Google Meet`}
                title={metadata[image.filename]?.title || `${image.title} — MeetBackdrops Studio`}
                loading={index < 4 ? 'eager' : 'lazy'}
                decoding={index < 4 ? 'sync' : 'async'}
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                  transform: hoveredIndex === index ? 'scale(1.03)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}
              />

              {/* Hidden <a> so Google can crawl the image page */}
              <a
                href={imagePage}
                onClick={(e) => e.stopPropagation()}
                style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}
                aria-hidden="true"
                tabIndex={-1}
              />

              {/* HD-only corner badge */}
              {hdOnly && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  background: '#111827',
                  color: '#fff',
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  padding: '4px 9px',
                  borderRadius: '0',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  zIndex: 2,
                  pointerEvents: 'none',
                  borderBottom: '2px solid #9a6a3a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  HD Only · tap to view
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
                        thumb: webpUrl(image.folder || folderMap[slug] || slug, image.filename),
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

              {/* Hover Overlay — only mount when hovered/downloading to keep DOM small */}
              {(hoveredIndex === index || downloadingImage === image.filename) && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(17, 24, 39, 0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 1,
                  transition: 'opacity 0.3s ease',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  pointerEvents: 'auto',
                  padding: '0.75rem',
                }}
              >
                {hdOnly ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/hd';
                    }}
                    style={{
                      background: '#fff',
                      color: '#111827',
                      padding: '0.85rem 1.5rem',
                      border: '1px solid #fff',
                      borderBottom: '2px solid #9a6a3a',
                      borderRadius: '0',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      minWidth: '160px',
                      fontFamily: 'inherit',
                    }}
                  >
                    View HD →
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
                        background: downloadingImage === image.filename ? '#9a6a3a' : '#fff',
                        color: '#111827',
                        padding: '0.85rem 1.5rem',
                        border: '1px solid #fff',
                        borderBottom: '2px solid #9a6a3a',
                        borderRadius: '0',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        cursor: downloadingImage !== null ? 'not-allowed' : 'pointer',
                        minWidth: '170px',
                        fontFamily: 'inherit',
                      }}
                    >
                      {downloadingImage === image.filename ? (
                        <>
                          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>↻</span>
                          Downloading…
                        </>
                      ) : (
                        'Download Now'
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(image);
                      }}
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        padding: '0.7rem 1.25rem',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        borderRadius: '0',
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        minWidth: '170px',
                        fontFamily: 'inherit',
                      }}
                    >
                      Preview
                    </button>

                    <SocialShare
                      image={{...image, category: slug}}
                      title={metadata[image.filename]?.title || `${image.title} — MeetBackdrops Studio`}
                      size="small"
                      showLabels={false}
                      vertical={false}
                    />
                  </>
                )}
              </div>
              )}
            </div>
            {showFilenames && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: '0.4rem 0.6rem',
                  background: '#111827',
                  color: '#e5e7eb',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '0.02em',
                  userSelect: 'all',
                  cursor: 'text',
                  lineHeight: 1.3,
                  wordBreak: 'break-all',
                }}
              >
                {imageSlug}
              </div>
            )}
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