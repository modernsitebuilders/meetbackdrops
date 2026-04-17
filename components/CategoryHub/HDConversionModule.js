'use client';

import { useState } from 'react';
import ComparisonWidget from '../ComparisonWidget';
import PostCompareModal from '../PostCompareModal';
import { HD_BASE_IDS } from '../../lib/hdImages';
import { webpUrl } from '../../lib/cloudinaryUrl';
import styles from '../../styles/CategoryHub.module.css';

export default function HDConversionModule({ slug, images = [], scores = {}, onCompareClick }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hdUrl, setHdUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sliderUsed, setSliderUsed] = useState(false);
  const [postCompareOpen, setPostCompareOpen] = useState(false);

  const topImage = [...images]
    .filter((img) => HD_BASE_IDS.has(img.filename.replace(/\.\w+$/, '')))
    .sort((a, b) => (scores[b.filename] || 0) - (scores[a.filename] || 0))[0];

  if (!topImage) {
    if (typeof window !== 'undefined') {
      console.warn(`[CategoryHub] HDConversionModule: no HD variants for slug="${slug}". Module hidden.`);
    }
    return null;
  }

  const baseId = topImage.filename.replace(/\.\w+$/, '');
  const hdId = `${baseId}-hd`;
  const freeUrl = webpUrl(slug, topImage.filename);

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
    onCompareClick && onCompareClick(topImage.filename);
    setSliderUsed(false);
    if (hdUrl) {
      setModalOpen(true);
      return;
    }
    setLoading(true);
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
    <section className={styles.hdModule}>
      <div className={styles.hdCopy}>
        <div className={styles.hdEyebrow}>Before your next client call</div>
        <h2 className={styles.hdHeading}>
          The version of you a client signs a contract with.
        </h2>
        <p className={styles.hdLead}>
          The free backgrounds on this page are good. They&apos;re fine for internal standups,
          team chats, anything casual. But the moment someone on the call is deciding whether
          to trust you with money — they&apos;re looking past you at the room, and the room is
          being judged whether they mean to or not.
        </p>
        <ul className={styles.hdBenefits}>
          <li>Your client has a 4K monitor. Your free background looks like a Zoom from 2020 on it. HD holds up to their screen.</li>
          <li>The first 5 seconds decide the meeting. They see the room before they hear the pitch. Make sure it&apos;s saying what you want it to.</li>
          <li>Record it, post it, reframe it. HD crops cleanly — no &ldquo;why does this look grainy?&rdquo; DMs after you share the clip.</li>
        </ul>
        <p className={styles.hdQualifier}>
          If this is a standup or a hangout, keep the free one. If it&apos;s a pitch, a discovery
          call, an interview, or anyone who can sign a contract — use HD.
        </p>
        <div className={styles.hdCtaRow}>
          <button
            type="button"
            onClick={handleCompare}
            className={styles.hdCompareBtn}
            disabled={loading}
          >
            {loading ? 'Loading preview…' : 'See the difference side-by-side'}
          </button>
          <a href={`/hd?category=${slug}`} className={styles.hdShopBtn}>
            See all office-space HD backgrounds →
          </a>
        </div>
        <div className={styles.hdFootnote}>
          2912 × 1632 · from $4.99 · keep forever, no subscription
        </div>
      </div>

      <button
        type="button"
        onClick={handleCompare}
        className={styles.hdPreview}
        aria-label="Open HD comparison"
      >
        <img
          src={webpUrl(slug, topImage.filename)}
          alt="Preview of the HD comparison"
          loading="lazy"
        />
        <span className={styles.hdPreviewOverlay}>
          {loading ? 'Loading…' : '🔍 See HD Quality'}
        </span>
      </button>

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
    </section>
  );
}
