'use client';

import Image from 'next/image';
import SocialShare from './SocialShare';
import { folderMap } from '../data/categoryData';
import { useState, useEffect } from 'react';
import PopularBadge from './PopularBadge';

export default function ImageGrid({ images, slug, onImageClick, onDownload = [], scores = {}, downloadingImage }) {
  const [sortedImages, setSortedImages] = useState(images);
  const [hoveredIndex, setHoveredIndex] = useState(null);

useEffect(() => {
  const imagesWithScores = images.map(image => {
    const baseName = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
    const score = scores[image.filename] || scores[`${baseName}.png`] || scores[`${baseName}.webp`] || 0;
    return { ...image, score };
  });
  
  setSortedImages(imagesWithScores.sort((a, b) => b.score - a.score));
}, [images, scores]);

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
              setHoveredIndex(index);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              setHoveredIndex(null);
            }}
            onClick={() => onImageClick(image)}
          >
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              overflow: 'hidden'
            }}>
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
                priority={index < 4}
                loading={index < 4 ? undefined : 'lazy'}
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
              />

              {/* Hover Overlay */}
<div
  style={{
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
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
                <button
  onClick={(e) => {
    e.stopPropagation();
    onDownload(image);
  }}
  disabled={downloadingImage === image.filename}
  style={{
    background: downloadingImage === image.filename ? '#10b981' : '#2563eb',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: downloadingImage === image.filename ? 'not-allowed' : 'pointer',
    opacity: downloadingImage === image.filename ? 0.9 : 1,
    transition: 'background 0.1s'
  }}
>
  {downloadingImage === image.filename ? 'Downloading...' : 'Download'}
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
    </>
  );
}