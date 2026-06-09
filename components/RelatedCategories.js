import Link from 'next/link';
import { CATEGORIES } from '../lib/categories-config';
import styles from '../styles/RelatedCategories.module.css';

const CDN = 'https://assets.streambackdrops.com/webp';

// First reliable image per category (derived from final_manifest.json)
const THUMBNAILS = {
  'art-galleries':        'art-galleries/three-framed-empty-canvases-textured-brown-wall-polished-d776d887.webp',
  'bokeh-backgrounds':    'bokeh-backgrounds/blurred-composition-soft-white-bokeh-circles-against-subtle-d2b7eaf6.webp',
  'bookshelves':          'bookshelves-bright/well-lit-modern-boardroom-wooden-floor-framed-artwork-wall-cadb4573.webp',
  'christmas-backgrounds':'christmas-backgrounds/chesterfield-sofa-burgundy-cushions-rustic-coffee-table-925f5cdc.webp',
  'coffee-shops':         'coffee-shops/coffee-shop-counter-wooden-wall-espresso-machine-warm-03587c30.webp',
  'easter-backgrounds':   'easter-backgrounds/three-shelves-display-pastel-vases-tulips-white-bunny-basket-f7f6f9bc.webp',
  'gardens-patios':       'gardens-patios/serene-corner-blue-white-walls-terracotta-pots-vibrant-1959e32a.webp',
  'halloween-backgrounds':'halloween-backgrounds/cozy-brick-fireplace-wreath-autumn-leaves-candles-pumpkins-a9bbf1bf.webp',
  'historic-spaces':      'historic-spaces/spacious-grand-hall-arched-windows-soft-lighting-wooden-5d78268c.webp',
  'home-office':          'home-office/cozy-home-office-wooden-desk-computer-displaying-landscape-d79a8759.webp',
  'kitchens':             'kitchens/rustic-kitchen-counter-greenery-plaid-solid-textiles-warm-69f5b180.webp',
  'libraries':            'libraries/grand-library-dark-wooden-shelves-filled-books-warm-lighting-b14c9fb4.webp',
  'living-rooms':         'living-rooms/bright-living-room-white-sofa-coffee-table-large-windows-20f07bbe.webp',
  'neutral-backgrounds':  'neutral-backgrounds/seamless-video-call-background-d4a783bf.webp',
  'nature-landscapes':    'nature-landscapes/wooden-deck-railing-overlooking-snow-covered-mountains-under-7fabcb70.webp',
  'office-spaces':        'office-spaces/boardroom-wooden-table-chairs-bookshelves-illuminated-45b44bc0.webp',
  'spring-backgrounds':   'spring-backgrounds/wooden-shelf-collection-vintage-books-vase-fresh-flowers-1d3f1286.webp',
  'summer-backgrounds':   'summer-backgrounds/coastal-living-room-white-sofas-blue-cushions-wooden-coffee-cdc74411.webp',
  'urban-lofts':          'urban-lofts/spacious-studio-large-arched-windows-city-skyline-visible-a68fd77c.webp',
  'wall-shelves':         'wall-shelves-bright/two-wooden-shelves-against-white-wall-one-books-plant-other-d50bd43b.webp',
  'valentines-backgrounds':'valentines-backgrounds/cozy-library-dark-wooden-shelves-filled-books-soft-pink-7d9fe040.webp',
};

// Semantic adjacency — every category gets 3 meaningful links
const RELATED = {
  'bookshelves':           ['wall-shelves',          'libraries',              'home-office'],
  'wall-shelves':          ['bookshelves',           'office-spaces',          'home-office'],
  'office-spaces':         ['home-office',           'neutral-backgrounds',    'bookshelves'],
  'home-office':           ['office-spaces',         'neutral-backgrounds',    'living-rooms'],
  'neutral-backgrounds':   ['office-spaces',         'home-office',            'wall-shelves'],
  'living-rooms':          ['home-office',           'kitchens',               'coffee-shops'],
  'kitchens':              ['living-rooms',          'coffee-shops',           'gardens-patios'],
  'coffee-shops':          ['kitchens',              'living-rooms',           'urban-lofts'],
  'art-galleries':         ['urban-lofts',           'historic-spaces',        'bookshelves'],
  'urban-lofts':           ['art-galleries',         'coffee-shops',           'office-spaces'],
  'gardens-patios':        ['nature-landscapes',     'spring-backgrounds',     'easter-backgrounds'],
  'historic-spaces':       ['art-galleries',         'libraries',              'bookshelves'],
  'nature-landscapes':     ['gardens-patios',        'bokeh-backgrounds',      'spring-backgrounds'],
  'libraries':             ['bookshelves',           'wall-shelves',           'historic-spaces'],
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
