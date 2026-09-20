'use client';

import { useEffect } from 'react';
import { trackEvent } from '../lib/trackEvent';

// All three CTAs (primary / secondary / dismiss) used to fire ONE
// `post_compare_cta_click` event distinguished only by an `extra.target` field.
// /api/analytics persists only its destructured field list, so `target` and
// `href` were silently dropped — which made a DISMISS indistinguishable from a
// conversion click in the first-party data. GA4 never received target either,
// so it was recorded nowhere. The target now rides in the event name, matching
// the `hub_scroll_depth_<n>` precedent in CategoryHub.
//
// The old hand-rolled POST also omitted originalSource entirely, so every row
// from this surface landed as source 'direct' (the endpoint's fallback), along
// with pageViews/downloads of 0. trackEvent supplies all of them.
function track(eventType, { imageId, slug }) {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', eventType, {
      event_category: 'Post-Compare Modal',
      event_label: imageId,
    });
  }
  trackEvent(eventType, imageId, slug);
}

export default function PostCompareModal({
  isOpen,
  imageId,
  slug,
  primaryHref,
  secondaryHref,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrimary = () => {
    track('post_compare_cta_primary', { imageId, slug });
  };

  const handleSecondary = () => {
    track('post_compare_cta_secondary', { imageId, slug });
  };

  const handleDismiss = () => {
    track('post_compare_cta_dismiss', { imageId, slug });
    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Want this one in HD?"
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10050,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '0.75rem',
          maxWidth: '460px',
          width: '100%',
          padding: '2rem 1.75rem 1.5rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            margin: '0 0 0.75rem',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
          }}
        >
          Want this one in HD?
        </h2>
        <p
          style={{
            margin: '0 0 1.5rem',
            fontSize: '1rem',
            lineHeight: 1.55,
            color: '#475569',
          }}
        >
          The HD version of the exact background you just previewed.
          <br />
          2912 × 1632, instant download, keep forever.
        </p>

        <a
          href={primaryHref}
          onClick={handlePrimary}
          style={{
            display: 'block',
            background: '#facc15',
            color: '#111827',
            textDecoration: 'none',
            padding: '0.9rem 1.25rem',
            borderRadius: '0.5rem',
            fontWeight: 700,
            fontSize: '1rem',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 14px rgba(250, 204, 21, 0.3)',
          }}
        >
          Get this background in HD — $4.99
        </a>

        <a
          href={secondaryHref}
          onClick={handleSecondary}
          style={{
            display: 'block',
            background: 'transparent',
            color: '#9a6a3a',
            textDecoration: 'none',
            padding: '0.65rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: '1.5px solid #111827',
            marginBottom: '1rem',
          }}
        >
          See all HD office backgrounds
        </a>

        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
          }}
        >
          Not right now
        </button>
      </div>
    </div>
  );
}
