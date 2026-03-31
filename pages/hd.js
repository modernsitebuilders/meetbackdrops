import Head from 'next/head';
import BreadcrumbSchema from '../components/BreadcrumbSchema';
import ComparisonWidgetSchema from '../components/ComparisonWidgetSchema';
import HdFaqSchema from '../components/HdFaqSchema';
import ProductSchema from '../components/ProductSchema';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';
import ComparisonWidget from '../components/ComparisonWidget';
import { loadStripe } from '@stripe/stripe-js';
import { getReviewsData } from '../lib/reviews';
import cloudinaryUrls from '../cloudinary-urls.json';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';
import allImageMetadata from '../public/data/image-metadata-complete.json';
import { useWishlist } from '../lib/WishlistContext';

// Build a set of filenames that are HD-only (no free version)
const hdOnlyFilenames = new Set(
  allImageMetadata.filter(img => img.hdOnly).map(img => img.filename)
);
function isHdOnly(productId) {
  return hdOnlyFilenames.has(productId.replace(/-hd$/, '') + '.webp');
}

const PRICE_IDS = {
  1:  'price_1Sr4U0Q695ongkMjxUtnf9NA',
  2:  'price_1Sr4VEQ695ongkMjkaclxw67',
  3:  'price_1Sr4WYQ695ongkMjRUTPsoIr',
  5:  'price_1TDoudQ695ongkMj0hGBVZfc',
  10: 'price_1TDovCQ695ongkMjnZptC1zz',
  20: 'price_1TDowHQ695ongkMjwk1xZFAO',
};

const PACK_OPTIONS = [
  { size: 1,  price: 4.99,  savings: null },
  { size: 2,  price: 6.99,  savings: 30 },
  { size: 3,  price: 8.99,  savings: 40 },
  { size: 5,  price: 12.99, savings: 48 },
  { size: 10, price: 22.99, savings: 54 },
  { size: 20, price: 39.99, savings: 60 },
];

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
const HD_ONLY_TIERS = [
  { size: 1,  price: 4.99,  savings: null,  label: '1 image' },
  { size: 3,  price: 8.99,  savings: 40,    label: '3 images' },
  { size: 5,  price: 12.99, savings: 48,    label: '5 images', best: true },
  { size: 10, price: 22.99, savings: 54,    label: '10 images' },
];

