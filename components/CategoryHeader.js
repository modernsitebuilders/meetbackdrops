// components/CategoryHeader.js
import Link from 'next/link';
import styles from '../styles/CategoryHeader.module.css';

export default function CategoryHeader({ category, featuredImageUrl }) {
  const name = category?.name || 'Virtual';
  const shortDescription =
    category?.shortDescription ||
    `Studio-designed ${name.toLowerCase()} backgrounds for video calls on Zoom, Teams, and Google Meet.`;

  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <div className={styles.eyebrow}>The Collection · {name}</div>
        <h1 className={styles.title}>{name} Virtual Backgrounds</h1>
        <div className={styles.priceChip}>Free downloads · HD editions from $4.99</div>
        <p className={styles.description}>{shortDescription}</p>
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
          alt={`Featured ${name} virtual background`}
          className={styles.featured}
          loading="lazy"
        />
      )}
    </div>
  );
}
