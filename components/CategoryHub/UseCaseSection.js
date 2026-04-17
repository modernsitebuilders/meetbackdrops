'use client';

import { webpUrl } from '../../lib/cloudinaryUrl';
import styles from '../../styles/CategoryHub.module.css';

export default function UseCaseSection({
  slug,
  icon,
  heading,
  copy,
  ctaLabel,
  images = [],
  onImageClick,
  onDownload,
  onCtaClick,
  downloadingImage,
}) {
  if (!images.length) return null;

  return (
    <section className={styles.useCase}>
      <div className={styles.useCaseHeader}>
        <h2 className={styles.useCaseHeading}>
          <span className={styles.useCaseIcon} aria-hidden>{icon}</span>
          {heading}
        </h2>
        <p className={styles.useCaseCopy}>{copy}</p>
      </div>

      <div className={styles.useCaseGrid}>
        {images.map((image) => {
          const isDownloading = downloadingImage === image.filename;
          return (
            <div key={image.filename} className={styles.useCaseCard}>
              <button
                type="button"
                className={styles.useCaseImageButton}
                onClick={() => onImageClick && onImageClick(image)}
                aria-label={`Preview ${image.title}`}
              >
                <img
                  src={webpUrl(slug, image.filename)}
                  alt={`${image.title} — ${heading.toLowerCase()} virtual background`}
                  loading="lazy"
                />
              </button>
              <button
                type="button"
                className={styles.useCaseDownload}
                disabled={!!downloadingImage}
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload && onDownload(image);
                }}
              >
                {isDownloading ? 'Downloading…' : 'Download'}
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.useCaseFooter}>
        <button
          type="button"
          className={styles.useCaseCta}
          onClick={onCtaClick}
        >
          {ctaLabel} →
        </button>
      </div>
    </section>
  );
}
