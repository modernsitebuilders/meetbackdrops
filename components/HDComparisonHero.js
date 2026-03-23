'use client';

import { useState } from 'react';
import ComparisonWidget from './ComparisonWidget';
import cloudinaryUrls from '../cloudinary-urls.json';
import { getOrCreateSession, getVisitorType } from '../lib/sessionTracking';

// All image base IDs (no extension, no -hd) that have HD versions available
const HD_BASE_IDS = new Set([
  // Bookshelves Bright
  'bookshelves-bright-01', 'bookshelves-bright-02', 'bookshelves-bright-04',
  'bookshelves-bright-06', 'bookshelves-bright-07', 'bookshelves-bright-10',
  'bookshelves-bright-11', 'bookshelves-bright-13', 'bookshelves-bright-19',
  'bookshelves-bright-20', 'bookshelves-bright-23', 'bookshelves-bright-42',
  // Bookshelves Dark
  'bookshelves-dark-02', 'bookshelves-dark-06', 'bookshelves-dark-07',
  'bookshelves-dark-08', 'bookshelves-dark-09', 'bookshelves-dark-25',
  'bookshelves-dark-27', 'bookshelves-dark-28', 'bookshelves-dark-37',
  // Wall Shelves Bright
  'wall-shelves-bright-01', 'wall-shelves-bright-02', 'wall-shelves-bright-03',
  'wall-shelves-bright-05', 'wall-shelves-bright-10', 'wall-shelves-bright-13',
  'wall-shelves-bright-16', 'wall-shelves-bright-17', 'wall-shelves-bright-20',
  'wall-shelves-bright-28', 'wall-shelves-bright-29', 'wall-shelves-bright-51',
  'wall-shelves-bright-54',
  // Wall Shelves Dark
  'wall-shelves-dark-01', 'wall-shelves-dark-02', 'wall-shelves-dark-04',
  'wall-shelves-dark-06', 'wall-shelves-dark-17', 'wall-shelves-dark-19',
  'wall-shelves-dark-28', 'wall-shelves-dark-29', 'wall-shelves-dark-34',
  // Coffee Shops
  'coffee-shop-03', 'coffee-shop-04', 'coffee-shop-10',
  'coffee-shop-12', 'coffee-shop-13', 'coffee-shop-19',
  // Conference Rooms
  'conference-room-01', 'conference-room-02', 'conference-room-03',
  'conference-room-04', 'conference-room-05', 'conference-room-06',
  // Libraries
  'library-17', 'library-33', 'library-34',
  // Urban Lofts
  'urban-loft-10', 'urban-loft-18', 'urban-loft-20', 'urban-loft-26', 'urban-loft-28',
  // Office Spaces
  'office-spaces-01', 'office-spaces-02', 'office-spaces-08',
  'office-spaces-19', 'office-spaces-20', 'office-spaces-28',
  'office-spaces-33', 'office-spaces-35', 'office-spaces-36',
  'office-spaces-38', 'office-spaces-43', 'office-spaces-59',
  'office-spaces-62', 'office-spaces-63', 'office-spaces-66',
  'office-spaces-69', 'office-spaces-71',
  // Home Offices
  'home-offices-01', 'home-offices-03', 'home-offices-04', 'home-offices-05',
  'home-offices-07', 'home-offices-08', 'home-offices-12', 'home-offices-13',
  'home-offices-14', 'home-offices-17', 'home-offices-22', 'home-offices-23',
  'home-offices-28', 'home-offices-29', 'home-offices-30', 'home-offices-31',
  // Nature Landscapes
  'nature-landscape-10', 'nature-landscape-11', 'nature-landscape-14',
  'nature-landscape-18', 'nature-landscape-19', 'nature-landscape-20',
  'nature-landscape-21', 'nature-landscape-22', 'nature-landscape-30',
  'nature-landscape-46', 'nature-landscape-98', 'nature-landscape-99',
  // Living Rooms
  'living-room-10', 'living-room-11', 'living-room-14', 'living-room-17',
  // Kitchens
  'kitchen-04', 'kitchen-05', 'kitchen-06', 'kitchen-14', 'kitchen-15', 'kitchen-16',
  // Gardens & Patios
  'garden-patio-01', 'garden-patio-12', 'garden-patio-14',
  // Christmas
  'christmas-background-35',
  // Easter
  'easter-background-02', 'easter-background-03', 'easter-background-04',
  'easter-background-32', 'easter-background-35', 'easter-background-39',
  'easter-background-42', 'easter-background-48', 'easter-background-49',
  'easter-background-56', 'easter-background-57', 'easter-background-59',
  'easter-background-61', 'easter-background-66', 'easter-background-72',
  'easter-background-73', 'easter-background-74', 'easter-background-75',
  'easter-background-87', 'easter-background-88', 'easter-background-91',
  'easter-background-92', 'easter-background-93', 'easter-background-99',
  'easter-background-101', 'easter-background-106',
]);

