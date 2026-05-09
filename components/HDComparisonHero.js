'use client';

import { useState } from 'react';
import ComparisonWidget from './ComparisonWidget';
import PostCompareModal from './PostCompareModal';
import { getOrCreateSession, getVisitorType } from '../lib/sessionTracking';
import { HD_BASE_IDS } from '../lib/hdProducts';
import { webpUrl } from '../lib/cloudinaryUrl';

export default function HDComparisonHero({ slug, images = [], scores = {} }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hdUrl, setHdUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sliderUsed, setSliderUsed] = useState(false);
  const [postCompareOpen, setPostCompareOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // office-spaces: always use the fixed comparison pair
  let baseId, hdId, imageFolder, freeUrl;
  if (slug === 'office-spaces') {
    const fixedFilename = 'office-spaces-36.webp';
    const fixedImage = images.find(img => img.filename === fixedFilename);
    if (!fixedImage) {
      console.warn('[HDComparisonHero] office-spaces-36.webp not found in images array. Promo hidden.');
      return null;
    }
    baseId = 'office-spaces-36';
    hdId = 'office-spaces-36-hd';
    imageFolder = fixedImage.folder || slug;
    freeUrl = webpUrl(imageFolder, fixedFilename);
  } else {
    // Find the highest-scored image in this category that has an HD version
    const topImage = [...images]
      .filter(img => HD_BASE_IDS.has(img.filename.replace(/\.\w+$/, '')))
      .sort((a, b) => (scores[b.filename] || 0) - (scores[a.filename] || 0))[0];

    if (!topImage) {
      if (typeof window !== 'undefined') {
        console.warn(`[HDComparisonHero] No HD variants for slug="${slug}". Promo hidden.`);
      }
      return null;
    }

    baseId = topImage.filename.replace(/\.\w+$/, '');
    hdId = `${baseId}-hd`;
    imageFolder = topImage.folder || slug;
    freeUrl = webpUrl(imageFolder, topImage.filename);
  }

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

  const sessionFlagKey = `sb_post_compare_shown_${baseId}`;

  const handleComparisonClose = () => {
    setModalOpen(false);
    const alreadyShown =
      typeof window !== 'undefined' && window.sessionStorage.getItem(sessionFlagKey);
    if (sliderUsed && !alreadyShown) {
      try {
        window.sessionStorage.setItem(sessionFlagKey, '1');
      } catch (_) {}
      setPostCompareOpen(true);
    }
    setSliderUsed(false);
  };

  const handleCompare = async () => {
    setSliderUsed(false);
    if (hdUrl) {
      setModalOpen(true);
      return;
    }

    setLoading(true);
    trackCompareClick();

    try {
      const res = await fetch(`/api/hd-preview-url?imageId=${hdId}`);
      const data = await res.json();
      if (data.url) {
        setHdUrl(data.url);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('HD preview fetch error:', error);
    }

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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
              src={freeUrl}
              alt="HD preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          {isHovered && (
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
          )}
        </div>
      </div>

      {modalOpen && hdUrl && (
        <ComparisonWidget
          standardImg={freeUrl}
          hdImg={hdUrl}
          imageId={hdId}
          isOpen={modalOpen}
          onClose={handleComparisonClose}
          hdPageUrl={`/hd?category=${slug}`}
          onSliderUse={() => setSliderUsed(true)}
        />
      )}

      <PostCompareModal
        isOpen={postCompareOpen}
        imageId={baseId}
        slug={slug}
        primaryHref={`/hd?highlight=${baseId}`}
        secondaryHref={`/hd?category=${slug}`}
        onClose={() => setPostCompareOpen(false)}
      />
    </>
  );
}
