import { useEffect, useState } from 'react';
import { useWishlist } from '../lib/WishlistContext';

const PACK_OPTIONS = [
  { size: 1,  price: 4.99,  savings: null },
  { size: 2,  price: 6.99,  savings: 30 },
  { size: 3,  price: 8.99,  savings: 40 },
  { size: 5,  price: 12.99, savings: 48 },
  { size: 10, price: 22.99, savings: 54 },
  { size: 20, price: 39.99, savings: 60 },
];

const PRICE_IDS = {
  1:  'price_1Sr4U0Q695ongkMjxUtnf9NA',
  2:  'price_1Sr4VEQ695ongkMjkaclxw67',
  3:  'price_1Sr4WYQ695ongkMjRUTPsoIr',
  5:  'price_1TDoudQ695ongkMj0hGBVZfc',
  10: 'price_1TDovCQ695ongkMjnZptC1zz',
  20: 'price_1TDowHQ695ongkMjwk1xZFAO',
};

// Set to false to re-enable purchases
const CHECKOUT_PAUSED = true;
const CHECKOUT_PAUSED_MSG = 'Purchases are temporarily paused while we fix checkout. Please check back shortly.';

function bestTierForCount(count) {
  return PACK_OPTIONS.find(o => o.size >= count) || PACK_OPTIONS[PACK_OPTIONS.length - 1];
}

function trackAnalytics(eventType, filename, category) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, filename, category }),
  }).catch(() => {});
}

export default function WishlistDrawer() {
  const { wishlist, toggleWishlist, clearWishlist, drawerOpen, closeDrawer } = useWishlist();
  const [buying, setBuying] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeDrawer]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleBuy = async () => {
    if (!wishlist.length) return;
    if (CHECKOUT_PAUSED) return;
    setBuying(true);
    trackAnalytics('wishlist_checkout', null, 'wishlist');
    try {
      const tier = bestTierForCount(wishlist.length);
      const imageIds = wishlist.slice(0, tier.size).map(i => i.id);
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: PRICE_IDS[tier.size], selectedImages: imageIds }),
      });
      const data = await res.json();
      if (!data.url) {
        setBuying(false);
        alert(data.error || 'Checkout failed — no URL returned');
        return;
      }
      window.location.href = data.url;
    } catch {
      setBuying(false);
    }
  };

  const tier = wishlist.length > 0 ? bestTierForCount(wishlist.length) : null;
  const overCount = tier && wishlist.length > tier.size ? wishlist.length - tier.size : 0;

  if (!drawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 400,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '360px', maxWidth: '100vw',
          background: '#fff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 401,
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.22s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.1rem 1.25rem',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111' }}>
            💙 Saved HD Images
            {wishlist.length > 0 && (
              <span style={{
                marginLeft: '8px',
                background: '#2563eb', color: 'white',
                borderRadius: '99px', fontSize: '0.72rem',
                fontWeight: 700, padding: '2px 8px',
              }}>{wishlist.length}</span>
            )}
          </span>
          <button
            onClick={closeDrawer}
            aria-label="Close wishlist"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.5rem', color: '#6b7280', lineHeight: 1,
              padding: '4px',
            }}
          >×</button>
        </div>

        {/* Item list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {wishlist.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: '0.75rem',
              color: '#9ca3af', textAlign: 'center', padding: '2rem',
            }}>
              <span style={{ fontSize: '2.5rem' }}>💙</span>
              <p style={{ margin: 0, fontWeight: 600, color: '#374151' }}>No saved images yet</p>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                Tap the heart on any HD image to save it for later.
              </p>
              <a
                href="/hd"
                onClick={closeDrawer}
                style={{
                  marginTop: '0.5rem',
                  background: '#2563eb', color: 'white',
                  padding: '0.6rem 1.25rem', borderRadius: '8px',
                  textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                }}
              >Browse HD Images</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {wishlist.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', gap: '0.75rem', alignItems: 'center',
                    background: '#f9fafb', borderRadius: '8px',
                    padding: '0.5rem 0.6rem',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '72px', height: '48px', flexShrink: 0,
                    borderRadius: '5px', overflow: 'hidden', background: '#e5e7eb',
                  }}>
                    <img
                      src={item.thumb}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600, fontSize: '0.82rem', color: '#111',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{item.name}</div>
                    {item.hdOnly && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700,
                        color: '#7c3aed', letterSpacing: '0.04em',
                      }}>💎 HD ONLY</span>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => {
                      trackAnalytics('wishlist_remove', item.id, item.category);
                      toggleWishlist(item);
                    }}
                    aria-label={`Remove ${item.name} from wishlist`}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9ca3af', fontSize: '1.1rem', padding: '4px',
                      flexShrink: 0,
                    }}
                  >✕</button>
                </div>
              ))}

              {overCount > 0 && (
                <p style={{
                  margin: '0.25rem 0 0', fontSize: '0.75rem',
                  color: '#6b7280', textAlign: 'center',
                }}>
                  {overCount} image{overCount > 1 ? 's' : ''} won&apos;t fit in the {tier.size}-pack — upgrade pack size or remove some
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {wishlist.length > 0 && tier && (
          <div style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid #e5e7eb',
            flexShrink: 0,
            background: '#fff',
          }}>
            {CHECKOUT_PAUSED ? (
              <div style={{
                width: '100%',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '0.85rem',
                fontSize: '0.85rem',
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: 1.4,
              }}>
                {CHECKOUT_PAUSED_MSG}
              </div>
            ) : (
              <button
                onClick={handleBuy}
                disabled={buying}
                style={{
                  width: '100%',
                  background: buying ? '#93c5fd' : '#2563eb',
                  color: 'white',
                  border: 'none', borderRadius: '10px',
                  padding: '0.85rem',
                  fontWeight: 700, fontSize: '1rem',
                  cursor: buying ? 'wait' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {buying ? 'Redirecting…' : (
                  <>
                    Buy {tier.size}-pack · ${tier.price}
                    {tier.savings && (
                      <span style={{
                        marginLeft: '8px',
                        background: 'rgba(255,255,255,0.25)',
                        borderRadius: '99px', fontSize: '0.72rem',
                        padding: '2px 7px',
                      }}>save {tier.savings}%</span>
                    )}
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm('Clear all saved images?')) {
                  trackAnalytics('wishlist_cleared', null, 'wishlist');
                  clearWishlist();
                }
              }}
              style={{
                width: '100%', marginTop: '0.5rem',
                background: 'none', border: 'none',
                color: '#9ca3af', fontSize: '0.78rem',
                cursor: 'pointer', padding: '4px',
              }}
            >Clear all</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
