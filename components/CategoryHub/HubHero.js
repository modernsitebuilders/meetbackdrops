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
          Office Space Virtual Backgrounds
          <span className={styles.heroTitleSub}>HD for Zoom &amp; Remote Work</span>
        </h1>
        <p className={styles.heroSubhead}>
          Professional, clean, modern workspace backgrounds — designed for video calls,
          not cropped from stock photos.
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
            src={webpUrl(slug, lead.filename)}
            alt={`${lead.title} — featured office virtual background`}
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
                src={webpUrl(slug, img.filename)}
                alt={`${img.title} — office background preview`}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
