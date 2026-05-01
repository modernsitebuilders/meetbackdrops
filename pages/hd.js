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
import cloudinaryUrls from '../cloudinary-urls.json';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';
import { isHdOnlyProductId as isHdOnly } from '../lib/hdOnly';
import { useWishlist } from '../lib/WishlistContext';

const SINGLE_PRICE = 4.99;

const CHECKOUT_PAUSED = false;

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
          {CHECKOUT_PAUSED ? (
            <div style={{
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.85)',
              padding: '10px',
              fontSize: '0.85rem',
              textAlign: 'center',
              lineHeight: 1.4,
            }}>
              🔧 {CHECKOUT_PAUSED_MSG}
            </div>
          ) : (
            <button
              onClick={handleBuy}
              disabled={buying}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid #fff',
                borderBottom: '2px solid #9a6a3a',
                borderRadius: '0',
                color: '#111827',
                cursor: buying ? 'wait' : 'pointer',
                padding: '0.85rem',
                fontWeight: 600,
                fontSize: '0.78rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
              }}
            >
              {buying ? 'Preparing checkout…' : `Buy HD — $${SINGLE_PRICE}`}
            </button>
          )}
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
        border: '1px solid #e6e2dc',
        borderBottom: isSelected ? '3px solid #9a6a3a' : '1px solid #e6e2dc',
        borderRadius: '0',
        overflow: 'hidden',
        position: 'relative',
        cursor: subscriberMode ? 'default' : 'pointer',
        boxShadow: isHighlighted
          ? '0 0 0 2px #9a6a3a, 0 0 0 4px rgba(154, 106, 58, 0.2)'
          : 'none',
        transition: 'box-shadow 0.35s ease, border-color 0.2s ease',
        background: '#fff',
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
          background: '#111827', color: '#fff',
          width: '28px', height: '28px',
          borderRadius: '0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, zIndex: 3,
          fontSize: '0.85rem',
          borderBottom: '2px solid #9a6a3a',
        }}>✓</div>
      )}

      {/* Wishlist heart — top-right when not selected */}
      {!isSelected && (
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            background: wishlisted ? 'rgba(154,106,58,0.95)' : 'rgba(17,24,39,0.6)',
            border: 'none', borderRadius: '0',
            width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 3,
            fontSize: '0.85rem',
            color: '#fff',
            opacity: isHovered || wishlisted ? 1 : 0,
            transition: 'opacity 0.2s, background 0.15s',
          }}
        >{wishlisted ? '♥' : '♡'}</button>
      )}

      {/* Exclusive chip — no free version available */}
      {hdOnly && !isSelected && (
        <div style={{
          position: 'absolute',
          top: '10px', left: '10px',
          background: '#111827',
          color: '#fff',
          fontSize: '0.6rem',
          fontWeight: 600,
          padding: '4px 9px',
          borderRadius: '0',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          zIndex: 3,
          pointerEvents: 'none',
          borderBottom: '2px solid #9a6a3a',
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
          background: '#111827', color: '#fff',
          padding: '0.6rem 1.25rem',
          border: '1px solid #111827', borderRadius: '0',
          cursor: 'pointer',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
          zIndex: 2, fontWeight: 600,
          whiteSpace: 'nowrap',
          fontSize: '0.72rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        Preview HD
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
        background: 'rgba(17, 24, 39, 0.9)',
        color: '#fff',
        fontSize: '0.62rem',
        fontWeight: 600,
        padding: '4px 9px',
        borderRadius: '0',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        zIndex: 2,
        pointerEvents: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        2912 × 1632 · PNG
      </div>
    </div>
  );
}

// ─── Pack Options ─────────────────────────────────────────────────────────────
const PACK_OPTIONS = [
  { size: 1,  price: 4.99,  savings: null },
  { size: 2,  price: 6.99,  savings: 30 },
  { size: 3,  price: 8.99,  savings: 40 },
  { size: 5,  price: 12.99, savings: 48 },
  { size: 10, price: 22.99, savings: 54 },
  { size: 20, price: 39.99, savings: 60 },
];

// ─── Sticky Pack Bar ───────────────────────────────────────────────────────────
function StickyPackBar({ packSize, selected, onSelect, onChangePack, visible }) {
  const packOption = packSize ? PACK_OPTIONS.find(o => o.size === packSize) : null;
  const isFull = packSize && selected.length >= packSize;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 200,
      background: '#111827',
      color: '#fff',
      padding: '0.6rem 1rem',
      boxShadow: '0 1px 0 #9a6a3a, 0 2px 12px rgba(0,0,0,0.3)',
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
          <span style={{
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#c79a6b',
            fontWeight: 600,
            marginRight: '0.4rem',
            whiteSpace: 'nowrap',
          }}>
            Choose a pack
          </span>
          {PACK_OPTIONS.map(opt => (
            <button
              key={opt.size}
              onClick={() => { trackAnalytics('hd_pack_selected', String(opt.size), 'sticky_bar'); onSelect(opt.size); }}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '0',
                padding: '0.35rem 0.7rem',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                letterSpacing: '0.04em',
                fontFamily: 'inherit',
              }}
            >
              {opt.size === 1 ? '1 image' : `${opt.size}-pack`} · ${opt.price}
            </button>
          ))}
        </>
      ) : (
        <>
          <span style={{
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#c79a6b',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            marginRight: '0.4rem',
          }}>
            {isFull ? `All ${packSize} selected` : `${selected.length} of ${packSize}`}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: "'Fraunces', Georgia, serif" }}>
            ${packOption.price}
          </span>
          {!isFull && (
            <span style={{ fontSize: '0.78rem', opacity: 0.7, whiteSpace: 'nowrap' }}>
              — pick {packSize - selected.length} more below
            </span>
          )}
          <button
            onClick={onChangePack}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '0',
              padding: '0.25rem 0.6rem',
              cursor: 'pointer',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginLeft: '0.4rem',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
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
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#c79a6b',
        marginBottom: '1rem',
      }}>
        Choose your HD pack
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
        {PACK_OPTIONS.map(opt => {
          const isSelected = packSize === opt.size;
          return (
            <button
              key={opt.size}
              onClick={() => { trackAnalytics('hd_pack_selected', String(opt.size), 'pack_picker'); onSelect(opt.size); }}
              style={{
                background: isSelected ? '#fff' : 'transparent',
                color: isSelected ? '#111827' : '#fff',
                border: isSelected ? '1px solid #fff' : '1px solid rgba(255,255,255,0.35)',
                borderBottom: isSelected ? '2px solid #9a6a3a' : '1px solid rgba(255,255,255,0.35)',
                borderRadius: '0',
                padding: '0.65rem 0.95rem',
                cursor: 'pointer',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                position: 'relative',
                minWidth: '88px',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85 }}>
                {opt.size === 1 ? '1 image' : `${opt.size} images`}
              </div>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.01em', marginTop: '2px' }}>
                ${opt.price}
              </div>
              <div style={{ fontSize: '0.62rem', opacity: 0.65, marginTop: '2px', letterSpacing: '0.04em' }}>
                ${(opt.price / opt.size).toFixed(2)}/img
              </div>
              {opt.savings && (
                <div style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: '#9a6a3a', color: '#fff',
                  fontSize: '0.58rem', fontWeight: 600,
                  padding: '3px 6px', borderRadius: '0',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  Save ${Math.round(SINGLE_PRICE * opt.size - opt.price)}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: '0.85rem', marginTop: '1rem', opacity: 0.75, minHeight: '1.2em', textAlign: 'center' }}>
        {packSize
          ? `${packSize === 1 ? '1-image' : `${packSize}-image pack`} selected — pick ${packSize} image${packSize > 1 ? 's' : ''} below`
          : 'Select a pack to get started'}
      </div>
    </div>
  );
}

// ─── Checkout Bar ──────────────────────────────────────────────────────────────
function CheckoutBar({ selected, packSize, onClear, onChangePack, onCheckout }) {
  const packOption = PACK_OPTIONS.find(o => o.size === packSize);
  const isFull = selected.length >= packSize;
  const remaining = packSize - selected.length;

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      background: '#111827',
      color: '#fff',
      padding: '1.5rem 1.75rem',
      borderRadius: '0',
      borderBottom: isFull ? '3px solid #9a6a3a' : '1px solid #1f2937',
      boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
      zIndex: 100,
      transition: 'border-bottom 0.2s',
      minWidth: '220px',
    }}>
      <button
        onClick={onClear}
        aria-label="Clear selection"
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
          fontSize: '1.1rem', padding: '0.25rem',
          fontFamily: 'inherit',
        }}
      >×</button>
      <div style={{
        fontSize: '0.65rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#c79a6b',
        fontWeight: 600,
        marginBottom: '0.5rem',
      }}>
        {packSize}-image pack
      </div>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#d1d5db' }}>
        {isFull
          ? `All ${packSize} selected`
          : `${selected.length} of ${packSize} — pick ${remaining} more`}
      </div>
      <div style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: '2rem',
        fontWeight: 600,
        letterSpacing: '-0.02em',
        marginBottom: '1.25rem',
        lineHeight: 1,
      }}>
        ${packOption.price}
      </div>
      {isFull ? (
        <button
          onClick={onCheckout}
          style={{
            background: '#fff', color: '#111827',
            border: '1px solid #fff',
            padding: '0.85rem 1.5rem',
            borderRadius: '0', fontWeight: 600,
            cursor: 'pointer', width: '100%',
            fontSize: '0.78rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontFamily: 'inherit',
          }}
        >
          {packSize === 1
            ? `Buy HD — $${packOption.price}`
            : packSize === 3
            ? 'Unlock bundle savings'
            : packSize >= 5
            ? 'Checkout best-value pack'
            : 'Checkout →'}
        </button>
      ) : (
        <div style={{
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '0', padding: '0.7rem',
          textAlign: 'center', fontSize: '0.82rem', color: '#d1d5db',
        }}>
          {remaining} more to checkout
          {selected.length === 1 && (
            <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: '4px' }}>
              Add 2 more to unlock better pricing
            </div>
          )}
          {selected.length >= 2 && selected.length <= 4 && (
            <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: '4px' }}>
              1 more unlocks better bundle price
            </div>
          )}
        </div>
      )}
      <button
        onClick={onChangePack}
        style={{
          background: 'transparent', color: 'rgba(255,255,255,0.55)',
          border: 'none', padding: '0.65rem 0 0',
          cursor: 'pointer', fontSize: '0.7rem', width: '100%',
          textAlign: 'center',
          letterSpacing: '0.16em', textTransform: 'uppercase',
          fontFamily: 'inherit',
          display: 'block',
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
      background: '#111827',
      color: '#fff',
      borderRadius: '0',
      borderTop: '2px solid #9a6a3a',
      padding: '2rem 2rem',
      margin: '2.5rem 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1.5rem',
    }}>
      <div style={{ flex: '1 1 320px' }}>
        <div style={{
          fontSize: '0.7rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#c79a6b',
          fontWeight: 600,
          marginBottom: '0.5rem',
        }}>
          Unlimited monthly access
        </div>
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: '1.6rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          marginBottom: '0.5rem',
          lineHeight: 1.15,
        }}>
          Subscribe — $9 per month
        </div>
        <div style={{ fontSize: '0.92rem', color: '#d1d5db', lineHeight: 1.55 }}>
          10 HD downloads per month · resets each billing cycle · cancel anytime.
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            background: '#fff', color: '#111827',
            border: '1px solid #fff',
            padding: '0.85rem 1.75rem',
            borderRadius: '0', fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            fontSize: '0.78rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Loading…' : 'Start Subscription'}
        </button>
        <button
          onClick={() => { trackAnalytics('hd_verify_sub_click', null, 'subscription'); onVerifyClick(); }}
          style={{
            background: 'transparent', color: '#fff',
            border: '1px solid rgba(255,255,255,0.4)',
            padding: '0.85rem 1.25rem',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '0.72rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
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
            width: '100%',
            background: '#111827',
            color: '#fff',
            border: '1px solid #111827',
            borderBottom: '2px solid #9a6a3a',
            padding: '0.95rem',
            borderRadius: '0',
            fontWeight: 600,
            fontSize: '0.78rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: loading ? 'default' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Verifying…' : 'Verify Subscription'}
        </button>
      </div>
    </div>
  );
}

