// components/Card.js
import Link from 'next/link';
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
          background: 'rgba(37, 99, 235, 0.95)',
          color: 'white',
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
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
            <img
              src={imageSrc}
              alt={imageAlt || title}
              width={400}
              height={225}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
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