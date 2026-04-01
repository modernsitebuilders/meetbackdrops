/**
 * /api/cron/warm-scores
 *
 * Called by cron-job.org to pre-warm the calculate-scores cache.
 * Internally fetches /api/calculate-scores (which does the heavy lifting and
 * caches results in memory for 1 hour) but only returns a tiny summary so
 * cron-job.org never hits its "response data too big" limit.
 */

export default async function handler(req, res) {
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const isAuthorized = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

  // Also allow unauthenticated GET so cron-job.org can call it without auth
  const isGetRequest = req.method === 'GET';

  if (!isVercelCron && !isAuthorized && !isGetRequest) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const startTime = Date.now();

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://streambackdrops.com';
    const response = await fetch(`${baseUrl}/api/calculate-scores`, {
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: `calculate-scores returned ${response.status}`,
        elapsed: Date.now() - startTime,
      });
    }

    const data = await response.json();
    const scores = data.scores || {};
    const scoreValues = Object.values(scores).map(s => s.score ?? s);

    // Return only a tiny summary — never the full scores object
    return res.status(200).json({
      ok: true,
      cached: data.cached ?? false,
      calculatedAt: data.calculatedAt ?? null,
      totalImages: scoreValues.length,
      elapsed: Date.now() - startTime,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
      elapsed: Date.now() - startTime,
    });
  }
}
