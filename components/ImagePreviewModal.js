import Image from 'next/image';
import SocialShare from './SocialShare';
import { folderMap } from '../data/categoryData';
import { useEffect, useRef } from 'react';
import { getSessionData, getOrCreateVisitorId, isReturningVisitor } from '../lib/sessionTracking';

export default function ImagePreviewModal({ image, slug, onClose, onDownload }) {
  if (!image) return null;

  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (!image) return;
    
    const session = getSessionData();
    fetch('/api/track-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: image.filename,
        category: image.category || slug,
        page: window.location.pathname,
        sessionId: session?.id,
        originalReferrer: session?.originalReferrer || 'direct',
        originalUtmSource: session?.originalUtmSource,
        originalUtmMedium: session?.originalUtmMedium,
        originalUtmCampaign: session?.originalUtmCampaign,
        landingPage: session?.landingPage,
        pageViewsInSession: session?.pageViews || 0,
        downloadsInSession: session?.downloads || 0,
        visitorId: getOrCreateVisitorId(),
        visitorType: isReturningVisitor() ? 'returning' : 'new'
      })
    }).catch(() => {});
  }, [image, slug]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${image.title}`}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '4rem'
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        ref={closeButtonRef}
        aria-label="Close image preview"
        style={{
          position: 'fixed',
          top: window.innerWidth < 768 ? 'auto' : '5rem',
          bottom: window.innerWidth < 768 ? '2rem' : 'auto',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#000',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '3.5rem',
          height: '3.5rem',
          cursor: 'pointer',
          fontSize: '2rem',
          fontWeight: 'bold',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>

      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '95vw',
          maxHeight: '90vh',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Vertical Social Share - Hidden on mobile */}
        {window.innerWidth >= 768 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <SocialShare 
              image={{...image, category: slug}}
              title={`${image.title} - Free Virtual Background`}
              size="large"
              showLabels={false}
              vertical={true}
            />
          </div>
        )}
        
        {/* Image Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '90vw',
            maxHeight: '80vh'
          }}>
            <Image
              src={`/images/${folderMap[slug]}/${image.filename}`}
              alt={image.title}
              width={1456}
              height={816}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}
              quality={90}
            />
          </div>
          
          {/* Download Button */}
          <button
            aria-label={`Download ${image.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onDownload(image);
            }}
            style={{
              position: window.innerWidth >= 768 ? 'absolute' : 'static',
              bottom: window.innerWidth >= 768 ? '2.5rem' : 'auto',
              left: window.innerWidth >= 768 ? '50%' : 'auto',
              transform: window.innerWidth >= 768 ? 'translateX(-50%)' : 'none',
              marginTop: window.innerWidth < 768 ? '1rem' : '0',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.5)',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}