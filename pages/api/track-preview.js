import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userAgent = req.headers['user-agent'] || '';

  if (!userAgent ||
      userAgent.includes('bot') ||
      userAgent.includes('Bot') ||
      userAgent.includes('crawler') ||
      userAgent.includes('spider') ||
      userAgent.includes('Prerender')) {
    return res.status(200).json({ success: true, skipped: 'bot' });
  }

  const {
    filename,
    category,
    sessionId,
    originalReferrer,
    originalUtmSource,
    originalUtmMedium,
    originalUtmCampaign,
    landingPage,
    pageViewsInSession,
    downloadsInSession,
    visitorId,
    visitorType,
    page,
    isAdmin
  } = req.body;

  if (isAdmin === true) {
    return res.status(200).json({ success: true, skipped: 'admin' });
  }

  let originalSource = originalReferrer || 'direct';
  if (originalUtmSource) {
    originalSource = originalUtmSource;
    if (originalUtmMedium) originalSource += `/${originalUtmMedium}`;
    if (originalUtmCampaign) originalSource += `/${originalUtmCampaign}`;
  }

  const now = new Date();
  const row = [
    now.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    'cat_image_preview',
    originalSource,
    filename,
    category,
    pageViewsInSession || 0,
    downloadsInSession || 0,
    visitorType || 'new',
    landingPage || '',
    sessionId || '',
    visitorId || 'unknown',
    now.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
    now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    req.headers['user-agent'] || 'unknown',
    page || req.headers['referer'] || 'direct',
  ];

  try {
    await redis.rpush('analytics:queue', JSON.stringify(row));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Preview tracking queueing failed:', error.message);
    res.status(500).json({ error: 'Tracking failed' });
  }
}
