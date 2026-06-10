/**
 * /api/cron/revalidate-categories
 *
 * Triggered nightly by Vercel cron. Forces ISR revalidation on every category
 * page so they all re-run getStaticProps → fetch fresh scores from Google Sheets
 * → update sort order. No manual steps needed.
 *
 * Also called by update-popular so both crons fire together.
 */

import { CATEGORY_ORDER } from '../../../lib/categories-config';

// Canonical category routes, derived from categories-config so this list
// always matches the real /category/[slug] pages (the same set as
// getStaticPaths). It was previously hardcoded and had drifted after the
// bright/dark merge: it listed sub-folders that aren't routes
// (bookshelves-bright/dark, wall-shelves-bright/dark) — whose revalidate
// calls failed every night — while omitting the actual merged pages
// (bookshelves, wall-shelves) and the spring/summer categories, so those
// were never force-reordered. Deriving it keeps new categories
// (e.g. neutral-backgrounds) covered automatically.
const CATEGORY_SLUGS = CATEGORY_ORDER;

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
