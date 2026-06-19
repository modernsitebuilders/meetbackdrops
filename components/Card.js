// components/Card.js
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Card({ 
  href, 
  title, 
  description, 
  imageSrc,
  imageAlt,
  emoji,
  customStyles = {},
  navigate,
  className = '',
  priority = false,
  count,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const hasImage = !!imageSrc;
  
  const cardStyle = {
    background: hasImage ? 'white' : 'transparent',
    borderRadius: hasImage ? '1rem' : '0',
    overflow: 'hidden',
    boxShadow: hasImage ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    transform: isHovered && hasImage ? 'translateY(-4px)' : 'none',
    boxShadow: isHovered && hasImage ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : (hasImage ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'),
    ...customStyles
  };

  return (
    <Link
      prefetch={false}
      href={href}
      style={{ textDecoration: 'none', position: 'relative', display: 'block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {count && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: '#111827',
          color: '#fff',
          padding: '0.4rem 0.85rem',
          borderRadius: '0',
          borderBottom: '2px solid #9a6a3a',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          zIndex: 10
        }}>
          {count} images
        </div>
      )}

      <div 
        className={className}
        onClick={(e) => {
          if (process.env.NODE_ENV === 'development' && navigate) {
            e.preventDefault();
            e.stopPropagation();
            navigate(href);
          }
        }}
        style={cardStyle}
      >
        {emoji && !hasImage && (
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            {emoji}
          </div>
        )}
        
        {imageSrc && (
          <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
            <Image
              src={imageSrc}
              alt={imageAlt || title}
              fill
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              sizes="(max-width: 600px) 90vw, (max-width: 1100px) 45vw, 380px"
              style={{
                objectFit: 'cover',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
        )}
        
        <div style={{ 
          padding: hasImage ? '1.5rem' : '0.5rem 0',
          textAlign: hasImage ? 'left' : 'center'
        }}>
          <h3 style={{
            fontSize: hasImage ? '1.25rem' : '1rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: customStyles.titleColor || (hasImage ? '#111827' : '#1e293b'),
            lineHeight: '1.4'
          }}>
            {title}
          </h3>
          <p style={{ 
            color: customStyles.descColor || '#6b7280',
            fontSize: hasImage ? '1rem' : '0.9rem',
            marginBottom: hasImage ? '1rem' : '0',
            lineHeight: '1.5'
          }}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}