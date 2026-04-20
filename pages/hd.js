import Head from 'next/head';
import BreadcrumbSchema from '../components/BreadcrumbSchema';
import ComparisonWidgetSchema from '../components/ComparisonWidgetSchema';
import HdFaqSchema from '../components/HdFaqSchema';
import ProductSchema from '../components/ProductSchema';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';
import ComparisonWidget from '../components/ComparisonWidget';
import { loadStripe } from '@stripe/stripe-js';
import { getReviewsData } from '../lib/reviews';
import cloudinaryUrls from '../cloudinary-urls.json';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';
import { isHdOnlyProductId as isHdOnly } from '../lib/hdOnly';
import { useWishlist } from '../lib/WishlistContext';

const SINGLE_PRICE_ID = 'price_1Sr4U0Q695ongkMjxUtnf9NA';
const SINGLE_PRICE = 4.99;

function trackAnalytics(eventType, filename, category) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      filename,
      category,
      originalSource: typeof document !== 'undefined' ? (document.referrer || 'direct') : 'direct'
    })
  }).catch(() => {});
}

// ─── Subscriber Download Button ───────────────────────────────────────────────
function SubscriberDownloadButton({ product, token, onDownloadComplete, onLimitReached }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch('/api/subscription-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          imageId: product.id,
          category: product.category,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = `${product.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDone(true);
        onDownloadComplete(data.remaining);
        trackAnalytics('hd_sub_download', product.id, product.category);
      } else if (res.status === 429) {
        onLimitReached(data.error);
      } else {
        onLimitReached(data.error || 'Download failed. Please try again.');
      }
    } catch {
      onLimitReached('Download failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading || done}
      style={{
        position: 'absolute',
        bottom: '10px', left: '50%',
        transform: 'translateX(-50%)',
        background: done ? '#10b981' : loading ? 'rgba(0,0,0,0.6)' : 'rgba(124,58,237,0.92)',
        color: 'white',
        padding: '0.5rem 1.2rem',
        border: 'none', borderRadius: '8px',
        cursor: done || loading ? 'default' : 'pointer',
        zIndex: 3, fontWeight: 'bold',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
        transition: 'background 0.2s',
      }}
    >
      {done ? '✓ Downloaded' : loading ? 'Preparing...' : '⬇ Download HD'}
    </button>
  );
}

// ─── HD-Only Lightbox ─────────────────────────────────────────────────────────
function HdOnlyLightbox({ imageUrl, productId, onClose, onBuyNow }) {
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleBuy = async () => {
    setBuying(true);
    trackAnalytics('hd_lightbox_buy_clicked', productId, 'hd_only');
    await onBuyNow(productId);
    setBuying(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 300, padding: '1rem',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close preview"
        style={{
          position: 'fixed', top: '1rem', right: '1.25rem',
          background: 'rgba(255,255,255,0.15)',
          border: 'none', color: 'white',
          fontSize: '1.75rem', lineHeight: 1,
          width: '2.5rem', height: '2.5rem',
          borderRadius: '50%', cursor: 'pointer',
          zIndex: 301, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >×</button>
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', lineHeight: 0 }}
      >
        <img
          src={imageUrl}
          alt="HD preview"
          style={{
            maxWidth: '100%', maxHeight: '90vh',
            objectFit: 'contain', borderRadius: '8px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            display: 'block',
          }}
        />
        {/* Resolution banner */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            padding: '5px 10px',
            borderRadius: '8px 8px 0 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <span style={{ color: '#facc15' }}>💎 HD Only</span>
          <span style={{ opacity: 0.6, margin: '0 6px' }}>·</span>
          <span style={{ flex: 1 }}>2912 × 1632 · PNG</span>
          <span style={{ opacity: 0.55, fontSize: '0.65rem' }}>preview only</span>
        </div>
        {/* Watermark overlay — prevents clean right-click save */}
        <div
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '8px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' transform='rotate(-30 150 75)' font-family='Arial,sans-serif' font-size='15' font-weight='bold' fill='rgba(255,255,255,0.22)' letter-spacing='2'%3EStreamBackdrops%3C/text%3E%3C/svg%3E")`,
            backgroundSize: '300px 150px',
            pointerEvents: 'none',
          }}
        />
        {/* Buy button */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.82)',
            borderRadius: '0 0 8px 8px',
            padding: '10px 12px',
          }}
        >
          <button
            onClick={handleBuy}
            disabled={buying}
            style={{
              width: '100%',
              background: '#7c3aed',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: buying ? 'wait' : 'pointer',
              padding: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            {buying ? 'Preparing checkout…' : `Buy HD — $${SINGLE_PRICE}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HD Product Card ───────────────────────────────────────────────────────────
// FIXED: 2026-04-08 16:30 UTC - Added multi-format lookup for cloudinaryUrls
// REASON: cloudinary-urls.json uses different key formats (simple filename vs path-based).
//         Previously only looked for simple filename (e.g., "bookshelves-bright-04"),
//         but the JSON contains path-based keys (e.g., "webp/bookshelves-bright/bookshelves-bright-04").
//         Now tries multiple formats before falling back to constructed URL.
// DO NOT REMOVE or modify the multi-key lookup logic without testing all image types.
function HdProductCard({ product, isSelected, isHovered, isHighlighted, onToggle, onPreview, onHdOnlyPreview, hdOnly, onMouseEnter, onMouseLeave, subscriberMode, subToken, onDownloadComplete, onLimitReached }) {
  const { toggleWishlist, isWishlisted, openDrawer } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const thumb = `https://assets.streambackdrops.com/webp/${product.category}/${product.id.replace('-hd', '')}.webp`;

  const handleWishlist = (e) => {
    e.stopPropagation();
    trackAnalytics(wishlisted ? 'wishlist_remove' : 'wishlist_add', product.id, product.category);
    toggleWishlist({ id: product.id, name: product.name, category: product.category, hdOnly, thumb });
  };

  return (
    // NOTE: data-product-id is required for /hd?highlight scroll behavior
    <div
      data-product-id={product.id}
      style={{
        border: isSelected ? '3px solid #2563eb' : subscriberMode ? '3px solid #7c3aed' : '3px solid gold',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        cursor: subscriberMode ? 'default' : 'pointer',
        boxShadow: isHighlighted
          ? '0 0 0 4px rgba(124, 58, 237, 0.9), 0 0 32px 6px rgba(124, 58, 237, 0.55)'
          : 'none',
        transition: 'box-shadow 0.35s ease',
      }}
      onClick={() => !subscriberMode && onToggle(product.id)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Dark overlay on hover */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.2s',
        zIndex: 1
      }} />

      {isSelected && !subscriberMode && (
        <div style={{
          position: 'absolute',
          top: '10px', right: '10px',
          background: '#2563eb', color: 'white',
          width: '30px', height: '30px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', zIndex: 3
        }}>✓</div>
      )}

      {/* Wishlist heart — top-right when not selected */}
      {!isSelected && (
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            background: wishlisted ? 'rgba(37,99,235,0.9)' : 'rgba(0,0,0,0.45)',
            border: 'none', borderRadius: '50%',
            width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 3,
            fontSize: '0.85rem',
            opacity: isHovered || wishlisted ? 1 : 0,
            transition: 'opacity 0.2s, background 0.15s',
          }}
        >{wishlisted ? '💙' : '🤍'}</button>
      )}

      {/* Exclusive chip — no free version available */}
      {hdOnly && !isSelected && (
        <div style={{
          position: 'absolute',
          top: '10px', left: '10px',
          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          color: 'white',
          fontSize: '0.62rem',
          fontWeight: '700',
          padding: '3px 7px',
          borderRadius: '4px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          zIndex: 3,
          pointerEvents: 'none',
          boxShadow: '0 2px 6px rgba(91,33,182,0.5)',
        }}>
          Exclusive
        </div>
      )}

      {/* Preview button */}
      <button
        onClick={async (e) => {
          e.stopPropagation();
          trackAnalytics(hdOnly ? 'hd_exclusive_preview' : 'hd_preview_opened', product.id, product.category);
          if (hdOnly) {
            // HD-only: show single fullscreen lightbox with the HD image
            try {
              const res = await fetch(`/api/hd-preview-url?imageId=${product.id}`);
              const data = await res.json();
              onHdOnlyPreview({ url: data.url, productId: product.id });
            } catch {
              // fallback to standard webp if HD url fetch fails
              onHdOnlyPreview({ url: `https://assets.streambackdrops.com/webp/${product.category}/${product.id.replace('-hd', '')}.webp`, productId: product.id });
            }
          } else {
            const baseFilename = product.id.replace('-hd', '');
            
            // FIX: Multi-format lookup for cloudinaryUrls (added 2026-04-08)
            // The JSON file contains keys in multiple formats. Try each one.
            let imageUrl = cloudinaryUrls[baseFilename];                           // Format 1: "bookshelves-bright-04"
            
            if (!imageUrl) {
              // Format 2: "webp/bookshelves-bright/bookshelves-bright-04"
              const pathKey = `webp/${product.category}/${baseFilename}`;
              imageUrl = cloudinaryUrls[pathKey];
            }
            
            if (!imageUrl) {
              // Format 3: "bookshelves-bright-04.webp"
              imageUrl = cloudinaryUrls[`${baseFilename}.webp`];
            }
            
            if (!imageUrl) {
              // Format 4: Direct construction as final fallback
              imageUrl = `https://assets.streambackdrops.com/webp/${product.category}/${baseFilename}.webp`;
            }
            // END OF FIX - Do not modify the lookup logic above
            
            if (imageUrl) {
              try {
                const res = await fetch(`/api/hd-preview-url?imageId=${product.id}`);
                const data = await res.json();
                onPreview({
                  id: product.id,
                  standard: imageUrl,
                  hd: data.url
                });
              } catch (error) {
                onPreview({ id: product.id, standard: imageUrl, hd: null });
              }
            }
          }
        }}
        style={{
          position: 'absolute',
          top: subscriberMode ? '10px' : '50%',
          left: '50%',
          transform: subscriberMode ? 'translateX(-50%)' : 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)', color: 'white',
          padding: '0.5rem 1.1rem',
          border: 'none', borderRadius: '8px',
          cursor: 'pointer',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
          zIndex: 2, fontWeight: 'bold',
          whiteSpace: 'nowrap',
          fontSize: '0.85rem',
        }}
      >
        👁️ Preview HD
      </button>

      {/* Subscriber download button */}
      {subscriberMode && isHovered && (
        <SubscriberDownloadButton
          product={product}
          token={subToken}
          onDownloadComplete={onDownloadComplete}
          onLimitReached={onLimitReached}
        />
      )}

      <img
        src={`https://assets.streambackdrops.com/webp/${product.category}/${product.id.replace('-hd', '')}.webp`}
        alt={`${product.name} - Premium HD Virtual Background`}
        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
      />

      {/* Resolution chip — premium differentiation */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        background: 'rgba(17, 24, 39, 0.85)',
        color: 'white',
        fontSize: '0.68rem',
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: '4px',
        letterSpacing: '0.02em',
        zIndex: 2,
        pointerEvents: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        2912 × 1632 · PNG
      </div>
    </div>
  );
}

