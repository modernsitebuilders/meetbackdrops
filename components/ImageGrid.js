import Image from 'next/image';
import SocialShare from './SocialShare';
import { folderMap } from '../data/categoryData';
import { useState, useEffect } from 'react';
import PopularBadge from './PopularBadge';

export default function ImageGrid({ images, slug, onImageClick, onDownload, topImages = [] }) {
    const [sortedImages, setSortedImages] = useState(images);

  useEffect(() => {
    // Load scores and sort images
   fetch('/api/calculate-scores')
  .then(res => res.json())
  .then(data => {
        const scores = data.scores;
        const imagesWithScores = images.map(image => {
          // Strip extension to match .webp with .png tracking
          const baseName = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
          
          // Try exact match first, then try with different extensions
          let score = 0;
          if (scores[image.filename]) {
            score = scores[image.filename].score;
          } else {
            // Try .png, .webp, .jpg variants
            const variants = [
              `${baseName}.png`,
              `${baseName}.webp`,
              `${baseName}.jpg`,
              `${baseName}.jpeg`
            ];
            for (const variant of variants) {
              if (scores[variant]) {
                score = scores[variant].score;
                break;
              }
            }
          }
          
          return {
            ...image,
            score: score
          };
        });
        
        // Sort by score, highest first
        const sorted = imagesWithScores.sort((a, b) => b.score - a.score);
        setSortedImages(sorted);
      })
      .catch(err => {
        console.error('Could not load scores:', err);
        setSortedImages(images); // Fall back to original order
      });
  }, [images]);

  return (
    <>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '1rem'
      }}>
        Browse {images.length} Free Backgrounds
      </h2>
      
      <p style={{
        color: '#6b7280',
        marginBottom: '2rem'
      }}>
        Click on any image to preview
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {sortedImages.map((image, index) => (
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => onImageClick(image)}
          >
            {/* ImageObject Schema */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "ImageObject",
                  "contentUrl": `https://streambackdrops.com/images/${folderMap[slug]}/${image.filename}`,
                  "name": image.title,
                  "description": `Free ${image.title} - virtual background for Zoom, Teams, and Google Meet`,
                  "thumbnail": `https://streambackdrops.com/images/${folderMap[slug]}/${image.filename}`,
                  "license": "https://creativecommons.org/publicdomain/zero/1.0/",
                  "acquireLicensePage": "https://streambackdrops.com/about",
                  "creator": {
                    "@type": "Organization",
                    "name": "StreamBackdrops"
                  },
                  "creditText": "StreamBackdrops",
                  "copyrightNotice": "© 2025 StreamBackdrops - CC0 Public Domain",
                  "width": "1456",
                  "height": "816"
                })
              }}
            />

            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              overflow: 'hidden'
            }}>
            {topImages.includes(image.filename) && <PopularBadge />}
              <Image
                src={`/images/${folderMap[slug]}/${image.filename}`}
                alt={`${image.title} - Free virtual background for Zoom, Teams & Google Meet`}
                title={`Download ${image.title} - Professional video call background`}
                width={1456}
                height={816}
                style={{ 
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }}
                loading={index < 8 ? 'eager' : 'lazy'}
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
              />
              
              {/* Hover Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                flexDirection: 'column',
                gap: '1rem'
              }}
              className="image-overlay">
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(image);
                  }}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Download
                </button>

                <SocialShare 
                  image={{...image, category: slug}}
                  title={`${image.title} - Free Virtual Background`}
                  size="small"
                  showLabels={false}
                  vertical={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .image-overlay:hover {
          opacity: 1 !important;
        }
        
        div:hover .image-overlay {
          opacity: 1;
        }
      `}</style>
    </>
  );
}