// (State machine replaced with simple useState in main component)

// ─── Focus Hero ────────────────────────────────────────────────────────────────
function FocusHero({ product, hdOnly, buying, onBuy, onDismiss, onBundleUpsell }) {
  if (!product) return null;
  const thumb = `https://assets.streambackdrops.com/webp/${product.category}/${product.id.replace('-hd', '')}.webp`;

  return (
    <section style={{
      background: '#111827',
      color: '#fff',
      padding: '2.5rem 1.5rem 2.5rem',
      borderBottom: '2px solid #9a6a3a',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)',
        gap: '2.5rem',
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
              background: 'rgba(17,24,39,0.85)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              width: '2rem', height: '2rem', borderRadius: '0',
              cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit',
            }}
          >×</button>
          <img
            src={thumb}
            alt={product.name}
            style={{
              width: '100%',
              aspectRatio: '16/9',
              objectFit: 'cover',
              borderRadius: '0',
              border: '1px solid #1f2937',
              borderBottom: '3px solid #9a6a3a',
              display: 'block',
            }}
          />
          {hdOnly && (
            <div style={{
              position: 'absolute', top: '0.9rem', left: '0.9rem',
              background: '#111827',
              color: '#fff',
              fontSize: '0.62rem', fontWeight: 600,
              padding: '4px 9px', borderRadius: '0',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              borderBottom: '2px solid #9a6a3a',
            }}>
              Exclusive
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: '0.9rem', left: '0.9rem',
            background: 'rgba(17, 24, 39, 0.92)',
            color: '#fff',
            fontSize: '0.62rem', fontWeight: 600,
            padding: '4px 9px', borderRadius: '0',
            letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>
            2912 × 1632 · PNG
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{
            fontSize: '0.7rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#c79a6b',
            fontWeight: 600,
          }}>
            Selected
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(1.5rem, 3vw, 1.85rem)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            margin: 0,
            lineHeight: 1.15,
          }}>
            {product.name}
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#d1d5db' }}>
            Instant download · 2912 × 1632 PNG
          </div>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Each image is purchased individually in full resolution.
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            {CHECKOUT_PAUSED ? (
              <div style={{
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '0',
                padding: '1rem 1.25rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                color: '#d1d5db',
                lineHeight: 1.5,
              }}>
                {CHECKOUT_PAUSED_MSG}
              </div>
            ) : (
              <>
                <button
                  onClick={onBuy}
                  disabled={buying}
                  style={{
                    background: '#fff',
                    color: '#111827',
                    border: '1px solid #fff',
                    padding: '1rem 1.5rem',
                    borderRadius: '0',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    cursor: buying ? 'wait' : 'pointer',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                >
                  {buying ? 'Preparing checkout…' : `Buy HD — $${SINGLE_PRICE}`}
                </button>
                {onBundleUpsell && (
                  <button
                    onClick={onBundleUpsell}
                    style={{
                      background: 'transparent',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.35)',
                      padding: '0.85rem 1.25rem',
                      borderRadius: '0',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      width: '100%',
                      marginTop: '0.7rem',
                      fontFamily: 'inherit',
                    }}
                  >
                    Or get 3 HD images for $8.99{' '}
                    <span style={{ color: '#c79a6b', fontWeight: 600 }}>(save $6.00)</span>
                  </button>
                )}
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.85rem', textAlign: 'center', letterSpacing: '0.04em' }}>
                  Continue to secure Stripe checkout.
                </div>
              </>
            )}
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
  { id: 'bookshelves-bright-24-hd', name: 'Bright Bookshelf #24', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-29-hd', name: 'Bright Bookshelf #29', category: 'bookshelves-bright' },
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
  { id: 'wall-shelves-bright-55-hd', name: 'Bright Wall Shelf #55', category: 'wall-shelves-bright' },
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
  { id: 'office-spaces-70-hd', name: 'Office Space #70', category: 'office-spaces' },
  { id: 'office-spaces-71-hd', name: 'Office Space #71', category: 'office-spaces' },
  { id: 'office-spaces-77-hd', name: 'Office Space #77', category: 'office-spaces' },
  { id: 'office-spaces-84-hd', name: 'Office Space #84', category: 'office-spaces' },
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
  { id: 'home-offices-50-hd', name: 'Home Office #50', category: 'home-office' },
  { id: 'home-offices-62-hd', name: 'Home Office #62', category: 'home-office' },
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
  { id: 'spring-background-01-hd', name: 'Spring #1', category: 'spring-backgrounds' },
  { id: 'spring-background-36-hd', name: 'Spring #36', category: 'spring-backgrounds' },
  { id: 'spring-background-55-hd', name: 'Spring #55', category: 'spring-backgrounds' },
  { id: 'spring-background-63-hd', name: 'Spring #63', category: 'spring-backgrounds' },
  { id: 'spring-background-73-hd', name: 'Spring #73', category: 'spring-backgrounds' },
  { id: 'spring-background-74-hd', name: 'Spring #74', category: 'spring-backgrounds' },
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
  'spring-backgrounds': 'Spring',
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

// ─── Walkthrough Video (lazy-loaded — iframe only mounts on click) ───────────
function HdVideoSection() {
  const [playing, setPlaying] = useState(false);
  return (
    <section style={{
      background: '#fafaf7',
      borderTop: '1px solid #e6e2dc',
      borderBottom: '1px solid #e6e2dc',
      padding: '4rem 2rem',
    }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          fontSize: '0.7rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#9a6a3a',
          fontWeight: 600,
          marginBottom: '1rem',
        }}>
          Watch · 1:35
        </div>
        <h2 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          margin: '0 0 0.75rem',
          color: '#111827',
        }}>
          A short walkthrough of the HD Editions
        </h2>
        <p style={{
          fontSize: '0.95rem',
          color: '#6b7280',
          margin: '0 auto 2rem',
          maxWidth: '560px',
          lineHeight: 1.6,
        }}>
          See what 4K source files look like on a Zoom or Teams call — and where standard
          backgrounds fall apart under codec compression.
        </p>
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          background: '#111827',
          border: '1px solid #e6e2dc',
        }}>
          {playing ? (
            <iframe
              src="https://www.youtube-nocookie.com/embed/gO89ooJbl20?autoplay=1&rel=0"
              title="HD Editions walkthrough"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setPlaying(true);
                trackAnalytics('hd_video_play', 'gO89ooJbl20', 'hd');
              }}
              aria-label="Play HD Editions walkthrough (1 minute 35 seconds)"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
                cursor: 'pointer',
                padding: 0,
                background: '#000',
              }}
            >
              <img
                src="https://img.youtube.com/vi/gO89ooJbl20/maxresdefault.jpg"
                alt=""
                loading="lazy"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.9,
                }}
              />
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: 'rgba(17, 24, 39, 0.85)',
                border: '2px solid #c79a6b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{
                  width: 0,
                  height: 0,
                  borderTop: '13px solid transparent',
                  borderBottom: '13px solid transparent',
                  borderLeft: '20px solid #c79a6b',
                  marginLeft: '5px',
                }} />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
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
  const [packSize, setPackSize] = useState(null);
  const [bundleSelected, setBundleSelected] = useState([]);
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

  const handleCheckout = async (productIds) => {
    const ids = productIds
      ?? (packSize ? bundleSelected : selectedId ? [selectedId] : []);
    if (!ids || ids.length === 0) return;
    if (CHECKOUT_PAUSED) { alert(CHECKOUT_PAUSED_MSG); return; }
    const product = products.find(p => p.id === ids[0]);
    trackAnalytics('hd_checkout_initiated', ids.join(','), product?.category);
    setCheckingOut(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: ids }),
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

  const handleHdOnlyBuy = (productId) => {
    setHdOnlyPreview(null);
    handleCheckout([productId]);
  };

  const handlePackSelect = (size) => {
    setPackSize(size);
    setBundleSelected([]);
    trackAnalytics('hd_pack_selected', String(size), 'hero');
  };

  const handleChangePack = () => {
    setPackSize(null);
    setBundleSelected([]);
  };

  const handleCardClick = (id) => {
    if (packSize) {
      setBundleSelected(prev => {
        if (prev.includes(id)) return prev.filter(x => x !== id);
        if (prev.length >= packSize) return prev;
        return [...prev, id];
      });
      trackAnalytics('hd_image_selected', id, 'bundle');
      return;
    }
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
      title="HD Editions — 4K Virtual Environments for Executive Video Calls | StreamBackdrops"
      description="HD Editions: 2912×1632 studio-designed backgrounds that stay sharp on Zoom, Teams, and Google Meet — engineered to survive video codec compression where stock JPEGs fall apart."
      canonical="https://streambackdrops.com/hd"
      keywords="HD virtual backgrounds, 4k virtual backgrounds, executive zoom backgrounds, premium corporate backgrounds, professional video call environments"
      image="https://assets.streambackdrops.com/webp/bookshelves-dark/bookshelves-dark-09.webp"
    >
      <Head>
        {router.query.category && <meta name="robots" content="noindex, follow" />}
        <BreadcrumbSchema items={[
          { name: "Home", url: "https://streambackdrops.com" },
          { name: "HD Editions", url: "https://streambackdrops.com/hd" }
        ]} />
        <ProductSchema products={products} reviewsData={reviewsData} />
        <ComparisonWidgetSchema />
        <HdFaqSchema />
      </Head>

      {/* Sticky pack bar — only for non-subscribers, hidden when focus hero is showing */}
      {!isSubscriber && !selectedProduct && (
        <StickyPackBar
          packSize={packSize}
          selected={bundleSelected}
          onSelect={handlePackSelect}
          onChangePack={handleChangePack}
          visible={showStickyBar}
        />
      )}

      {/* Bundle checkout bar — floats bottom-right when a pack is active */}
      {!isSubscriber && packSize && (
        <CheckoutBar
          selected={bundleSelected}
          packSize={packSize}
          onClear={handleChangePack}
          onChangePack={handleChangePack}
          onCheckout={() => handleCheckout(bundleSelected)}
        />
      )}

      {/* Focus Hero — shown when a single image is selected (not in bundle mode) */}
      {!isSubscriber && selectedProduct && !packSize && (
        <FocusHero
          product={selectedProduct}
          hdOnly={isHdOnly(selectedProduct.id)}
          buying={checkingOut}
          onBuy={() => handleCheckout()}
          onDismiss={() => {
            trackAnalytics('hd_focus_dismissed', selectedProduct.id, selectedProduct.category);
            setSelectedId(null);
          }}
          onBundleUpsell={() => {
            trackAnalytics('hd_bundle_upsell', selectedProduct.id, selectedProduct.category);
            setPackSize(3);
            setBundleSelected([selectedProduct.id]);
            setSelectedId(null);
          }}
        />
      )}

      {/* Hero */}
      <section ref={heroRef} style={{
        padding: '5rem 2rem 4rem',
        background: '#111827',
        color: 'white',
        textAlign: 'center',
        borderBottom: '2px solid #9a6a3a',
      }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#c79a6b',
          marginBottom: '1.25rem',
        }}>
          HD Editions · 2912 × 1632 · PNG
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
          fontWeight: 600,
          letterSpacing: '-0.02em',
          fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
          marginBottom: '1.25rem',
          lineHeight: 1.05,
          maxWidth: '880px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          The HD Editions — sharp on Zoom, Teams, and Meet.
        </h1>
        <p style={{
          fontSize: '1.1rem',
          maxWidth: '680px',
          margin: '0 auto 2.25rem',
          lineHeight: 1.65,
          color: '#d1d5db',
        }}>
          Roughly 3× the effective resolution of standard webcam backgrounds. Studio-designed
          backgrounds that survive Zoom and Teams compression where stock JPEGs fall apart —
          and shine on the 4K monitors and projectors where presence shows.
        </p>

        {isSubscriber ? (
          /* ── Subscriber badge ── */
          <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
            <div style={{
              border: '1px solid rgba(255,255,255,0.2)',
              borderTop: '2px solid #9a6a3a',
              padding: '1rem 1.75rem',
              borderRadius: '0',
              textAlign: 'left',
            }}>
              <div style={{
                fontSize: '0.7rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#c79a6b',
                fontWeight: 600,
                marginBottom: '0.4rem',
              }}>
                Active Subscription
              </div>
              <div style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '1.2rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}>
                {subStatus.remaining} of 10 HD downloads remaining this month
              </div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: '#d1d5db' }}>
                Hover over any image and click Download HD · {subStatus.email}
              </div>
            </div>
            {limitMessage && (
              <div style={{
                marginTop: '0.6rem',
                border: '1px solid #c79a6b',
                color: '#fde68a',
                borderRadius: '0',
                padding: '0.7rem 1.2rem',
                fontSize: '0.92rem',
                fontWeight: 500,
              }}>
                {limitMessage}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Pack picker ── */}
            <PackPicker packSize={packSize} onSelect={handlePackSelect} />

            {/* Inline subscription mention — preserves high-intent path without competing visually */}
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.85rem',
              color: '#9ca3af',
              textAlign: 'center',
            }}>
              Or unlimited monthly access —{' '}
              <a
                href="#subscription"
                onClick={(e) => {
                  e.preventDefault();
                  trackAnalytics('hd_inline_sub_link_click', null, 'hd_hero');
                  document.getElementById('subscription')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  color: '#c79a6b',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  fontWeight: 600,
                }}
              >
                see plans below ↓
              </a>
            </div>

            {/* Muted comparison link — reframed from "escape hatch" to "due diligence" */}
            <div style={{
              marginTop: '0.4rem',
              fontSize: '0.8rem',
              textAlign: 'center',
            }}>
              <a
                href="/#categories"
                onClick={() => trackAnalytics('hd_compare_free_clicked', null, 'hd')}
                style={{
                  color: '#9ca3af',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  letterSpacing: '0.02em',
                }}
              >
                Compare with free samples →
              </a>
            </div>
          </>
        )}
      </section>

      {/* Trust signals row — replaces the old "Hover over images" helper */}
      <section style={{
        background: '#111827',
        borderTop: '1px solid #1f2937',
        padding: '1.25rem 2rem',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          textAlign: 'center',
          fontSize: '0.7rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#d1d5db',
          fontWeight: 500,
        }}>
          <div><span style={{ color: '#9a6a3a', marginRight: '0.5rem' }}>✦</span>Instant Download</div>
          <div><span style={{ color: '#9a6a3a', marginRight: '0.5rem' }}>✦</span>No Watermark</div>
          <div><span style={{ color: '#9a6a3a', marginRight: '0.5rem' }}>✦</span>4K · 2912×1632</div>
          <div><span style={{ color: '#9a6a3a', marginRight: '0.5rem' }}>✦</span>Lifetime Use</div>
        </div>
      </section>

      {/* Why 4K — funnel reinforcement between hero and grid */}
      <section style={{
        background: '#fafaf7',
        borderBottom: '1px solid #e6e2dc',
        padding: '4rem 2rem',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontSize: '0.7rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#9a6a3a',
            fontWeight: 600,
            marginBottom: '1rem',
          }}>
            Why 4K, in plain English
          </div>
          <p style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(1.15rem, 2vw, 1.4rem)',
            fontWeight: 500,
            lineHeight: 1.5,
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            Zoom and Teams compress your video stream in real time. Standard 1080p backgrounds
            lose detail in the compression — fine grids turn to mud, edges shimmer. Our 4K source
            files give the codec more pixels to throw away, so what reaches your colleague&rsquo;s
            screen still looks composed.
          </p>
          <p style={{
            fontSize: '0.85rem',
            color: '#6b7280',
            marginTop: '1.5rem',
            letterSpacing: '0.02em',
          }}>
            Same reason cinematographers shoot 6K to deliver 4K.
          </p>
        </div>
      </section>

      <section style={{ padding: '3rem 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Highlight miss notice — shown when ?highlight= didn't match any HD product */}
        {highlightMissError && !selectedProduct && (
          <div
            role="status"
            style={{
              margin: '0 0 1.5rem',
              padding: '0.85rem 1.25rem',
              background: '#fafaf7',
              border: '1px solid #e6e2dc',
              borderTop: '2px solid #9a6a3a',
              borderRadius: '0',
              color: '#374151',
              fontSize: '0.9rem',
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
                border: '1px solid #111827',
                color: '#111827',
                borderRadius: '0',
                padding: '0.4rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Category filter buttons */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
          marginBottom: '2.5rem', justifyContent: 'center'
        }}>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { trackAnalytics('hd_category_filter', cat, 'hd'); setActiveCategory(cat); }}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '0',
                  border: '1px solid',
                  borderColor: isActive ? '#111827' : '#e6e2dc',
                  borderBottom: isActive ? '2px solid #9a6a3a' : '1px solid #e6e2dc',
                  background: isActive ? '#111827' : '#fff',
                  color: isActive ? '#fff' : '#374151',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
              </button>
            );
          })}
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
              isSelected={packSize ? bundleSelected.includes(product.id) : selectedId === product.id}
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

        {/* Subscription CTA — below the grid for non-subscribers (visitors who scrolled have signaled intent) */}
        {!isSubscriber && (
          <div id="subscription" style={{ scrollMarginTop: '5rem' }}>
            <SubscriptionCTA onVerifyClick={() => setShowVerifyModal(true)} />
          </div>
        )}
      </section>

      {/* Walkthrough video — bottom of page, lazy-loaded */}
      <HdVideoSection />

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
  const { getReviewsData } = await import('../lib/reviews');
  const reviewsData = await getReviewsData();
  return { props: { reviewsData }, revalidate: 3600 };
}
