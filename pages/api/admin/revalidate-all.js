// pages/api/admin/revalidate-all.js
// Triggers on-demand ISR revalidation for all category pages.
// No secret needed — revalidation is harmless, and access from the
// admin UI is already behind the localStorage admin check.

const CATEGORY_SLUGS = [
  'bookshelves-bright',
  'bookshelves-dark',
  'wall-shelves-bright',
  'wall-shelves-dark',
  'office-spaces',
  'home-office',
  'neutral-backgrounds',
  'living-rooms',
  'kitchens',
  'coffee-shops',
  'art-galleries',
  'urban-lofts',
  'gardens-patios',
  'historic-spaces',
  'nature-landscapes',
  'libraries',
  'christmas-backgrounds',
  'halloween-backgrounds',
  'valentines-backgrounds',
  'easter-backgrounds',
  'bokeh-backgrounds',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = { revalidated: [], failed: [] };

  for (const slug of CATEGORY_SLUGS) {
    try {
      await res.revalidate(`/category/${slug}`);
      results.revalidated.push(slug);
    } catch (err) {
      results.failed.push({ slug, error: err.message });
    }
  }

  return res.status(200).json({
    success: true,
    revalidated: results.revalidated.length,
    failed: results.failed,
    timestamp: new Date().toISOString(),
  });
}
