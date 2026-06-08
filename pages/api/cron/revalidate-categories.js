/**
 * /api/cron/revalidate-categories
 *
 * Triggered nightly by Vercel cron. Forces ISR revalidation on every category
 * page so they all re-run getStaticProps → fetch fresh scores from Google Sheets
 * → update sort order. No manual steps needed.
 *
 * Also called by update-popular so both crons fire together.
 */

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
  // Allow Vercel cron (no auth header) OR authorized manual calls
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const isAuthorized = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

  if (!isVercelCron && !isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = { revalidated: [], failed: [] };

  // Revalidate all category pages — triggers fresh getStaticProps on next visit
  for (const slug of CATEGORY_SLUGS) {
    try {
      await res.revalidate(`/category/${slug}`);
      results.revalidated.push(slug);
    } catch (err) {
      results.failed.push({ slug, error: err.message });
    }
  }

  console.log(`[revalidate-categories] ✅ ${results.revalidated.length} revalidated, ❌ ${results.failed.length} failed`);

  return res.status(200).json({
    message: 'Revalidation complete',
    revalidated: results.revalidated.length,
    failed: results.failed,
    timestamp: new Date().toISOString(),
  });
}
