const CLOUD_NAME = 'dnhju6mhg';
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

/**
 * Returns the Cloudinary URL for a WebP thumbnail.
 * Serves the raw stored WebP directly — no transformations, no credits consumed.
 * @param {string} category - e.g. 'bookshelves-bright'
 * @param {string} filename - e.g. 'bookshelves-bright-01.webp'
 */
export function webpUrl(category, filename) {
  return `${BASE}/webp/${category}/${filename}`;
}

/**
 * Returns the full absolute Cloudinary URL (for SEO/schema use).
 * @param {string} category - e.g. 'bookshelves-bright'
 * @param {string} filename - e.g. 'bookshelves-bright-01.webp'
 */
export function webpUrlAbsolute(category, filename) {
  return `${BASE}/webp/${category}/${filename}`;
}
