import { useEffect, useMemo } from 'react';
import { HD_PRODUCTS, HD_BASE_IDS } from '../lib/hdProducts';
import { trackEvent } from '../lib/trackEvent';

const CDN = 'https://assets.streambackdrops.com';
const MAX_SIMILAR = 3;

// HD_PRODUCTS.category is the R2 folder (bookshelves-bright, not bookshelves),
// so match on the folder first and fall back to the merged parent category.
function similarHd(slug, category, folder) {
  const inFolder = HD_PRODUCTS.filter(
    (p) => p.category === folder || p.category === category || p.category.startsWith(`${category}-`)
  ).filter((p) => p.id !== `${slug}-hd`);
  if (!inFolder.length) return [];
  // Rotate by the downloaded slug so repeat downloads don't always show the
  // same three, while one render stays stable.
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const start = h % inFolder.length;
  const picked = [];
  for (let i = 0; i < Math.min(MAX_SIMILAR, inFolder.length); i++) {
    picked.push(inFolder[(start + i) % inFolder.length]);
  }
  return picked;
}

// What the post-download card offers, in priority order:
//   1. this exact image has an HD Edition → offer it
//   2. otherwise → up to 3 HD Editions from the same category
//   3. category has no HD at all → nothing (card stays a plain rating prompt)
export function getDownloadOffer(download) {
  if (!download?.filename) return null;
  const slug = download.filename.replace(/\.(webp|png|jpe?g)$/i, '');
  if (HD_BASE_IDS.has(slug)) return { kind: 'exact', slug, category: download.category };
  const items = similarHd(slug, download.category, download.folder || download.category);
  return items.length ? { kind: 'similar', slug, category: download.category, items } : null;
}

export default function DownloadOffer({ offer }) {
  useEffect(() => {
    if (offer) trackEvent(`download_offer_shown_${offer.kind}`, offer.slug, offer.category);
  }, [offer]);

  if (!offer) return null;

  if (offer.kind === 'exact') {
    return (
      <div style={box}>
        <p style={lead}>Want it sharper? This one comes in HD.</p>
        <p style={sub}>2912 × 1632, 4× the pixels of the free file.</p>
        <a
          href={`/hd?product=${offer.slug}-hd`}
          onClick={() => trackEvent('download_offer_click_exact', offer.slug, offer.category)}
          style={primaryBtn}
        >
          Get the HD Edition: $4.99
        </a>
      </div>
    );
  }

  return (
    <div style={box}>
      <p style={lead}>Similar backgrounds in HD</p>
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
        {offer.items.map((p) => {
          const base = p.id.replace(/-hd$/, '');
          return (
            <a
              key={p.id}
              href={`/hd?product=${p.id}`}
              onClick={() => trackEvent('download_offer_click_similar', base, offer.category, { sourceImage: offer.slug })}
              aria-label={`HD Edition: ${p.name}`}
              style={{ flex: '1 1 0', display: 'block', borderRadius: '0.35rem', overflow: 'hidden', border: '1px solid #e5e7eb' }}
            >
              <img
                src={`${CDN}/webp/${p.category}/${base}.webp`}
                alt={p.name}
                loading="lazy"
                style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }}
              />
            </a>
          );
        })}
      </div>
      <p style={sub}>2912 × 1632 HD Editions from $4.99.</p>
    </div>
  );
}

const box = {
  background: '#F5F5F5',
  border: '1px solid #e5e7eb',
  borderRadius: '0.6rem',
  padding: '0.75rem',
  margin: '0 0 1rem',
  textAlign: 'center',
};
const lead = { margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.9rem', color: '#111827' };
const sub = { margin: '0 0 0.6rem', fontSize: '0.75rem', color: '#6b7280' };
const primaryBtn = {
  display: 'block',
  background: '#E0A82E',
  color: '#111827',
  textDecoration: 'none',
  padding: '0.6rem 0.9rem',
  borderRadius: '0.45rem',
  fontWeight: 700,
  fontSize: '0.9rem',
};