function HdOnlyLightbox({ imageUrl, productId, onClose, onBuyNow }) {
  const [buying, setBuying] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleTier = async (size) => {
    setBuying(size);
    trackAnalytics('hd_lightbox_tier_selected', productId, String(size));
    await onBuyNow(productId, size);
    setBuying(null);
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
        {/* Pricing tier strip */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.82)',
            borderRadius: '0 0 8px 8px',
            padding: '10px 12px',
            display: 'flex', gap: '8px', alignItems: 'stretch',
          }}
        >
          {HD_ONLY_TIERS.map(tier => (
            <button
              key={tier.size}
              onClick={() => handleTier(tier.size)}
              disabled={buying !== null}
              style={{
                flex: 1,
                background: tier.best ? '#2563eb' : 'rgba(255,255,255,0.1)',
                border: tier.best ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.18)',
                borderRadius: '6px',
                color: 'white',
                cursor: buying !== null ? 'wait' : 'pointer',
                padding: '7px 4px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                transition: 'background 0.15s',
                position: 'relative',
              }}
            >
              {tier.best && (
                <span style={{
                  position: 'absolute', top: '-9px',
                  background: '#facc15', color: '#000',
                  fontSize: '0.55rem', fontWeight: 700,
                  padding: '1px 6px', borderRadius: '99px',
                  letterSpacing: '0.04em', whiteSpace: 'nowrap',
                }}>BEST VALUE</span>
              )}
              <span style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.9 }}>
                {buying === tier.size ? '...' : tier.label}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                ${tier.price}
              </span>
              {tier.savings && (
                <span style={{ fontSize: '0.6rem', opacity: 0.65 }}>save {tier.savings}%</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HD Product Card ───────────────────────────────────────────────────────────
function HdProductCard({ product, isSelected, isHovered, onToggle, onPreview, onHdOnlyPreview, hdOnly, onMouseEnter, onMouseLeave, subscriberMode, subToken, onDownloadComplete, onLimitReached }) {
  const { toggleWishlist, isWishlisted, openDrawer } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const thumb = `https://res.cloudinary.com/dnhju6mhg/image/upload/f_auto,q_auto/webp/${product.category}/${product.id.replace('-hd', '')}.webp`;

  const handleWishlist = (e) => {
    e.stopPropagation();
    trackAnalytics(wishlisted ? 'wishlist_remove' : 'wishlist_add', product.id, product.category);
    toggleWishlist({ id: product.id, name: product.name, category: product.category, hdOnly, thumb });
  };

  return (
    <div
      style={{
        border: isSelected ? '3px solid #2563eb' : subscriberMode ? '3px solid #7c3aed' : '3px solid gold',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        cursor: subscriberMode ? 'default' : 'pointer'
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
              onHdOnlyPreview({ url: `https://res.cloudinary.com/dnhju6mhg/image/upload/f_auto,q_auto/webp/${product.category}/${product.id.replace('-hd', '')}.webp`, productId: product.id });
            }
          } else {
            const baseFilename = product.id.replace('-hd', '');
            const imageUrl = cloudinaryUrls[baseFilename];
            if (imageUrl) {
              try {
                const res = await fetch(`/api/hd-preview-url?imageId=${product.id}`);
                const data = await res.json();
                onPreview({
                  id: product.id,
                  standard: imageUrl,
                  hd: data.url
                });
              } catch {
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
        src={`https://res.cloudinary.com/dnhju6mhg/image/upload/f_auto,q_auto/webp/${product.category}/${product.id.replace('-hd', '')}.webp`}
        alt={`${product.name} - Premium HD Virtual Background`}
        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

// ─── Sticky Pack Bar ───────────────────────────────────────────────────────────
function StickyPackBar({ packSize, selected, onSelect, onChangePack, visible }) {
  const isFull = packSize && selected.length === packSize;
  const packOption = packSize ? PACK_OPTIONS.find(o => o.size === packSize) : null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 200,
      background: 'linear-gradient(135deg, #4c1d95, #3730a3)',
      color: 'white',
      padding: '0.5rem 1rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.4rem',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      transform: visible ? 'translateY(0)' : 'translateY(-110%)',
      transition: 'transform 0.25s ease',
    }}>
      {!packSize ? (
        <>
          <span style={{ fontSize: '0.8rem', opacity: 0.8, marginRight: '0.25rem', whiteSpace: 'nowrap' }}>
            Choose a pack:
          </span>
          {PACK_OPTIONS.map(opt => (
            <button
              key={opt.size}
              onClick={() => { trackAnalytics('hd_pack_selected', String(opt.size), 'sticky_bar'); onSelect(opt.size); }}
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s',
              }}
            >
              {opt.size} · ${opt.price}
            </button>
          ))}
        </>
      ) : (
        <>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
            {isFull ? `✓ All ${packSize} selected` : `${selected.length} of ${packSize} selected`}
            {' · '}${packOption.price}
          </span>
          {!isFull && (
            <span style={{ fontSize: '0.8rem', opacity: 0.75, whiteSpace: 'nowrap' }}>
              — pick {packSize - selected.length} more
            </span>
          )}
          <button
            onClick={onChangePack}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              marginLeft: '0.25rem',
              whiteSpace: 'nowrap',
            }}
          >
            Change
          </button>
        </>
      )}
    </div>
  );
}

