'use client';

// PRESENTATIONAL ONLY. Receives h1, subhead, and image list as props. No
// category-catalog lookup, no string concatenation, no fallback copy. The
// h1 string must come from `resolveSEO()` via SEOBoundary.

import { webpUrl } from '../../lib/cloudinaryUrl';
import styles from '../../styles/CategoryHub.module.css';

export default function HubHero({ h1, subhead, slug, images = [], onCtaClick, onImageClick }) {
  if (typeof h1 !== 'string' || h1.length === 0) {
    throw new Error('HubHero: `h1` prop is required (must come from resolveSEO).');
  }
  if (typeof subhead !== 'string' || subhead.length === 0) {
    throw new Error('HubHero: `subhead` prop is required.');
  }

  const [lead, ...rest] = images;
  if (!lead) return null;

  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1 className={styles.heroTitle}>{h1}</h1>
        <p className={styles.heroSubhead}>{subhead}</p>
        <button
          type="button"
          onClick={onCtaClick}
          className={styles.heroCta}
        >
          See HD Backgrounds ↓
        </button>
        <div className={styles.heroTrust}>
          <span>✓ Instant download</span>
          <span>✓ No watermarks</span>
          <span>✓ 16:9 video-ready</span>
        </div>
      </div>

      <div className={styles.heroGallery}>
        <button
          type="button"
          className={styles.heroLead}
          onClick={() => onImageClick && onImageClick(lead)}
          aria-label={`Preview ${lead.title}`}
        >
          <img
            src={webpUrl(lead.folder || slug, lead.filename)}
            alt={lead.title || ''}
            loading="eager"
          />
        </button>
        <div className={styles.heroThumbs}>
          {rest.slice(0, 4).map((img) => (
            <button
              key={img.filename}
              type="button"
              className={styles.heroThumb}
              onClick={() => onImageClick && onImageClick(img)}
              aria-label={`Preview ${img.title}`}
            >
              <img
                src={webpUrl(img.folder || slug, img.filename)}
                alt={img.title || ''}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
