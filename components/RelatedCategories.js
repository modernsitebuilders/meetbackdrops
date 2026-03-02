// components/RelatedCategories.js
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/RelatedCategories.module.css';

const RELATED_MAP = {
  'office-spaces': [
    { slug: 'home-office', name: 'Home Offices', desc: 'Cozy work-from-home settings', img: '/images/home-office/home-offices-05.webp' },
    { slug: 'bookshelves-dark', name: 'Bookshelves - Dark', desc: 'Professional library look', img: '/images/bookshelves-dark/bookshelves-dark-02.webp' },
    { slug: 'libraries', name: 'Libraries', desc: 'Sophisticated meeting background', img: '/images/libraries/library-01.webp' }
  ],
  'home-office': [
    { slug: 'office-spaces', name: 'Office Spaces', desc: 'More formal corporate settings', img: '/images/office-spaces/office-spaces-01.webp' },
    { slug: 'bookshelves-bright', name: 'Bookshelves - Bright', desc: 'Warm, approachable setting', img: '/images/bookshelves-bright/bookshelves-bright-02.webp' },
    { slug: 'living-rooms', name: 'Living Rooms', desc: 'Comfortable home backgrounds', img: '/images/living-rooms/living-room-12.webp' }
  ],
  'bookshelves-bright': [
    { slug: 'libraries', name: 'Libraries', desc: 'Classic study atmosphere', img: '/images/libraries/library-01.webp' },
    { slug: 'home-office', name: 'Home Offices', desc: 'Cozy work-from-home setting', img: '/images/home-office/home-offices-05.webp' },
    { slug: 'bookshelves-dark', name: 'Bookshelves - Dark', desc: 'Ambient evening lighting', img: '/images/bookshelves-dark/bookshelves-dark-02.webp' }
  ],
  'bookshelves-dark': [
    { slug: 'libraries', name: 'Libraries', desc: 'Classic study atmosphere', img: '/images/libraries/library-01.webp' },
    { slug: 'home-office', name: 'Home Offices', desc: 'Cozy work-from-home setting', img: '/images/home-office/home-offices-05.webp' },
    { slug: 'bookshelves-bright', name: 'Bookshelves - Bright', desc: 'Bright daytime setting', img: '/images/bookshelves-bright/bookshelves-bright-02.webp' }
  ],
  'libraries': [
    { slug: 'bookshelves-dark', name: 'Bookshelves - Dark', desc: 'Similar intimate atmosphere', img: '/images/bookshelves-dark/bookshelves-dark-02.webp' },
    { slug: 'bookshelves-bright', name: 'Bookshelves - Bright', desc: 'Brighter book collection', img: '/images/bookshelves-bright/bookshelves-bright-02.webp' },
    { slug: 'office-spaces', name: 'Office Spaces', desc: 'Modern professional look', img: '/images/office-spaces/office-spaces-01.webp' }
  ]
};

// Default for all other categories
const DEFAULT_RELATED = [
  { slug: 'office-spaces', name: 'Office Spaces', desc: 'Professional business backgrounds', img: '/images/office-spaces/office-spaces-01.webp' },
  { slug: 'home-office', name: 'Home Offices', desc: 'Cozy work-from-home settings', img: '/images/home-office/home-offices-05.webp' },
  { slug: 'bookshelves-bright', name: 'Bookshelves - Bright', desc: 'Warm, intellectual setting', img: '/images/bookshelves-bright/bookshelves-bright-02.webp' }
];

export default function RelatedCategories({ currentSlug }) {
  const related = RELATED_MAP[currentSlug] || DEFAULT_RELATED;

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Customers Also Browsed</h3>
      
      <div className={styles.grid}>
        {related.map((cat) => (
          <Link key={cat.slug} href={`/category/${cat.slug}`} className={styles.card}>
            <div className={styles.imageContainer}>
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.content}>
              <h4 className={styles.title}>{cat.name}</h4>
              <p className={styles.description}>{cat.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}