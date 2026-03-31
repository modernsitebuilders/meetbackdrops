const CLOUD_NAME = 'dnhju6mhg';
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

/**
 * Returns the Cloudinary URL for a WebP thumbnail.
 * @param {string} category - e.g. 'bookshelves-bright'
 * @param {string} filename - e.g. 'bookshelves-bright-01.webp'
 */
export function webpUrl(category, filename) {
  return `${BASE}/f_auto,q_auto/webp/${category}/${filename}`;
}

/**
 * Returns the full absolute Cloudinary URL (for SEO/schema use).
 * @param {string} category - e.g. 'bookshelves-bright'
 * @param {string} filename - e.g. 'bookshelves-bright-01.webp'
 */
export function webpUrlAbsolute(category, filename) {
  return `${BASE}/f_auto,q_auto/webp/${category}/${filename}`;
}
