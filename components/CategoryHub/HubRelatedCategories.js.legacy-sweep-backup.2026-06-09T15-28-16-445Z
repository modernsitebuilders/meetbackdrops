'use client';

import Link from 'next/link';
import styles from '../../styles/CategoryHub.module.css';

const CDN = 'https://assets.streambackdrops.com/webp';

const RELATED = [
  {
    slug: 'bookshelves',
    name: 'Bookshelves',
    tagline: 'Books on the shelf — credible and studious',
    thumb: 'bookshelves-bright/bookshelves-bright-01.webp',
  },
  {
    slug: 'home-office',
    name: 'Home Offices',
    tagline: 'Warm work-from-home setups — professional but personal',
    thumb: 'home-office/home-offices-63.webp',
  },
  {
    slug: 'urban-lofts',
    name: 'Urban Lofts',
    tagline: 'Industrial-modern spaces — exposed brick, clean edges',
    thumb: 'urban-lofts/urban-loft-20.webp',
  },
];

export default function HubRelatedCategories() {
  return (
    <section className={styles.related}>
      <h2 className={styles.relatedHeading}>Also popular with wall-shelf viewers</h2>
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