export default function HDComparisonHero({ slug, images = [], scores = {} }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hdUrl, setHdUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Find the highest-scored image in this category that has an HD version
  const topImage = [...images]
    .filter(img => HD_BASE_IDS.has(img.filename.replace(/\.\w+$/, '')))
    .sort((a, b) => (scores[b.filename] || 0) - (scores[a.filename] || 0))[0];

  if (!topImage) return null;

  const baseId = topImage.filename.replace(/\.\w+$/, '');
  const hdId = `${baseId}-hd`;
  const freeUrl = cloudinaryUrls[baseId];

  if (!freeUrl) return null;

  const trackCompareClick = () => {
    if (process.env.NODE_ENV !== 'production') return;
    const session = getOrCreateSession();
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cat_page_hd_compare_clicked', {
        event_category: 'Category Page HD Promo',
        event_label: slug,
      });
    }
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'cat_page_hd_compare_clicked',
        filename: hdId,
        category: slug,
        source: 'category_page_hd_promo',
        originalSource: session?.originalUtmSource || (typeof document !== 'undefined' ? (document.referrer || 'direct') : 'direct'),
        sessionId: session?.id || 'unknown',
        visitorId: session?.visitorId || 'unknown',
        pageViewsInSession: session?.pageViews || 0,
        visitorType: getVisitorType(),
        landingPage: session?.landingPage || '',
      }),
    }).catch(() => {});
  };

  const handleCompare = async () => {
    if (hdUrl) { setModalOpen(true); return; }
    setLoading(true);
    trackCompareClick();
    try {
      const res = await fetch(`/api/hd-preview-url?imageId=${hdId}`);
      const data = await res.json();
      if (data.url) {
        setHdUrl(data.url);
        setModalOpen(true);
      }
    } catch (_) {}
    setLoading(false);
  };

  return (
    <>
      <div style={{
        marginTop: '3rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        flexWrap: 'wrap',
      }}>
        {/* Left: text */}
        <div style={{ minWidth: '200px', maxWidth: '300px' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '0.4rem' }}>
            ⭐ HD — See the Difference
          </div>
          <div style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.6' }}>
            Same backgrounds, 2x the resolution.<br />2912×1632 · from $4.99
          </div>
        </div>

        {/* Right: image card with single button */}
        <div
          onClick={handleCompare}
          style={{
            position: 'relative',
            width: '300px',
            flexShrink: 0,
            borderRadius: '0.5rem',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          }}
        >
          <div style={{ aspectRatio: '16/9' }}>
            <img
              src={`/images/${slug}/${topImage.filename}`}
              alt="HD preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.38)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <button style={{
              background: '#FFD700', color: '#000',
              border: 'none', borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontWeight: '700', fontSize: '0.85rem',
              cursor: 'pointer', pointerEvents: 'none',
            }}>
              {loading ? 'Loading...' : '🔍 See HD Quality'}
            </button>
          </div>
        </div>
      </div>

      {modalOpen && hdUrl && (
        <ComparisonWidget
          standardImg={freeUrl}
          hdImg={hdUrl}
          imageId={hdId}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          hdPageUrl={`/hd?category=${slug}`}
        />
      )}
    </>
  );
}
