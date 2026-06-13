import Link from 'next/link';
import SocialShare from './SocialShare';
import { folderMap } from '../data/categoryData';
import { useEffect, useRef } from 'react';
import { webpUrl } from '../lib/cloudinaryUrl';
import { isAdmin } from '../lib/adminAuth';

function trackAnalytics(eventType, filename, category) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, filename, category }),
  }).catch(() => {});
}
import { getSessionData, getOrCreateVisitorId, isReturningVisitor } from '../lib/sessionTracking';
import { HD_BASE_IDS } from '../lib/hdProducts';

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
    const adminUser = isAdmin();
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
        isAdmin: adminUser
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

          {/* CTA stack — Free + HD at visual parity (intervention v4) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '0.5rem',
            width: 'min(360px, 100%)',
          }}>
            <button
              aria-label={`Download ${image.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onDownload(image, 'modal_download');
              }}
              style={{
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
              Download Free Sample
            </button>

            <a
              href="https://zoom.us/oauth/authorize?response_type=code&client_id=10qROZhCTrK9wfXTtVHmiw&redirect_uri=https://meetbackdrops.com/api/zoom/callback"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackAnalytics('zoom_install_click', image.filename, slug);
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#fff',
                padding: '0.85rem 1.75rem',
                border: '1px solid rgba(255,255,255,0.35)',
                borderBottom: '2px solid rgba(255,255,255,0.35)',
                borderRadius: '0',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, color 0.2s ease',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v9.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/>
              </svg>
              Use in Zoom
            </a>

            {hasHd && (
              <Link
                href={`/hd?highlight=${baseId}`}
                onClick={(e) => {
                  e.stopPropagation();
                  trackAnalytics('preview_modal_hd_button_click', image.filename, slug);
                }}
                style={{
                  backgroundColor: '#E0A82E',
                  color: '#111827',
                  padding: '0.85rem 1.75rem',
                  border: '1px solid #E0A82E',
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
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c89020'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#E0A82E'; }}
              >
                Get HD — $4.99
              </Link>
            )}

            {hasHd && (
              <div style={{
                color: 'rgba(255, 255, 255, 0.78)',
                fontSize: '0.78rem',
                lineHeight: 1.5,
                textAlign: 'center',
                marginTop: '0.15rem',
                letterSpacing: '0.02em',
              }}>
                HD = 2912×1632, 4× the resolution. Sharper through codec compression.
              </div>
            )}

            {hasHd && (
              <Link
                href={`/commercial-license?image=${baseId}-hd`}
                onClick={(e) => {
                  e.stopPropagation();
                  trackAnalytics('commercial_license_click', image.filename, slug);
                }}
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.72rem',
                  textAlign: 'center',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  letterSpacing: '0.02em',
                }}
              >
                Using it in something you sell? Commercial license →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
