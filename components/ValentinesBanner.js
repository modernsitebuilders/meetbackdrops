import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ValentinesBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('valentines-banner-2026-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('valentines-banner-2026-dismissed', 'true');
    setIsVisible(false);
  };

  // Don't render on server or if dismissed
  if (!isMounted || !isVisible) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
      padding: '1.25rem 2rem',
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <span style={{
          fontSize: '2rem'
        }}>💕</span>
        
        <div>
          <h2 style={{
            color: 'white',
            margin: '0 0 0.25rem 0',
            fontSize: '1.3rem',
            fontWeight: '700'
          }}>
            Valentine's Day Backgrounds
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.95)',
            margin: 0,
            fontSize: '0.95rem'
          }}>
            Bring a Hint of Celebration to Your Workday
          </p>
        </div>

        <Link 
          href="/category/valentines-backgrounds"
          style={{
            background: 'white',
            color: '#c44569',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          Browse Collection →
        </Link>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: 'white',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        aria-label="Dismiss banner"
      >
        ×
      </button>
    </div>
  );
}