import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CATEGORIES } from '../lib/categories-config';

export default function EasterBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const dismissed = localStorage.getItem('easter-banner-2026-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('easter-banner-2026-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #a8e6cf 0%, #b8f0d8 25%, #ffe0f0 60%, #ffd3b6 100%)',
      padding: '1.25rem 2rem',
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.08)'
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
        <span style={{ fontSize: '2rem' }}>🐣</span>

        <div>
          <h2 style={{
            color: '#1a3a24',
            margin: '0 0 0.25rem 0',
            fontSize: '1.3rem',
            fontWeight: '700'
          }}>
            Easter Backgrounds Are Here
          </h2>
          <p style={{
            color: '#2d4a35',
            margin: 0,
            fontSize: '0.95rem'
          }}>
            {CATEGORIES['easter-backgrounds'].count} free spring backgrounds — bunnies, pastels & Easter charm
          </p>
        </div>

        <Link
          href="/category/easter-backgrounds"
          style={{
            background: 'white',
            color: '#2d7a4a',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
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
          background: 'rgba(45, 74, 53, 0.15)',
          border: 'none',
          color: '#1a3a24',
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
          e.target.style.background = 'rgba(45, 74, 53, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(45, 74, 53, 0.15)';
        }}
        aria-label="Dismiss banner"
      >
        ×
      </button>
    </div>
  );
}
