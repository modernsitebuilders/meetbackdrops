'use client';

import { useState } from 'react';
import ComparisonWidget from './ComparisonWidget';
import PostCompareModal from './PostCompareModal';
import { trackEvent } from '../lib/trackEvent';
import { HD_BASE_IDS } from '../lib/hdProducts';
import { isHdOnlyFilename } from '../lib/hdOnly';
import { webpUrl } from '../lib/cloudinaryUrl';

// ImageGrid renders free images sorted by score into a
// `repeat(auto-fill, minmax(260px, 1fr))` grid — up to 4 across on desktop, 1 on
// mobile. The promo used the same sort, so it kept picking the image the grid
// already leads with, stacking the same picture twice.
const GRID_LEAD_SLOTS = 4;

export default function HDComparisonHero({ slug, images = [], scores = {} }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hdUrl, setHdUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sliderUsed, setSliderUsed] = useState(false);
  const [postCompareOpen, setPostCompareOpen] = useState(false);

  // office-spaces: always use the fixed comparison pair
  let baseId, hdId, imageFolder, freeUrl;
  if (slug === 'office-spaces') {
    const fixedFilename = 'bright-boardroom-large-oval-table-white-chairs-glass-walls-6c61e55f.webp';
    const fixedImage = images.find(img => img.filename === fixedFilename);
    if (!fixedImage) {
      console.warn('[HDComparisonHero] bright-boardroom-large-oval-table-white-chairs-glass-walls-6c61e55f.webp not found in images array. Promo hidden.');
      return null;
    }
    baseId = 'bright-boardroom-large-oval-table-white-chairs-glass-walls-6c61e55f';
    hdId = 'bright-boardroom-large-oval-table-white-chairs-glass-walls-6c61e55f-hd';
    imageFolder = fixedImage.folder || slug;
    freeUrl = webpUrl(imageFolder, fixedFilename);
  } else {
    const score = (img) => scores[img.filename] || 0;

    // Mirror ImageGrid's ordering so we know which images open the grid.
    const leadRow = new Set(
      images
        .filter(img => !isHdOnlyFilename(img.filename))
        .sort((a, b) => score(b) - score(a))
        .slice(0, GRID_LEAD_SLOTS)
        .map(img => img.filename)
    );

    const hdCandidates = [...images]
      .filter(img => HD_BASE_IDS.has(img.filename.replace(/\.\w+$/, '')))
      .sort((a, b) => score(b) - score(a));

    // Prefer the best HD image the grid isn't already showing up top. Thin
    // categories fall back to the best candidate — a duplicate beats no promo.
    const topImage = hdCandidates.find(img => !leadRow.has(img.filename)) || hdCandidates[0];

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
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cat_page_hd_compare_clicked', {
        event_category: 'Category Page HD Promo',
        event_label: slug,
      });
    }
    // Was a hand-rolled POST that passed `source: 'category_page_hd_promo'` —
    // /api/analytics persists only its fixed field list, so that field was
    // silently dropped on every click. Nothing is lost by removing it: the
    // surface is already encoded in the event name. Going through trackEvent
    // also fixes a subtler drift — the old inline originalSource used only
    // originalUtmSource and fell back to the CURRENT document.referrer, where
    // every other surface builds source/medium/campaign and falls back to the
    // session's ORIGINAL referrer — and adds the missing downloadsInSession.
    trackEvent('cat_page_hd_compare_clicked', hdId, slug);
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
            Same background, full resolution — crisp in recordings, edits &amp; crops.<br />2912×1632 · from $4.99
          </div>
        </div>

        {/* Right: image card — the whole card is the control */}
        <button
          type="button"
          className="hd-promo-card"
          onClick={handleCompare}
          aria-label="Compare this background in free and HD quality"
        >
          <div style={{ aspectRatio: '16/9' }}>
            <img
              src={freeUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <span className="hd-promo-overlay">
            <span className="hd-promo-cta">
              {loading ? 'Loading...' : '🔍 See HD Quality'}
            </span>
          </span>
        </button>
      </div>

      <style jsx>{`
        .hd-promo-card {
          position: relative;
          width: 300px;
          flex-shrink: 0;
          padding: 0;
          border: none;
          background: none;
          font: inherit;
          display: block;
          border-radius: 0.5rem;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
        }
        .hd-promo-cta {
          background: #FFD700;
          color: #000;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-weight: 700;
          font-size: 0.85rem;
        }

        /* Touch / no-hover: the CTA is always visible, sitting on a bottom
           gradient so it never hides the background it is selling. */
        .hd-promo-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 0.75rem;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0) 55%);
        }

        /* Pointer devices keep the original hover reveal. */
        @media (hover: hover) {
          .hd-promo-overlay {
            align-items: center;
            padding-bottom: 0;
            background: rgba(0, 0, 0, 0.38);
            opacity: 0;
            transition: opacity 0.15s ease;
          }
          .hd-promo-card:hover .hd-promo-overlay,
          .hd-promo-card:focus-visible .hd-promo-overlay {
            opacity: 1;
          }
        }
      `}</style>

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