// ─── Subscription CTA ──────────────────────────────────────────────────────────
function SubscriptionCTA({ onVerifyClick }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    trackAnalytics('sub_cta_click', null, 'subscription');
    try {
      const res = await fetch('/api/create-subscription-checkout', { method: 'POST' });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
      color: 'white',
      borderRadius: '12px',
      padding: '1.5rem 2rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
    }}>
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          💎 Subscribe for $9/month
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          10 HD downloads per month · Downloads reset each billing cycle · Cancel anytime
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            background: 'white', color: '#7c3aed',
            border: 'none', padding: '0.7rem 1.75rem',
            borderRadius: '8px', fontWeight: 'bold',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '0.95rem', whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Loading...' : 'Subscribe Now'}
        </button>
        <button
          onClick={() => { trackAnalytics('hd_verify_sub_click', null, 'subscription'); onVerifyClick(); }}
          style={{
            background: 'transparent', color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '0.65rem 1.2rem',
            borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.85rem', whiteSpace: 'nowrap',
          }}
        >
          Already subscribed?
        </button>
      </div>
    </div>
  );
}

// ─── Verify Email Modal ────────────────────────────────────────────────────────
function VerifyEmailModal({ onClose, onVerified }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/refresh-subscription-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('sb_sub_token', data.token);
        onVerified(data.token);
      } else {
        setError(data.error || 'No active subscription found for this email.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: '1rem',
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white', borderRadius: '12px',
          padding: '2rem', maxWidth: '420px', width: '100%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>Verify your subscription</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Enter the email address you subscribed with to restore access.
        </p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
          placeholder="your@email.com"
          style={{
            width: '100%', padding: '0.75rem 1rem',
            border: '2px solid #e5e7eb', borderRadius: '8px',
            fontSize: '1rem', marginBottom: '0.75rem',
            boxSizing: 'border-box',
          }}
        />
        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}
        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            width: '100%', background: '#7c3aed', color: 'white',
            border: 'none', padding: '0.75rem',
            borderRadius: '8px', fontWeight: 'bold',
            cursor: loading ? 'default' : 'pointer', fontSize: '1rem',
          }}
        >
          {loading ? 'Verifying...' : 'Verify Subscription'}
        </button>
      </div>
    </div>
  );
}

