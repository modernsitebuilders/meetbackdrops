import Link from 'next/link';
import SocialShare from './SocialShare';
import { folderMap } from '../data/categoryData';
import { useEffect, useRef } from 'react';
import { webpUrl } from '../lib/cloudinaryUrl';

function trackAnalytics(eventType, filename, category) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, filename, category }),
  }).catch(() => {});
}
import { getSessionData, getOrCreateVisitorId, isReturningVisitor } from '../lib/sessionTracking';
import { HD_BASE_IDS } from '../lib/hdImages';

export default function ImagePreviewModal({ image, slug, onClose, onDownload, cloudinaryUrls }) {
  if (!image) return null;

  const baseId = image.filename ? image.filename.replace(/\.\w+$/, '') : null;
  const hasHd = baseId ? HD_BASE_IDS.has(baseId) : false;
  const previewSrc = (cloudinaryUrls && baseId && cloudinaryUrls[baseId])
    ? cloudinaryUrls[baseId]
    : webpUrl(image.folder || folderMap[slug], image.filename);

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
    const isAdmin = typeof window !== 'undefined' && localStorage.getItem('streambackdrops_admin') === 'true';
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
        visitorType: isReturningVisitor() ? 'returning' : 'new',
        isAdmin
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
        zIndex: 1100,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <style>{`
        .modal-close-btn {
          position: fixed;
          top: 1rem;
          bottom: auto;
          right: 1rem;
        }
        .modal-inner {
          flex-direction: row;
        }
        .modal-social {
          display: flex;
        }
        @media (max-width: 767px) {
          .modal-close-btn {
            top: auto;
            bottom: 1rem;
            right: 1rem;
          }
          .modal-inner {
            flex-direction: column;
          }
          .modal-social {
            display: none;
          }
        }
      `}</style>

      {/* Close Button - fixed so it never participates in layout */}
      <button
        ref={closeButtonRef}
        aria-label="Close image preview"
        className="modal-close-btn"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#000',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '3rem',
          height: '3rem',
          cursor: 'pointer',
          fontSize: '1.75rem',
          fontWeight: 'bold',
          zIndex: 1200,
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
        className="modal-inner"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '95vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Vertical Social Share - Hidden on mobile via CSS */}
        <div className="modal-social" style={{
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <SocialShare
            image={{...image, category: slug}}
            title={`${image.title} - Free Virtual Background`}
            size="large"
            showLabels={false}
            vertical={true}
          />
        </div>

        {/* Image + Action column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          flex: '1 1 0',
          minWidth: 0,
        }}>
          {/* Image wrapper */}
          <div style={{ position: 'relative', lineHeight: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt={image.title}
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 8rem)',
                width: 'auto',
                height: 'auto',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              }}
            />
          </div>

          {/* Download button — single item, overlap impossible */}
          <button
            aria-label={`Download ${image.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onDownload(image, 'modal_download');
            }}
            style={{
              flexShrink: 0,
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '0.85rem 1.75rem',
              border: '1px solid #111827',
              borderBottom: '2px solid #9a6a3a',
              borderRadius: '0',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#000'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#111827'; }}
          >
            Download Free
          </button>

          {/* HD upsell — text-only, secondary to Download */}
          {hasHd && (
            <Link
              href={`/hd?highlight=${baseId}`}
              onClick={(e) => {
                e.stopPropagation();
                trackAnalytics('preview_modal_hd_click', image.filename, slug);
              }}
              style={{
                color: 'rgba(255, 255, 255, 0.72)',
                fontSize: '0.82rem',
                textDecoration: 'none',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              Want this in higher resolution?{' '}
              <span style={{ color: '#c4b5fd', fontWeight: 500 }}>
                Get the HD version →
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
