import Link from 'next/link';
import { CATEGORIES } from '../lib/categories-config';
import styles from '../styles/RelatedCategories.module.css';

const CDN = 'https://assets.streambackdrops.com/webp';

// First reliable image per category (derived from final_manifest.json)
const THUMBNAILS = {
  'art-galleries':        'art-galleries/art-gallery-01.webp',
  'bokeh-backgrounds':    'bokeh-backgrounds/bokeh-03.webp',
  'bookshelves':          'bookshelves-bright/bookshelves-bright-01.webp',
  'christmas-backgrounds':'christmas-backgrounds/christmas-background-01.webp',
  'coffee-shops':         'coffee-shops/coffee-shop-01.webp',
  'conference-rooms':     'conference-rooms/conference-room-01.webp',
  'easter-backgrounds':   'easter-backgrounds/easter-background-03.webp',
  'gardens-patios':       'gardens-patios/garden-patio-14.webp',
  'halloween-backgrounds':'halloween-backgrounds/halloween-background-01.webp',
  'historic-spaces':      'historic-spaces/historic-space-02.webp',
  'home-office':          'home-office/home-offices-01.webp',
  'kitchens':             'kitchens/kitchen-01.webp',
  'libraries':            'libraries/library-03.webp',
  'living-rooms':         'living-rooms/living-room-01.webp',
  'nature-landscapes':    'nature-landscapes/nature-landscape-1.webp',
  'office-spaces':        'office-spaces/office-spaces-01.webp',
  'spring-backgrounds':   'spring-backgrounds/spring-background-01.webp',
  'summer-backgrounds':   'summer-backgrounds/summer-background-01.webp',
  'urban-lofts':          'urban-lofts/urban-loft-01.webp',
  'wall-shelves':         'wall-shelves-bright/wall-shelves-bright-01.webp',
  'valentines-backgrounds':'valentines-backgrounds/valentines-background-01.webp',
};

// Semantic adjacency — every category gets 3 meaningful links
const RELATED = {
  'bookshelves':           ['wall-shelves',          'libraries',              'home-office'],
  'wall-shelves':          ['bookshelves',           'office-spaces',          'home-office'],
  'office-spaces':         ['home-office',           'conference-rooms',       'bookshelves'],
  'home-office':           ['office-spaces',         'bookshelves',            'living-rooms'],
  'living-rooms':          ['home-office',           'kitchens',               'coffee-shops'],
  'kitchens':              ['living-rooms',          'coffee-shops',           'gardens-patios'],
  'coffee-shops':          ['kitchens',              'living-rooms',           'urban-lofts'],
  'art-galleries':         ['urban-lofts',           'historic-spaces',        'bookshelves'],
  'urban-lofts':           ['art-galleries',         'coffee-shops',           'office-spaces'],
  'gardens-patios':        ['nature-landscapes',     'spring-backgrounds',     'easter-backgrounds'],
  'historic-spaces':       ['art-galleries',         'libraries',              'bookshelves'],
  'nature-landscapes':     ['gardens-patios',        'bokeh-backgrounds',      'spring-backgrounds'],
  'libraries':             ['bookshelves',           'wall-shelves',           'historic-spaces'],
  'conference-rooms':      ['office-spaces',         'home-office',            'libraries'],
  'christmas-backgrounds': ['halloween-backgrounds', 'bokeh-backgrounds',      'living-rooms'],
  'halloween-backgrounds': ['christmas-backgrounds', 'historic-spaces',        'urban-lofts'],
  'valentines-backgrounds':['bokeh-backgrounds',     'gardens-patios',         'spring-backgrounds'],
  'easter-backgrounds':    ['spring-backgrounds',    'gardens-patios',         'nature-landscapes'],
  'spring-backgrounds':    ['easter-backgrounds',    'summer-backgrounds',     'gardens-patios'],
  'summer-backgrounds':    ['spring-backgrounds',    'gardens-patios',         'nature-landscapes'],
  'bokeh-backgrounds':     ['art-galleries',         'valentines-backgrounds', 'nature-landscapes'],
};

export default function RelatedCategories({ currentSlug }) {
  const relatedSlugs = RELATED[currentSlug] ||
    Object.keys(CATEGORIES).filter(s => s !== currentSlug).slice(0, 3);

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Customers Also Browsed</h3>
      <div className={styles.grid}>
        {relatedSlugs.map((slug) => {
          const cat = CATEGORIES[slug];
          const thumb = THUMBNAILS[slug];
          if (!cat || !thumb) return null;
          return (
            <Link key={slug} href={`/category/${slug}`} className={styles.card}>
              <div className={styles.imageContainer}>
                <img
                  src={`${CDN}/${thumb}`}
                  alt={`${cat.name} virtual backgrounds`}
                  loading="lazy"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
              <div className={styles.content}>
                <h4 className={styles.title}>{cat.name}</h4>
                <p className={styles.description}>{cat.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