// ─── Pack Picker ───────────────────────────────────────────────────────────────
function PackPicker({ packSize, onSelect }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', opacity: 0.9 }}>
        Choose your HD pack:
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
        {PACK_OPTIONS.map(opt => {
          const isSelected = packSize === opt.size;
          return (
            <button
              key={opt.size}
              onClick={() => { trackAnalytics('hd_pack_selected', String(opt.size), 'pack_picker'); onSelect(opt.size); }}
              style={{
                background: isSelected ? 'white' : 'rgba(255,255,255,0.15)',
                color: isSelected ? '#2563eb' : 'white',
                border: isSelected ? '2px solid white' : '2px solid rgba(255,255,255,0.4)',
                borderRadius: '8px',
                padding: '0.5rem 0.9rem',
                cursor: 'pointer',
                fontWeight: isSelected ? '700' : '500',
                fontSize: '0.85rem',
                transition: 'all 0.15s',
                position: 'relative',
                minWidth: '80px',
              }}
            >
              <div>{opt.size} image{opt.size > 1 ? 's' : ''}</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>${opt.price}</div>
              {opt.savings && (
                <div style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: '#10b981', color: 'white',
                  fontSize: '0.6rem', fontWeight: 'bold',
                  padding: '2px 4px', borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}>
                  save {opt.savings}%
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.85, minHeight: '1.2em' }}>
        {packSize
          ? `✓ ${packSize}-image pack selected — now pick ${packSize} image${packSize > 1 ? 's' : ''} below`
          : 'Select a pack to get started'}
      </div>
    </div>
  );
}

// ─── One-time Checkout Bar ─────────────────────────────────────────────────────
function CheckoutBar({ selected, packSize, onClear, onChangePack }) {
  const packOption = PACK_OPTIONS.find(o => o.size === packSize);
  const remaining = packSize - selected.length;
  const isFull = selected.length === packSize;

  const handleCheckout = async (e) => {
    e.stopPropagation();
    trackAnalytics('hd_checkout_initiated', String(packSize), 'checkout_bar');
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: PRICE_IDS[packSize],
        selectedImages: selected
      })
    });
    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      background: isFull ? '#2563eb' : '#1e293b', color: 'white',
      padding: '1.5rem 2rem', borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 100,
      transition: 'background 0.2s',
      minWidth: '200px',
    }}>
      <button
        onClick={(e) => { e.stopPropagation(); onClear(); }}
        aria-label="Clear selection"
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'transparent', border: 'none',
          color: 'white', cursor: 'pointer',
          fontSize: '1.2rem', padding: '0.25rem'
        }}
      >×</button>

      <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.2rem' }}>
        {packSize}-image pack
      </div>
      <div style={{ marginBottom: '0.25rem', fontSize: '1rem', fontWeight: '500' }}>
        {isFull
          ? `✓ All ${packSize} selected`
          : `${selected.length} of ${packSize} — pick ${remaining} more`}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        ${packOption.price}
      </div>

      {isFull ? (
        <button
          onClick={handleCheckout}
          style={{
            background: 'white', color: '#2563eb',
            border: 'none', padding: '0.75rem 2rem',
            borderRadius: '8px', fontWeight: 'bold',
            cursor: 'pointer', width: '100%', fontSize: '1rem'
          }}
        >
          Checkout
        </button>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '0.6rem',
          textAlign: 'center', fontSize: '0.85rem', opacity: 0.8,
        }}>
          {remaining} more to checkout
        </div>
      )}

      <button
        onClick={onChangePack}
        style={{
          background: 'transparent', color: 'rgba(255,255,255,0.6)',
          border: 'none', padding: '0.5rem 0 0',
          cursor: 'pointer', fontSize: '0.78rem', width: '100%',
          textAlign: 'center', textDecoration: 'underline', display: 'block',
        }}
      >
        Change pack
      </button>
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
  { id: 'coffee-shop-13-hd', name: 'Coffee Shop #13', category: 'coffee-shops' },
  { id: 'coffee-shop-19-hd', name: 'Coffee Shop #19', category: 'coffee-shops' },
  // Conference Rooms
  { id: 'conference-room-01-hd', name: 'Conference Room #1', category: 'conference-rooms' },
  { id: 'conference-room-02-hd', name: 'Conference Room #2', category: 'conference-rooms' },
  { id: 'conference-room-03-hd', name: 'Conference Room #3', category: 'conference-rooms' },
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
  { id: 'home-offices-04-hd', name: 'Home Office #4', category: 'home-office' },
  { id: 'home-offices-05-hd', name: 'Home Office #5', category: 'home-office' },
  { id: 'home-offices-07-hd', name: 'Home Office #7', category: 'home-office' },
  { id: 'home-offices-08-hd', name: 'Home Office #8', category: 'home-office' },
  { id: 'home-offices-12-hd', name: 'Home Office #12', category: 'home-office' },
  { id: 'home-offices-13-hd', name: 'Home Office #13', category: 'home-office' },
  { id: 'home-offices-14-hd', name: 'Home Office #14', category: 'home-office' },
  { id: 'home-offices-17-hd', name: 'Home Office #17', category: 'home-office' },
  { id: 'home-offices-22-hd', name: 'Home Office #22', category: 'home-office' },
  { id: 'home-offices-23-hd', name: 'Home Office #23', category: 'home-office' },
  { id: 'home-offices-28-hd', name: 'Home Office #28', category: 'home-office' },
  { id: 'home-offices-29-hd', name: 'Home Office #29', category: 'home-office' },
  { id: 'home-offices-30-hd', name: 'Home Office #30', category: 'home-office' },
  { id: 'home-offices-31-hd', name: 'Home Office #31', category: 'home-office' },
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
  { id: 'living-room-10-hd', name: 'Living Room #10', category: 'living-rooms' },
  { id: 'living-room-11-hd', name: 'Living Room #11', category: 'living-rooms' },
  { id: 'living-room-14-hd', name: 'Living Room #14', category: 'living-rooms' },
  { id: 'living-room-17-hd', name: 'Living Room #17', category: 'living-rooms' },
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
  { id: 'easter-background-02-hd', name: 'Easter #2', category: 'easter-backgrounds' },
  { id: 'easter-background-03-hd', name: 'Easter #3', category: 'easter-backgrounds' },
  { id: 'easter-background-04-hd', name: 'Easter #4', category: 'easter-backgrounds' },
  { id: 'easter-background-32-hd', name: 'Easter #32', category: 'easter-backgrounds' },
  { id: 'easter-background-35-hd', name: 'Easter #35', category: 'easter-backgrounds' },
  { id: 'easter-background-39-hd', name: 'Easter #39', category: 'easter-backgrounds' },
  { id: 'easter-background-42-hd', name: 'Easter #42', category: 'easter-backgrounds' },
  { id: 'easter-background-48-hd', name: 'Easter #48', category: 'easter-backgrounds' },
  { id: 'easter-background-49-hd', name: 'Easter #49', category: 'easter-backgrounds' },
  { id: 'easter-background-56-hd', name: 'Easter #56', category: 'easter-backgrounds' },
  { id: 'easter-background-57-hd', name: 'Easter #57', category: 'easter-backgrounds' },
  { id: 'easter-background-59-hd', name: 'Easter #59', category: 'easter-backgrounds' },
  { id: 'easter-background-61-hd', name: 'Easter #61', category: 'easter-backgrounds' },
  { id: 'easter-background-66-hd', name: 'Easter #66', category: 'easter-backgrounds' },
  { id: 'easter-background-72-hd', name: 'Easter #72', category: 'easter-backgrounds' },
  { id: 'easter-background-73-hd', name: 'Easter #73', category: 'easter-backgrounds' },
  { id: 'easter-background-74-hd', name: 'Easter #74', category: 'easter-backgrounds' },
  { id: 'easter-background-75-hd', name: 'Easter #75', category: 'easter-backgrounds' },
  { id: 'easter-background-87-hd', name: 'Easter #87', category: 'easter-backgrounds' },
  { id: 'easter-background-88-hd', name: 'Easter #88', category: 'easter-backgrounds' },
  { id: 'easter-background-91-hd', name: 'Easter #91', category: 'easter-backgrounds' },
  { id: 'easter-background-92-hd', name: 'Easter #92', category: 'easter-backgrounds' },
  { id: 'easter-background-93-hd', name: 'Easter #93', category: 'easter-backgrounds' },
  { id: 'easter-background-99-hd', name: 'Easter #99', category: 'easter-backgrounds' },
  { id: 'easter-background-101-hd', name: 'Easter #101', category: 'easter-backgrounds' },
  { id: 'easter-background-106-hd', name: 'Easter #106', category: 'easter-backgrounds' },
];

