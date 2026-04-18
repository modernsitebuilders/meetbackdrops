// components/CategoryHeader.js
import Link from 'next/link';
import styles from '../styles/CategoryHeader.module.css';

export default function CategoryHeader({ category, featuredImageUrl }) {
  const name = category?.name || 'Virtual';
  const shortDescription =
    category?.shortDescription ||
    `Professional ${name.toLowerCase()} scenes for Zoom, Teams, and Google Meet. Instant download, no signup.`;

  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <h1 className={styles.title}>Free {name} Virtual Backgrounds</h1>
        <p className={styles.description}>{shortDescription}</p>
        <Link href="/hd" className={styles.hdLink}>
          Need higher resolution? Explore HD backgrounds →
        </Link>
      </div>
      {featuredImageUrl && (
        <img
          src={featuredImageUrl}
          alt=""
          aria-hidden="true"
          className={styles.featured}
          loading="lazy"
        />
      )}
    </div>
  );
}
