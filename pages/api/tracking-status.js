// pages/api/tracking-status.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  let queueLen = null;
  let redisError = null;
  try {
    queueLen = await redis.llen('analytics:queue');
  } catch (e) {
    redisError = e.message;
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    sheetsConfigured: !!process.env.GOOGLE_SHEET_ID,
    serviceEmail: process.env.GOOGLE_SERVICE_EMAIL ? 'configured' : 'missing',
    privateKey: process.env.GOOGLE_PRIVATE_KEY ? 'configured' : 'missing',
    redisConfigured: !!process.env.UPSTASH_REDIS_REST_URL,
    queueLen,
    redisError,
  });
}