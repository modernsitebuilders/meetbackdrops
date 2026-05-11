// components/CategoryHeader.js
//
// PRESENTATIONAL ONLY. Receives all text as props. Has no awareness of the
// category catalog and constructs no SEO strings. The h1 string must come
// from `resolveSEO()` via the SEO contract pipeline; passing anything else
// is a contract violation and throws at render time.
//
// Do not add fallbacks here. The contract is the source of truth.

import Link from 'next/link';
import styles from '../styles/CategoryHeader.module.css';

export default function CategoryHeader({ h1, eyebrow, description, featuredImageUrl }) {
  if (typeof h1 !== 'string' || h1.length === 0) {
    throw new Error('CategoryHeader: `h1` prop is required (must come from resolveSEO).');
  }
  if (typeof eyebrow !== 'string' || eyebrow.length === 0) {
    throw new Error('CategoryHeader: `eyebrow` prop is required.');
  }

  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h1 className={styles.title}>{h1}</h1>
        <div className={styles.priceChip}>Free downloads · HD editions from $4.99</div>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.linkRow}>
          <Link href="/hd" className={styles.hdLink}>
            HD Editions for crisper compression →
          </Link>
          <Link href="/branded-backgrounds" className={styles.licensingLink}>
            Branded Backgrounds for Brands →
          </Link>
        </div>
      </div>
      {featuredImageUrl && (
        <img
          src={featuredImageUrl}
          alt=""
          className={styles.featured}
          loading="lazy"
        />
      )}
    </div>
  );
}
