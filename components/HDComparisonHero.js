'use client';

import { useState } from 'react';
import ComparisonWidget from './ComparisonWidget';
import cloudinaryUrls from '../cloudinary-urls.json';
import { getOrCreateSession, getVisitorType } from '../lib/sessionTracking';
import { HD_BASE_IDS } from '../lib/hdImages';
import { webpUrl } from '../lib/cloudinaryUrl';

export default function HDComparisonHero({ slug, images = [], scores = {} }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hdUrl, setHdUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log('🔵 [HDComparisonHero] Component rendering with slug:', slug);
  console.log('🔵 [HDComparisonHero] modalOpen state:', modalOpen);
  console.log('🔵 [HDComparisonHero] hdUrl state:', hdUrl);
  console.log('🔵 [HDComparisonHero] loading state:', loading);

  // Find the highest-scored image in this category that has an HD version
  const topImage = [...images]
    .filter(img => HD_BASE_IDS.has(img.filename.replace(/\.\w+$/, '')))
    .sort((a, b) => (scores[b.filename] || 0) - (scores[a.filename] || 0))[0];

  console.log('🔵 [HDComparisonHero] topImage found:', topImage?.filename || 'none');

  if (!topImage) {
    console.log('🔵 [HDComparisonHero] No topImage - component returning null');
    return null;
  }

  const baseId = topImage.filename.replace(/\.\w+$/, '');
  const hdId = `${baseId}-hd`;
  const freeUrl = cloudinaryUrls[baseId];

  console.log('🔵 [HDComparisonHero] baseId:', baseId);
  console.log('🔵 [HDComparisonHero] hdId:', hdId);
  console.log('🔵 [HDComparisonHero] freeUrl exists?', !!freeUrl);

  if (!freeUrl) {
    console.log('🔵 [HDComparisonHero] No freeUrl - component returning null');
    return null;
  }

  const trackCompareClick = () => {
    console.log('🔵 [trackCompareClick] Called');
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔵 [trackCompareClick] Not in production - skipping analytics');
      return;
    }
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
    }).catch((err) => console.log('🔵 [trackCompareClick] Fetch error:', err));
  };

  const handleCompare = async () => {
    console.log('🔵 [handleCompare] START - Button clicked!');
    console.log('🔵 [handleCompare] Current hdUrl:', hdUrl);
    console.log('🔵 [handleCompare] Current modalOpen:', modalOpen);
    
    if (hdUrl) { 
      console.log('🔵 [handleCompare] hdUrl exists - opening modal');
      setModalOpen(true); 
      console.log('🔵 [handleCompare] setModalOpen(true) called');
      return; 
    }
    
    console.log('🔵 [handleCompare] No hdUrl yet - fetching from API');
    setLoading(true);
    console.log('🔵 [handleCompare] setLoading(true) called');
    
    trackCompareClick();
    
    try {
      console.log('🔵 [handleCompare] Fetching from API: /api/hd-preview-url?imageId=${hdId}');
      const res = await fetch(`/api/hd-preview-url?imageId=${hdId}`);
      console.log('🔵 [handleCompare] API response status:', res.status);
      
      const data = await res.json();
      console.log('🔵 [handleCompare] API response data:', data);
      
      if (data.url) {
        console.log('🔵 [handleCompare] Setting hdUrl to:', data.url);
        setHdUrl(data.url);
        console.log('🔵 [handleCompare] Opening modal');
        setModalOpen(true);
        console.log('🔵 [handleCompare] setModalOpen(true) called');
      } else {
        console.log('🔵 [handleCompare] No URL in API response');
      }
    } catch (error) {
      console.log('🔵 [handleCompare] API error:', error);
    }
    
    setLoading(false);
    console.log('🔵 [handleCompare] setLoading(false) called');
    console.log('🔵 [handleCompare] END');
  };

  console.log('🔵 [HDComparisonHero] Before return - modalOpen:', modalOpen);
  console.log('🔵 [HDComparisonHero] Before return - hdUrl exists?', !!hdUrl);
  console.log('🔵 [HDComparisonHero] Before return - will render modal?', modalOpen && hdUrl);

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
          onClick={() => {
            console.log('🔵 [Button] Click detected!');
            handleCompare();
          }}
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
              src={webpUrl(slug, topImage.filename)}
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

      {console.log('🔵 [JSX] About to conditionally render modal - modalOpen:', modalOpen, 'hdUrl:', !!hdUrl)}
      {modalOpen && hdUrl && (
        console.log('🔵 [JSX] Rendering ComparisonWidget!') || (
          <ComparisonWidget
            standardImg={freeUrl}
            hdImg={hdUrl}
            imageId={hdId}
            isOpen={modalOpen}
            onClose={() => {
              console.log('🔵 [onClose] Closing modal');
              setModalOpen(false);
            }}
            hdPageUrl={`/hd?category=${slug}`}
          />
        )
      )}
    </>
  );
}