const CATEGORY_LABELS = {
  'bookshelves-bright': 'Bright Bookshelves',
  'bookshelves-dark': 'Dark Bookshelves',
  'wall-shelves-bright': 'Bright Wall Shelves',
  'wall-shelves-dark': 'Dark Wall Shelves',
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

const CATEGORIES = ['all', ...Object.keys(CATEGORY_LABELS).filter(
  cat => products.some(p => p.category === cat)
)];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Premium({ reviewsData }) {
  const router = useRouter();
  const [packSize, setPackSize] = useState(null);
  const [selected, setSelected] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [hdOnlyPreview, setHdOnlyPreview] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroRef = useRef(null);

  // Pre-select category from URL param (e.g. ?category=easter-backgrounds)
  useEffect(() => {
    if (router.isReady && router.query.category) {
      const cat = router.query.category;
      if (CATEGORIES.includes(cat)) {
        setActiveCategory(cat);
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

  const handlePackSelect = (size) => {
    setPackSize(size);
    setSelected([]);
  };

  const handleHdOnlyBuy = async (productId, size) => {
    setHdOnlyPreview(null);
    if (size === 1) {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: PRICE_IDS[1], selectedImages: [productId] }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setPackSize(size);
      setSelected([productId]);
    }
  };

  const toggleSelect = (id) => {
    if (!packSize) return;
    setSelected(prev => {
      const isRemoving = prev.includes(id);
      const newSelected = isRemoving
        ? prev.filter(i => i !== id)
        : prev.length >= packSize ? prev : [...prev, id];

      if (!isRemoving && newSelected.includes(id)) {
        trackAnalytics('hd_image_selected', id, 'hd');
      } else if (isRemoving) {
        trackAnalytics('hd_image_deselected', id, 'hd');
      }
      return newSelected;
    });
  };

  const isSubscriber = subStatus?.valid;
  const filteredProducts = products.filter(p => !isHdOnly(p.id)).filter(p => activeCategory === 'all' || p.category === activeCategory);

  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| StreamBackdrops" or any other suffix.
  // Do not flag these as too short — they are intentionally optimised for SEO character limits.
  return (
    <Layout
      title="Premium HD Virtual Backgrounds | 2912×1632 | StreamBackdrops"
      description="Professional HD virtual backgrounds in stunning 2912×1632 resolution. Perfect for Zoom, Teams, and Google Meet. 2x sharper than standard backgrounds."
      canonical="https://streambackdrops.com/hd"
      keywords="HD virtual backgrounds, high resolution backgrounds, premium zoom backgrounds, professional video call backgrounds, high definition virtual backgrounds"
      image="https://res.cloudinary.com/dnhju6mhg/image/upload/webp/bookshelves-dark/bookshelves-dark-09.webp"
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

      {/* Sticky pack bar — non-subscribers only */}
      {!isSubscriber && (
        <StickyPackBar
          packSize={packSize}
          selected={selected}
          onSelect={handlePackSelect}
          onChangePack={() => { setPackSize(null); setSelected([]); }}
          visible={showStickyBar}
        />
      )}

      {/* Hero */}
      <section ref={heroRef} style={{
        padding: '2rem 2rem 3rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>Premium HD Backgrounds</h1>

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
          /* ── Pack picker ── */
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '1.25rem 1.5rem', borderRadius: '12px',
            display: 'inline-block', marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            <PackPicker packSize={packSize} onSelect={handlePackSelect} />
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {filteredProducts.map(product => (
            <HdProductCard
              key={product.id}
              product={product}
              isSelected={selected.includes(product.id)}
              isHovered={hoveredProduct === product.id}
              onToggle={toggleSelect}
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

        {/* One-time checkout bar */}
        {!isSubscriber && packSize !== null && selected.length > 0 && (
          <CheckoutBar
            selected={selected}
            packSize={packSize}
            onClear={() => setSelected([])}
            onChangePack={() => { setPackSize(null); setSelected([]); }}
          />
        )}
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
    </Layout>
  );
}

export async function getStaticProps() {
  const reviewsData = await getReviewsData();
  return { props: { reviewsData }, revalidate: 3600 };
}
