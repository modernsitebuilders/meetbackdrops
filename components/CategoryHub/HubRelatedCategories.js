'use client';

import Link from 'next/link';
import styles from '../../styles/CategoryHub.module.css';

const CDN = 'https://assets.streambackdrops.com/webp';

const RELATED = [
  {
    slug: 'bookshelves',
    name: 'Bookshelves',
    tagline: 'Books on the shelf — credible and studious',
    thumb: 'bookshelves-bright/well-lit-modern-boardroom-wooden-floor-framed-artwork-wall-cadb4573.webp',
  },
  {
    slug: 'home-office',
    name: 'Home Offices',
    tagline: 'Warm work-from-home setups — professional but personal',
    thumb: 'home-office/bright-home-office-white-desk-chair-large-windows-sheer-48445820.webp',
  },
  {
    slug: 'urban-lofts',
    name: 'Urban Lofts',
    tagline: 'Industrial-modern spaces — exposed brick, clean edges',
    thumb: 'urban-lofts/industrial-interior-green-accent-wall-large-windows-potted-60c0bbc9.webp',
  },
];

export default function HubRelatedCategories() {
  return (
    <section className={styles.related}>
      <h2 className={styles.relatedHeading}>Also popular with wall-shelf viewers</h2>
      <div className={styles.relatedGrid}>
        {RELATED.map((cat) => (
          <Link prefetch={false}
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
