'use client';

import Link from 'next/link';
import styles from '../../styles/CategoryHub.module.css';

const CDN = 'https://assets.streambackdrops.com/webp';

const RELATED = [
  {
    slug: 'conference-rooms',
    name: 'Conference Rooms',
    tagline: 'Polished boardroom and meeting-room scenes',
    thumb: 'conference-rooms/conference-room-01.webp',
  },
  {
    slug: 'wall-shelves-bright',
    name: 'Bright Wall Shelves',
    tagline: 'Clean, styled shelves with natural light',
    thumb: 'wall-shelves-bright/wall-shelves-bright-01.webp',
  },
  {
    slug: 'bookshelves-bright',
    name: 'Bright Bookshelves',
    tagline: 'Credible, studious — great for interviews',
    thumb: 'bookshelves-bright/bookshelves-bright-01.webp',
  },
];

export default function HubRelatedCategories() {
  return (
    <section className={styles.related}>
      <h2 className={styles.relatedHeading}>Also popular with office-space viewers</h2>
      <div className={styles.relatedGrid}>
        {RELATED.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className={styles.relatedCard}
          >
            <div className={styles.relatedImageWrap}>
              <img
                src={`${CDN}/${cat.thumb}`}
                alt={`${cat.name} virtual backgrounds`}
                loading="lazy"
              />
            </div>
            <div className={styles.relatedBody}>
              <div className={styles.relatedName}>{cat.name}</div>
              <div className={styles.relatedTagline}>{cat.tagline}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
