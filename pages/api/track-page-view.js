import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Block bots
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
    page,
    category,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    sessionId,
    originalReferrer,
    originalUtmSource,
    originalUtmMedium,
    originalUtmCampaign,
    landingPage,
    pageViewsInSession,
    downloadsInSession,
    visitorId,
    visitorType
  } = req.body;

  let currentSource = 'direct';
  if (utm_source) {
    currentSource = utm_source;
    if (utm_medium) currentSource += `/${utm_medium}`;
    if (utm_campaign) currentSource += `/${utm_campaign}`;
  } else if (referrer && referrer !== 'direct') {
    currentSource = referrer;
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
    'page_view',
    originalSource,
    page,
    category || 'n/a',
    pageViewsInSession || 1,
    downloadsInSession || 0,
    visitorType || 'new',
    landingPage || '',
    sessionId || '',
    visitorId || 'unknown',
    now.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
    now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    req.headers['user-agent'] || 'unknown',
    currentSource,
  ];

  try {
    await redis.rpush('analytics:queue', JSON.stringify(row));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Page view queueing failed:', error.message);
    res.status(200).json({ success: false, error: error.message });
  }
}