// (State machine replaced with simple useState in main component)

// ─── Focus Hero ────────────────────────────────────────────────────────────────
function FocusHero({ product, hdOnly, buying, onBuy, onDismiss }) {
  if (!product) return null;
  const thumb = `https://assets.streambackdrops.com/webp/${product.category}/${product.id.replace('-hd', '')}.webp`;

  return (
    <section style={{
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: '2rem 1.5rem 2.25rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)',
        gap: '2rem',
        alignItems: 'start',
      }}
      className="hd-focus-hero-grid"
      >
        <div style={{ position: 'relative', lineHeight: 0 }}>
          <button
            onClick={onDismiss}
            aria-label="Back to browsing"
            style={{
              position: 'absolute', top: '0.6rem', right: '0.6rem', zIndex: 5,
              background: 'rgba(0,0,0,0.65)', border: 'none', color: 'white',
              width: '2rem', height: '2rem', borderRadius: '50%',
              cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
          <img
            src={thumb}
            alt={product.name}
            style={{
              width: '100%',
              aspectRatio: '16/9',
              objectFit: 'cover',
              borderRadius: '14px',
              border: '3px solid #7c3aed',
              boxShadow: '0 24px 64px rgba(124,58,237,0.35), 0 8px 20px rgba(0,0,0,0.4)',
              display: 'block',
            }}
          />
          {hdOnly && (
            <div style={{
              position: 'absolute', top: '0.9rem', left: '0.9rem',
              background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
              color: 'white',
              fontSize: '0.7rem', fontWeight: 700,
              padding: '0.28rem 0.65rem', borderRadius: '4px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              boxShadow: '0 2px 6px rgba(91,33,182,0.5)',
            }}>
              Exclusive
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: '0.9rem', left: '0.9rem',
            background: 'rgba(17, 24, 39, 0.85)',
            color: 'white',
            fontSize: '0.7rem', fontWeight: 600,
            padding: '0.22rem 0.6rem', borderRadius: '4px',
            letterSpacing: '0.02em',
          }}>
            2912 × 1632 · PNG
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.65 }}>
            Selected
          </div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
            {product.name}
          </h2>
          <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>
            Instant download · 2912 × 1632 PNG
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.25rem' }}>
            Each image is purchased individually in full resolution.
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <button
              onClick={onBuy}
              disabled={buying}
              style={{
                background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                color: 'white', border: 'none',
                padding: '1rem 1.25rem', borderRadius: '10px',
                fontSize: '1.05rem', fontWeight: 700,
                cursor: buying ? 'wait' : 'pointer',
                boxShadow: '0 10px 25px rgba(124,58,237,0.4)',
                transition: 'transform 0.12s ease',
                width: '100%',
              }}
            >
              {buying ? 'Preparing checkout…' : `Buy HD — $${SINGLE_PRICE}`}
            </button>
            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.6rem', textAlign: 'center' }}>
              Click Buy Now to continue to secure checkout
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 720px) {
          :global(.hd-focus-hero-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

// ─── Checkout Transition Overlay ──────────────────────────────────────────────
function CheckoutOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1rem',
        zIndex: 500, color: 'white',
      }}
    >
      <div
        style={{
          width: '3rem', height: '3rem',
          border: '3px solid rgba(255,255,255,0.25)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'hdCheckoutSpin 0.8s linear infinite',
        }}
      />
      <div style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '0.02em' }}>
        Redirecting to secure checkout…
      </div>
      <style>{`@keyframes hdCheckoutSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Products ─────────────────────────────────────────────────────────────────
const products = [
  // HD Products
  // Bookshelves Bright
  { id: 'bookshelves-bright-01-hd', name: 'Bright Bookshelf #1', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-02-hd', name: 'Bright Bookshelf #2', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-04-hd', name: 'Bright Bookshelf #4', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-06-hd', name: 'Bright Bookshelf #6', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-07-hd', name: 'Bright Bookshelf #7', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-10-hd', name: 'Bright Bookshelf #10', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-11-hd', name: 'Bright Bookshelf #11', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-13-hd', name: 'Bright Bookshelf #13', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-19-hd', name: 'Bright Bookshelf #19', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-20-hd', name: 'Bright Bookshelf #20', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-23-hd', name: 'Bright Bookshelf #23', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-42-hd', name: 'Bright Bookshelf #42', category: 'bookshelves-bright' },
  // Bookshelves Dark
  { id: 'bookshelves-dark-02-hd', name: 'Dark Bookshelf #2', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-06-hd', name: 'Dark Bookshelf #6', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-07-hd', name: 'Dark Bookshelf #7', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-08-hd', name: 'Dark Bookshelf #8', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-09-hd', name: 'Dark Bookshelf #9', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-23-hd', name: 'Dark Bookshelf #23', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-25-hd', name: 'Dark Bookshelf #25', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-27-hd', name: 'Dark Bookshelf #27', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-28-hd', name: 'Dark Bookshelf #28', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-37-hd', name: 'Dark Bookshelf #37', category: 'bookshelves-dark' },
  // Wall Shelves Bright
  { id: 'wall-shelves-bright-01-hd', name: 'Bright Wall Shelf #1', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-02-hd', name: 'Bright Wall Shelf #2', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-03-hd', name: 'Bright Wall Shelf #3', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-05-hd', name: 'Bright Wall Shelf #5', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-10-hd', name: 'Bright Wall Shelf #10', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-13-hd', name: 'Bright Wall Shelf #13', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-16-hd', name: 'Bright Wall Shelf #16', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-17-hd', name: 'Bright Wall Shelf #17', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-28-hd', name: 'Bright Wall Shelf #28', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-54-hd', name: 'Bright Wall Shelf #54', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-20-hd', name: 'Bright Wall Shelf #20', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-29-hd', name: 'Bright Wall Shelf #29', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-49-hd', name: 'Bright Wall Shelf #49', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-51-hd', name: 'Bright Wall Shelf #51', category: 'wall-shelves-bright' },
  // Wall Shelves Dark
  { id: 'wall-shelves-dark-01-hd', name: 'Dark Wall Shelf #1', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-02-hd', name: 'Dark Wall Shelf #2', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-04-hd', name: 'Dark Wall Shelf #4', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-06-hd', name: 'Dark Wall Shelf #6', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-17-hd', name: 'Dark Wall Shelf #17', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-19-hd', name: 'Dark Wall Shelf #19', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-28-hd', name: 'Dark Wall Shelf #28', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-29-hd', name: 'Dark Wall Shelf #29', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-34-hd', name: 'Dark Wall Shelf #34', category: 'wall-shelves-dark' },
  // Coffee Shops
  { id: 'coffee-shop-03-hd', name: 'Coffee Shop #3', category: 'coffee-shops' },
  { id: 'coffee-shop-04-hd', name: 'Coffee Shop #4', category: 'coffee-shops' },
  { id: 'coffee-shop-10-hd', name: 'Coffee Shop #10', category: 'coffee-shops' },
  { id: 'coffee-shop-12-hd', name: 'Coffee Shop #12', category: 'coffee-shops' },
  { id: 'coffee-shop-19-hd', name: 'Coffee Shop #19', category: 'coffee-shops' },
  // Conference Rooms
  { id: 'conference-room-01-hd', name: 'Conference Room #1', category: 'conference-rooms' },
  { id: 'conference-room-02-hd', name: 'Conference Room #2', category: 'conference-rooms' },
  { id: 'conference-room-04-hd', name: 'Conference Room #4', category: 'conference-rooms' },
  { id: 'conference-room-05-hd', name: 'Conference Room #5', category: 'conference-rooms' },
  { id: 'conference-room-06-hd', name: 'Conference Room #6', category: 'conference-rooms' },
  // Libraries
  { id: 'library-17-hd', name: 'Library #17', category: 'libraries' },
  { id: 'library-33-hd', name: 'Library #33', category: 'libraries' },
  { id: 'library-34-hd', name: 'Library #34', category: 'libraries' },
  // Urban Lofts
  { id: 'urban-loft-10-hd', name: 'Urban Loft #10', category: 'urban-lofts' },
  { id: 'urban-loft-18-hd', name: 'Urban Loft #18', category: 'urban-lofts' },
  { id: 'urban-loft-20-hd', name: 'Urban Loft #20', category: 'urban-lofts' },
  { id: 'urban-loft-26-hd', name: 'Urban Loft #26', category: 'urban-lofts' },
  { id: 'urban-loft-28-hd', name: 'Urban Loft #28', category: 'urban-lofts' },
  // Office Spaces
  { id: 'office-spaces-01-hd', name: 'Office Space #1', category: 'office-spaces' },
  { id: 'office-spaces-02-hd', name: 'Office Space #2', category: 'office-spaces' },
  { id: 'office-spaces-08-hd', name: 'Office Space #8', category: 'office-spaces' },
  { id: 'office-spaces-19-hd', name: 'Office Space #19', category: 'office-spaces' },
  { id: 'office-spaces-20-hd', name: 'Office Space #20', category: 'office-spaces' },
  { id: 'office-spaces-28-hd', name: 'Office Space #28', category: 'office-spaces' },
  { id: 'office-spaces-33-hd', name: 'Office Space #33', category: 'office-spaces' },
  { id: 'office-spaces-35-hd', name: 'Office Space #35', category: 'office-spaces' },
  { id: 'office-spaces-36-hd', name: 'Office Space #36', category: 'office-spaces' },
  { id: 'office-spaces-38-hd', name: 'Office Space #38', category: 'office-spaces' },
  { id: 'office-spaces-43-hd', name: 'Office Space #43', category: 'office-spaces' },
  { id: 'office-spaces-59-hd', name: 'Office Space #59', category: 'office-spaces' },
  { id: 'office-spaces-62-hd', name: 'Office Space #62', category: 'office-spaces' },
  { id: 'office-spaces-63-hd', name: 'Office Space #63', category: 'office-spaces' },
  { id: 'office-spaces-66-hd', name: 'Office Space #66', category: 'office-spaces' },
  { id: 'office-spaces-69-hd', name: 'Office Space #69', category: 'office-spaces' },
  { id: 'office-spaces-71-hd', name: 'Office Space #71', category: 'office-spaces' },
  // Home Offices
  { id: 'home-offices-01-hd', name: 'Home Office #1', category: 'home-office' },
  { id: 'home-offices-03-hd', name: 'Home Office #3', category: 'home-office' },
  { id: 'home-offices-20-hd', name: 'Home Office #20', category: 'home-office' },
  { id: 'home-offices-04-hd', name: 'Home Office #4', category: 'home-office' },
  { id: 'home-offices-05-hd', name: 'Home Office #5', category: 'home-office' },
  { id: 'home-offices-07-hd', name: 'Home Office #7', category: 'home-office' },
  { id: 'home-offices-08-hd', name: 'Home Office #8', category: 'home-office' },
  { id: 'home-offices-13-hd', name: 'Home Office #13', category: 'home-office' },
  { id: 'home-offices-14-hd', name: 'Home Office #14', category: 'home-office' },
  { id: 'home-offices-17-hd', name: 'Home Office #17', category: 'home-office' },
  { id: 'home-offices-22-hd', name: 'Home Office #22', category: 'home-office' },
  { id: 'home-offices-23-hd', name: 'Home Office #23', category: 'home-office' },
  { id: 'home-offices-28-hd', name: 'Home Office #28', category: 'home-office' },
  { id: 'home-offices-29-hd', name: 'Home Office #29', category: 'home-office' },
  { id: 'home-offices-30-hd', name: 'Home Office #30', category: 'home-office' },
  { id: 'home-offices-31-hd', name: 'Home Office #31', category: 'home-office' },
  { id: 'home-offices-48-hd', name: 'Home Office #48', category: 'home-office' },
  { id: 'home-offices-61-hd', name: 'Home Office #61', category: 'home-office' },
  { id: 'home-offices-69-hd', name: 'Home Office #69', category: 'home-office' },
  { id: 'home-offices-74-hd', name: 'Home Office #74', category: 'home-office' },
  // Nature Landscapes
  { id: 'nature-landscape-10-hd', name: 'Nature Landscape #10', category: 'nature-landscapes' },
  { id: 'nature-landscape-11-hd', name: 'Nature Landscape #11', category: 'nature-landscapes' },
  { id: 'nature-landscape-14-hd', name: 'Nature Landscape #14', category: 'nature-landscapes' },
  { id: 'nature-landscape-18-hd', name: 'Nature Landscape #18', category: 'nature-landscapes' },
  { id: 'nature-landscape-19-hd', name: 'Nature Landscape #19', category: 'nature-landscapes' },
  { id: 'nature-landscape-20-hd', name: 'Nature Landscape #20', category: 'nature-landscapes' },
  { id: 'nature-landscape-21-hd', name: 'Nature Landscape #21', category: 'nature-landscapes' },
  { id: 'nature-landscape-22-hd', name: 'Nature Landscape #22', category: 'nature-landscapes' },
  { id: 'nature-landscape-30-hd', name: 'Nature Landscape #30', category: 'nature-landscapes' },
  { id: 'nature-landscape-46-hd', name: 'Nature Landscape #46', category: 'nature-landscapes' },
  { id: 'nature-landscape-98-hd', name: 'Nature Landscape #98', category: 'nature-landscapes' },
  { id: 'nature-landscape-99-hd', name: 'Nature Landscape #99', category: 'nature-landscapes' },
  // Living Rooms
  { id: 'living-room-08-hd', name: 'Living Room #8', category: 'living-rooms' },
  { id: 'living-room-10-hd', name: 'Living Room #10', category: 'living-rooms' },
  { id: 'living-room-11-hd', name: 'Living Room #11', category: 'living-rooms' },
  { id: 'living-room-14-hd', name: 'Living Room #14', category: 'living-rooms' },
  { id: 'living-room-17-hd', name: 'Living Room #17', category: 'living-rooms' },
  { id: 'living-room-27-hd', name: 'Living Room #27', category: 'living-rooms' },
  { id: 'living-room-41-hd', name: 'Living Room #41', category: 'living-rooms' },
  { id: 'living-room-46-hd', name: 'Living Room #46', category: 'living-rooms' },
  // Kitchens
  { id: 'kitchen-04-hd', name: 'Kitchen #4', category: 'kitchens' },
  { id: 'kitchen-05-hd', name: 'Kitchen #5', category: 'kitchens' },
  { id: 'kitchen-06-hd', name: 'Kitchen #6', category: 'kitchens' },
  { id: 'kitchen-14-hd', name: 'Kitchen #14', category: 'kitchens' },
  { id: 'kitchen-15-hd', name: 'Kitchen #15', category: 'kitchens' },
  { id: 'kitchen-16-hd', name: 'Kitchen #16', category: 'kitchens' },
  // Gardens & Patios
  { id: 'garden-patio-01-hd', name: 'Garden & Patio #1', category: 'gardens-patios' },
  { id: 'garden-patio-12-hd', name: 'Garden & Patio #12', category: 'gardens-patios' },
  { id: 'garden-patio-14-hd', name: 'Garden & Patio #14', category: 'gardens-patios' },
  // Christmas
  { id: 'christmas-background-35-hd', name: 'Christmas #35', category: 'christmas-backgrounds' },
  // Easter
  { id: 'easter-background-03-hd', name: 'Easter #3', category: 'easter-backgrounds' },
  { id: 'easter-background-04-hd', name: 'Easter #4', category: 'easter-backgrounds' },
  { id: 'easter-background-21-hd', name: 'Easter #21', category: 'easter-backgrounds' },
  { id: 'easter-background-32-hd', name: 'Easter #32', category: 'easter-backgrounds' },
  { id: 'easter-background-35-hd', name: 'Easter #35', category: 'easter-backgrounds' },
  { id: 'easter-background-39-hd', name: 'Easter #39', category: 'easter-backgrounds' },
  { id: 'easter-background-42-hd', name: 'Easter #42', category: 'easter-backgrounds' },
  { id: 'easter-background-48-hd', name: 'Easter #48', category: 'easter-backgrounds' },
  { id: 'easter-background-49-hd', name: 'Easter #49', category: 'easter-backgrounds' },
  { id: 'easter-background-56-hd', name: 'Easter #56', category: 'easter-backgrounds' },
  { id: 'easter-background-57-hd', name: 'Easter #57', category: 'easter-backgrounds' },
  { id: 'easter-background-61-hd', name: 'Easter #61', category: 'easter-backgrounds' },
  { id: 'easter-background-66-hd', name: 'Easter #66', category: 'easter-backgrounds' },
  { id: 'easter-background-72-hd', name: 'Easter #72', category: 'easter-backgrounds' },
  { id: 'easter-background-74-hd', name: 'Easter #74', category: 'easter-backgrounds' },
  { id: 'easter-background-75-hd', name: 'Easter #75', category: 'easter-backgrounds' },
  { id: 'easter-background-88-hd', name: 'Easter #88', category: 'easter-backgrounds' },
  { id: 'easter-background-91-hd', name: 'Easter #91', category: 'easter-backgrounds' },
  { id: 'easter-background-92-hd', name: 'Easter #92', category: 'easter-backgrounds' },
  { id: 'easter-background-93-hd', name: 'Easter #93', category: 'easter-backgrounds' },
  { id: 'easter-background-99-hd', name: 'Easter #99', category: 'easter-backgrounds' },
  { id: 'easter-background-101-hd', name: 'Easter #101', category: 'easter-backgrounds' },
];

// Maps display filter keys to one or more product category values
const CATEGORY_GROUPS = {
  'bookshelves': ['bookshelves-bright', 'bookshelves-dark'],
  'wall-shelves': ['wall-shelves-bright', 'wall-shelves-dark'],
};

const CATEGORY_LABELS = {
  'bookshelves': 'Bookshelves',
  'wall-shelves': 'Wall Shelves',
  'office-spaces': 'Office Spaces',
  'home-office': 'Home Offices',
  'coffee-shops': 'Coffee Shops',
  'conference-rooms': 'Conference Rooms',
  'libraries': 'Libraries',
  'urban-lofts': 'Urban Lofts',
  'nature-landscapes': 'Nature',
  'living-rooms': 'Living Rooms',
  'kitchens': 'Kitchens',
  'gardens-patios': 'Gardens & Patios',
  'christmas-backgrounds': 'Christmas',
  'easter-backgrounds': 'Easter',
};

const CATEGORIES = ['all', ...Object.keys(CATEGORY_LABELS).filter(cat => {
  const group = CATEGORY_GROUPS[cat];
  return group
    ? products.some(p => group.includes(p.category))
    : products.some(p => p.category === cat);
})];

// ─── Highlight → Product Resolver ─────────────────────────────────────────────
// Category pages link to /hd?highlight=<baseId>; individual image pages use
// /hd?product=<baseId>-hd. The param may or may not carry a -hd suffix and
// may carry a file extension. HD_BASE_IDS (used on category pages) can also
// contain IDs that don't have a corresponding product entry — those must not
// crash the hero. Match permissively, return null only if nothing matches.
function findProductByHighlight(rawHighlight, productList) {
  if (rawHighlight == null) return null;
  const raw = String(rawHighlight).trim();
  if (!raw) return null;

  const stripped = raw
    .replace(/\.(webp|png|jpe?g)$/i, '')
    .replace(/-hd$/i, '');

  const candidates = [
    `${stripped}-hd`,
    stripped,
    raw,
    raw.replace(/\.(webp|png|jpe?g)$/i, ''),
  ];
  for (const cand of candidates) {
    const match = productList.find(p => p.id === cand);
    if (match) return match;
  }

  const norm = s => String(s).replace(/[-_\s]/g, '').toLowerCase();
  const target = norm(stripped);
  const fuzzy = productList.find(p => norm(p.id.replace(/-hd$/, '')) === target);
  return fuzzy || null;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Premium({ reviewsData }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [hdOnlyPreview, setHdOnlyPreview] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [highlightMissError, setHighlightMissError] = useState(null);
  const heroRef = useRef(null);
  const selectedProduct = useMemo(
    () => (selectedId ? products.find(p => p.id === selectedId) : null),
    [selectedId]
  );

  // Pre-select category from URL param (e.g. ?category=easter-backgrounds)
  useEffect(() => {
    if (router.isReady && router.query.category) {
      const cat = router.query.category;
      // Handle legacy bright/dark sub-category params
      const legacyMap = {
        'bookshelves-bright': 'bookshelves',
        'bookshelves-dark': 'bookshelves',
        'wall-shelves-bright': 'wall-shelves',
        'wall-shelves-dark': 'wall-shelves',
      };
      const resolved = legacyMap[cat] || cat;
      if (CATEGORIES.includes(resolved)) {
        setActiveCategory(resolved);
      }
    }
  }, [router.isReady, router.query.category]);

  // Show sticky bar when hero scrolls out of view
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // When ?highlight=<baseId> (or legacy ?product=<baseId>-hd) arrives, resolve
  // it to a product via findProductByHighlight and dispatch FOCUS.
  // Missing matches surface a visible notice instead of failing silently.
  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query.highlight ?? router.query.product;
    if (!raw) {
      setHighlightMissError(null);
      return;
    }

    const product = findProductByHighlight(raw, products);
    if (!product) {
      if (typeof console !== 'undefined') {
        console.warn('[hd] highlight did not match any product:', raw);
      }
      setHighlightMissError(String(raw));
      trackAnalytics('hd_highlight_miss', String(raw), 'hd');
      return;
    }

    setHighlightMissError(null);
    setSelectedId(product.id);
    trackAnalytics('hd_focus_entered', product.id, product.category);

    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(rafId);
  }, [router.isReady, router.query.highlight, router.query.product]);

  // Subscription state
  const [subStatus, setSubStatus] = useState(null); // null | { valid, email, remaining, downloadsThisMonth }
  const [subToken, setSubToken] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');

  // Check for subscription token on mount
  useEffect(() => {
    const token = localStorage.getItem('sb_sub_token');
    if (!token) return;
    setSubToken(token);

    fetch('/api/verify-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setSubStatus(data);
        } else {
          // Token invalid/expired — clear it
          localStorage.removeItem('sb_sub_token');
          setSubToken(null);
        }
      })
      .catch(() => {});
  }, []);

  const handleDownloadComplete = (remaining) => {
    setSubStatus(prev => prev ? { ...prev, remaining, downloadsThisMonth: 10 - remaining } : prev);
  };

  const handleVerified = (token) => {
    setSubToken(token);
    setShowVerifyModal(false);
    fetch('/api/verify-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => { if (data.valid) setSubStatus(data); })
      .catch(() => {});
  };

  const handleBuy = async (productId) => {
    const pid = productId || selectedId;
    if (!pid) return;
    const product = products.find(p => p.id === pid);
    trackAnalytics('hd_single_buy_clicked', pid, product?.category);
    setCheckingOut(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: SINGLE_PRICE_ID, productId: pid }),
      });
      const data = await res.json();
      if (!data.url) {
        setCheckingOut(false);
        alert(data.error || 'Checkout failed — no URL returned');
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckingOut(false);
    }
  };

  const handleHdOnlyBuy = async (productId) => {
    setHdOnlyPreview(null);
    await handleBuy(productId);
  };

  const handleCardClick = (id) => {
    setSelectedId(id);
    trackAnalytics('hd_focus_entered', id, 'grid_click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSubscriber = subStatus?.valid;
  const filteredProducts = products.filter(p => {
    if (activeCategory === 'all') return true;
    const group = CATEGORY_GROUPS[activeCategory];
    return group ? group.includes(p.category) : p.category === activeCategory;
  });

  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| StreamBackdrops" or any other suffix.
  // Do not flag these as too short — they are intentionally optimised for SEO character limits.
  return (
    <Layout
      title="Premium HD Virtual Backgrounds | 2912×1632 | StreamBackdrops"
      description="Professional HD virtual backgrounds in stunning 2912×1632 resolution. Perfect for Zoom, Teams, and Google Meet. 2x sharper than standard backgrounds."
      canonical="https://streambackdrops.com/hd"
      keywords="HD virtual backgrounds, high resolution backgrounds, premium zoom backgrounds, professional video call backgrounds, high definition virtual backgrounds"
      image="https://assets.streambackdrops.com/webp/bookshelves-dark/bookshelves-dark-09.webp"
    >
      <Head>
        {router.query.category && <meta name="robots" content="noindex, follow" />}
        <BreadcrumbSchema items={[
          { name: "Home", url: "https://streambackdrops.com" },
          { name: "Premium HD Backgrounds", url: "https://streambackdrops.com/hd" }
        ]} />
        <ProductSchema products={products} reviewsData={reviewsData} />
        <ComparisonWidgetSchema />
        <HdFaqSchema />
      </Head>

      {/* Focus Hero — shown when an image is selected */}
      {!isSubscriber && selectedProduct && (
        <FocusHero
          product={selectedProduct}
          hdOnly={isHdOnly(selectedProduct.id)}
          buying={checkingOut}
          onBuy={() => handleBuy()}
          onDismiss={() => {
            trackAnalytics('hd_focus_dismissed', selectedProduct.id, selectedProduct.category);
            setSelectedId(null);
          }}
        />
      )}

      {/* Hero */}
      <section ref={heroRef} style={{
        padding: '2.5rem 2rem 3rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.14)',
          padding: '0.3rem 0.85rem',
          borderRadius: '999px',
          marginBottom: '0.9rem',
        }}>
          2912 × 1632 · PNG
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.6rem', fontWeight: '700', lineHeight: 1.15 }}>
          HD Virtual Backgrounds
        </h1>
        <p style={{
          fontSize: '1.1rem',
          maxWidth: '640px',
          margin: '0 auto 1.75rem',
          lineHeight: 1.55,
          opacity: 0.94,
        }}>
          Razor-sharp detail and true color depth — roughly 3× the effective resolution of standard
          webcam backgrounds. Built for 4K monitors, TVs, and projectors where quality shows.
        </p>

        {isSubscriber ? (
          /* ── Subscriber badge ── */
          <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '1rem 1.5rem', borderRadius: '8px',
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                💎 Subscriber — {subStatus.remaining} of 10 downloads remaining this month
              </div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.4rem', opacity: 0.9 }}>
                Hover over any image and click ⬇ Download HD · {subStatus.email}
              </div>
            </div>
            {limitMessage && (
              <div style={{
                marginTop: '0.6rem',
                background: 'rgba(251,146,60,0.92)',
                color: 'white',
                borderRadius: '8px',
                padding: '0.7rem 1.2rem',
                fontSize: '0.95rem',
                fontWeight: '500',
              }}>
                ⚠️ {limitMessage}
              </div>
            )}
          </div>
        ) : (
          /* ── Single-select prompt ── */
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '1.25rem 1.5rem', borderRadius: '12px',
            display: 'inline-block', marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Select an image to purchase in HD
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>
              Each image is purchased individually · ${SINGLE_PRICE} per image
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '2rem', color: 'white' }}>
          Hover over images to preview HD quality with our comparison slider
        </p>
      </section>

      {/* Free backgrounds link */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white', padding: '1.25rem 2rem',
        textAlign: 'center', margin: '0 auto',
        maxWidth: '800px', borderRadius: '0.75rem',
        marginTop: '-1.5rem', marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
      }}>
        <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: '500' }}>
          Not ready for HD?{' '}
          <a
            href="/#categories"
            onClick={() => trackAnalytics('hd_free_link_clicked', null, 'hd')}
            style={{ color: 'white', fontWeight: 'bold', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Browse {TOTAL_IMAGES_FORMATTED} free backgrounds instead →
          </a>
        </p>
      </div>

      <section style={{ padding: '2rem 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Subscription CTA — above the grid for non-subscribers */}
        {!isSubscriber && (
          <SubscriptionCTA onVerifyClick={() => setShowVerifyModal(true)} />
        )}

        {/* Highlight miss notice — shown when ?highlight= didn't match any HD product */}
        {highlightMissError && !selectedProduct && (
          <div
            role="status"
            style={{
              margin: '0 0 1.25rem',
              padding: '0.85rem 1.1rem',
              background: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '10px',
              color: '#78350f',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <span>
              This image isn&rsquo;t available in HD yet — browse available HD images below.
            </span>
            <button
              onClick={() => setHighlightMissError(null)}
              style={{
                background: 'transparent',
                border: '1px solid #b45309',
                color: '#78350f',
                borderRadius: '6px',
                padding: '0.3rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Category filter buttons */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
          marginBottom: '2rem', justifyContent: 'center'
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { trackAnalytics('hd_category_filter', cat, 'hd'); setActiveCategory(cat); }}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '999px',
                border: '2px solid',
                borderColor: activeCategory === cat ? '#7c3aed' : '#e5e7eb',
                background: activeCategory === cat ? '#7c3aed' : 'white',
                color: activeCategory === cat ? 'white' : '#374151',
                fontWeight: activeCategory === cat ? '600' : '400',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Image grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
          gap: '1.5rem',
          opacity: selectedId ? 0.75 : 1,
          transition: 'opacity 0.25s ease',
        }}>
          {filteredProducts.map(product => (
            <HdProductCard
              key={product.id}
              product={product}
              isSelected={selectedId === product.id}
              isHovered={hoveredProduct === product.id}
              isHighlighted={false}
              onToggle={handleCardClick}
              onPreview={setPreviewImage}
              onHdOnlyPreview={setHdOnlyPreview}
              hdOnly={isHdOnly(product.id)}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              subscriberMode={isSubscriber}
              subToken={subToken}
              onDownloadComplete={handleDownloadComplete}
              onLimitReached={setLimitMessage}
            />
          ))}
        </div>
      </section>

      {/* Comparison widget — standard images */}

      <ComparisonWidget
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        standardImg={previewImage?.standard}
        hdImg={previewImage?.hd}
        imageId={previewImage?.id}
      />

      {/* Fullscreen lightbox — HD-only images */}
      {hdOnlyPreview && (
        <HdOnlyLightbox
          imageUrl={hdOnlyPreview.url}
          productId={hdOnlyPreview.productId}
          onClose={() => setHdOnlyPreview(null)}
          onBuyNow={handleHdOnlyBuy}
        />
      )}

      {/* Verify email modal */}
      {showVerifyModal && (
        <VerifyEmailModal
          onClose={() => setShowVerifyModal(false)}
          onVerified={handleVerified}
        />
      )}

      {/* Full-screen checkout redirect overlay */}
      <CheckoutOverlay visible={checkingOut} />
    </Layout>
  );
}

export async function getStaticProps() {
  const reviewsData = await getReviewsData();
  return { props: { reviewsData }, revalidate: 3600 };
}
