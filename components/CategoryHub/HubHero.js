'use client';

import { webpUrl } from '../../lib/cloudinaryUrl';
import styles from '../../styles/CategoryHub.module.css';

export default function HubHero({ slug, images = [], onCtaClick, onImageClick }) {
  const [lead, ...rest] = images;
  if (!lead) return null;

  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1 className={styles.heroTitle}>
          Wall Shelf Virtual Backgrounds
          <span className={styles.heroTitleSub}>HD for Zoom, Teams &amp; Google Meet</span>
        </h1>
        <p className={styles.heroSubhead}>
          Studio-styled wall shelves — designed shelf by shelf for camera,
          not lifted from a stock library.
        </p>
        <button
          type="button"
          onClick={onCtaClick}
          className={styles.heroCta}
        >
          Download HD Backgrounds →
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
            alt={`${lead.title} — featured wall-shelf virtual background`}
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
                alt={`${img.title} — wall-shelf background preview`}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
