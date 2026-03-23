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
    event,
    bundle,
    price,
    sessionId,
    visitorId
  } = req.body;

  const now = new Date();
  const row = [
    now.toLocaleString('en-US', { timeZone: 'America/New_York' }),
    event,
    'direct',
    '/bundles',
    bundle,
    0,
    0,
    'unknown',
    '',
    sessionId || '',
    visitorId || 'unknown',
    now.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
    now.toLocaleTimeString('en-US', { timeZone: 'America/New_York' }),
    req.headers['user-agent'] || 'unknown',
    `bundle:${bundle}:$${price}`,
  ];

  try {
    await redis.rpush('analytics:queue', JSON.stringify(row));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Bundle tracking queueing failed:', error.message);
    res.status(500).json({ error: error.message });
  }
}
