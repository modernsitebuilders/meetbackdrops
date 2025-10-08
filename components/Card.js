// components/Card.js
import Link from 'next/link';
import Image from 'next/image';

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
}) {
  const hasImage = !!imageSrc;
  
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div 
        className={className}
        onClick={(e) => {
          if (process.env.NODE_ENV === 'development' && navigate) {
            e.preventDefault();
            e.stopPropagation();
            navigate(href);
          }
        }}
        style={hasImage ? {
          background: 'white',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          ...customStyles
        } : customStyles}
      >
        {emoji && <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{emoji}</div>}
        
        {imageSrc && (
          <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
            <Image
              src={imageSrc}
              alt={imageAlt || title}
              fill
              style={{ objectFit: 'cover' }}
              quality={75}
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
        )}
        
        <div style={{ padding: hasImage ? '1.5rem' : '0' }}>
          <h3 style={{
            fontSize: hasImage ? '1.25rem' : '1rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: customStyles.titleColor || (hasImage ? '#111827' : '#1e293b')
          }}>
            {title}
          </h3>
          <p style={{ 
            color: customStyles.descColor || '#6b7280',
            fontSize: hasImage ? '1rem' : '0.9rem',
            marginBottom: hasImage ? '1rem' : '0'
          }}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}