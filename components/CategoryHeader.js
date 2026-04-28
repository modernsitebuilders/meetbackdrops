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
        <p className={styles.description}>{shortDescription}</p>
        <div className={styles.linkRow}>
          <Link href="/hd" className={styles.hdLink}>
            HD Editions for crisper compression →
          </Link>
          <Link href="/licensing" className={styles.licensingLink}>
            Corporate &amp; Team Licensing →
          </Link>
        </div>
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
