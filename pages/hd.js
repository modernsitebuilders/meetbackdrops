import Head from 'next/head';
import BreadcrumbSchema from '../components/BreadcrumbSchema';
import ComparisonWidgetSchema from '../components/ComparisonWidgetSchema';
import HdFaqSchema from '../components/HdFaqSchema';
import ProductSchema from '../components/ProductSchema';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import ComparisonWidget from '../components/ComparisonWidget';
import { loadStripe } from '@stripe/stripe-js';
import { getReviewsData } from '../lib/reviews';
import cloudinaryUrls from '../cloudinary-urls.json';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';

const PRICE_IDS = {
  1: 'price_1Sr4U0Q695ongkMjxUtnf9NA',
  2: 'price_1Sr4VEQ695ongkMjkaclxw67',
  3: 'price_1Sr4WYQ695ongkMjRUTPsoIr'
};

const PRICES = { 1: 4.99, 2: 6.99, 3: 8.99 };

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

// ─── HD Product Card ───────────────────────────────────────────────────────────
function HdProductCard({ product, isSelected, isHovered, onToggle, onPreview, onMouseEnter, onMouseLeave, subscriberMode, subToken, onDownloadComplete, onLimitReached }) {
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

      {/* Preview button */}
      <button
        onClick={async (e) => {
          e.stopPropagation();
          trackAnalytics('hd_preview_opened', product.id, product.category);
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
              // fallback — open without HD side if fetch fails
              onPreview({ id: product.id, standard: imageUrl, hd: null });
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
        src={`/images/${product.category}/${product.id.replace('-hd', '')}.webp`}
        alt={`${product.name} - Premium HD Virtual Background`}
        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

// ─── One-time Checkout Bar ─────────────────────────────────────────────────────
function CheckoutBar({ selected, onClear }) {
  const price = PRICES[selected.length];

  const handleCheckout = async (e) => {
    e.stopPropagation();
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: PRICE_IDS[selected.length],
        selectedImages: selected
      })
    });
    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      background: '#2563eb', color: 'white',
      padding: '1.5rem 2rem', borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 100
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

      <div style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
        {selected.length} image{selected.length > 1 ? 's' : ''} selected
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        ${price}
      </div>
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
          onClick={onVerifyClick}
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
  // Bookshelves Bright
  { id: 'bookshelves-bright-01-hd', name: 'Bright Bookshelf #1', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-02-hd', name: 'Bright Bookshelf #2', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-04-hd', name: 'Bright Bookshelf #4', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-06-hd', name: 'Bright Bookshelf #6', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-07-hd', name: 'Bright Bookshelf #7', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-10-hd', name: 'Bright Bookshelf #10', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-11-hd', name: 'Bright Bookshelf #11', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-13-hd', name: 'Bright Bookshelf #13', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-23-hd', name: 'Bright Bookshelf #23', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-19-hd', name: 'Bright Bookshelf #19', category: 'bookshelves-bright' },
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
  // Office Spaces
  { id: 'office-spaces-01-hd', name: 'Office Space #1', category: 'office-spaces' },
  { id: 'office-spaces-02-hd', name: 'Office Space #2', category: 'office-spaces' },
  { id: 'office-spaces-03-hd', name: 'Office Space #3', category: 'office-spaces' },
  { id: 'office-spaces-05-hd', name: 'Office Space #5', category: 'office-spaces' },
  { id: 'office-spaces-06-hd', name: 'Office Space #6', category: 'office-spaces' },
  { id: 'office-spaces-07-hd', name: 'Office Space #7', category: 'office-spaces' },
  { id: 'office-spaces-08-hd', name: 'Office Space #8', category: 'office-spaces' },
  { id: 'office-spaces-17-hd', name: 'Office Space #17', category: 'office-spaces' },
  { id: 'office-spaces-19-hd', name: 'Office Space #19', category: 'office-spaces' },
  { id: 'office-spaces-24-hd', name: 'Office Space #24', category: 'office-spaces' },
  { id: 'office-spaces-33-hd', name: 'Office Space #33', category: 'office-spaces' },
  { id: 'office-spaces-36-hd', name: 'Office Space #36', category: 'office-spaces' },
  { id: 'office-spaces-43-hd', name: 'Office Space #43', category: 'office-spaces' },
  { id: 'office-spaces-77-hd', name: 'Office Space #77', category: 'office-spaces' },
  { id: 'office-spaces-10-hd', name: 'Office Space #10', category: 'office-spaces' },
  { id: 'office-spaces-11-hd', name: 'Office Space #11', category: 'office-spaces' },
  { id: 'office-spaces-16-hd', name: 'Office Space #16', category: 'office-spaces' },
  { id: 'office-spaces-18-hd', name: 'Office Space #18', category: 'office-spaces' },
  { id: 'office-spaces-28-hd', name: 'Office Space #28', category: 'office-spaces' },
  { id: 'office-spaces-35-hd', name: 'Office Space #35', category: 'office-spaces' },
  { id: 'office-spaces-38-hd', name: 'Office Space #38', category: 'office-spaces' },
  { id: 'office-spaces-69-hd', name: 'Office Space #69', category: 'office-spaces' },
  { id: 'office-spaces-71-hd', name: 'Office Space #71', category: 'office-spaces' },
  { id: 'office-spaces-20-hd', name: 'Office Space #20', category: 'office-spaces' },
  { id: 'office-spaces-48-hd', name: 'Office Space #48', category: 'office-spaces' },
  { id: 'office-spaces-50-hd', name: 'Office Space #50', category: 'office-spaces' },
  { id: 'office-spaces-59-hd', name: 'Office Space #59', category: 'office-spaces' },
  { id: 'office-spaces-62-hd', name: 'Office Space #62', category: 'office-spaces' },
  { id: 'office-spaces-63-hd', name: 'Office Space #63', category: 'office-spaces' },
  { id: 'office-spaces-66-hd', name: 'Office Space #66', category: 'office-spaces' },
  { id: 'office-spaces-70-hd', name: 'Office Space #70', category: 'office-spaces' },
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
];

const CATEGORY_LABELS = {
  'bookshelves-bright': 'Bright Bookshelves',
  'bookshelves-dark': 'Dark Bookshelves',
  'wall-shelves-bright': 'Bright Wall Shelves',
  'wall-shelves-dark': 'Dark Wall Shelves',
  'office-spaces': 'Office Spaces',
  'coffee-shops': 'Coffee Shops',
  'conference-rooms': 'Conference Rooms',
  'libraries': 'Libraries',
  'nature-landscapes': 'Nature',
  'living-rooms': 'Living Rooms',
  'kitchens': 'Kitchens',
  'gardens-patios': 'Gardens & Patios',
  'christmas-backgrounds': 'Christmas',
};

const CATEGORIES = ['all', ...Object.keys(CATEGORY_LABELS).filter(
  cat => products.some(p => p.category === cat)
)];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Premium({ reviewsData }) {
  const [selected, setSelected] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

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

  const toggleSelect = (id) => {
    setSelected(prev => {
      const newSelected = prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length >= 3 ? prev : [...prev, id];

      if (!prev.includes(id) && newSelected.includes(id)) {
        trackAnalytics('hd_image_selected', id, 'hd');
      }
      return newSelected;
    });
  };

  const isSubscriber = subStatus?.valid;
  const filteredProducts = products.filter(p => activeCategory === 'all' || p.category === activeCategory);

  return (
    <Layout
      title="Premium HD Virtual Backgrounds | 2912×1632 Resolution | StreamBackdrops"
      description="Professional HD virtual backgrounds in stunning 2912×1632 resolution. Perfect for Zoom, Teams, and Google Meet. 2x sharper than standard backgrounds."
      canonical="https://streambackdrops.com/hd"
      keywords="HD virtual backgrounds, high resolution backgrounds, premium zoom backgrounds, professional video call backgrounds, high definition virtual backgrounds"
      image="/images/bookshelves-dark/bookshelves-dark-09.webp"
    >
      <Head>
        <BreadcrumbSchema items={[
          { name: "Home", url: "https://streambackdrops.com" },
          { name: "Premium HD Backgrounds", url: "https://streambackdrops.com/hd" }
        ]} />
        <ProductSchema products={products} reviewsData={reviewsData} />
        <ComparisonWidgetSchema />
        <HdFaqSchema />
      </Head>

      {/* Hero */}
      <section style={{
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
          /* ── One-time pricing ── */
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '1rem', borderRadius: '8px',
            display: 'inline-block', marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              1 image: $4.99 • 2 images: $6.99 • 3 images: $8.99
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {selected.length === 3
                ? '✓ Max 3 images selected - Ready to checkout!'
                : 'Click images to select, then checkout'}
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

        {/* Subscription CTA — only shown to non-subscribers */}
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
              onClick={() => setActiveCategory(cat)}
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
        {!isSubscriber && selected.length > 0 && (
          <CheckoutBar selected={selected} onClear={() => setSelected([])} />
        )}
      </section>

      {/* Comparison widget */}
      <ComparisonWidget
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        standardImg={previewImage?.standard}
        hdImg={previewImage?.hd}
        imageId={previewImage?.id}
      />

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

export async function getServerSideProps() {
  const reviewsData = await getReviewsData();
  return { props: { reviewsData } };
}
