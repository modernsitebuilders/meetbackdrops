// analytics.js - queues events to Redis for batch flush to Sheets
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
  const ua = userAgent.toLowerCase();

  // Keep automated traffic out of the analytics sheet: missing UA, known
  // crawlers, headless browsers, and HTTP libraries / scrapers. Many datacenter
  // scrapers spoof a real browser UA and still slip through (GA4-side bot
  // filtering catches some of those) — this just stops the obvious ones.
  // Matching is lowercased, so 'bot' covers Googlebot/bingbot/GPTBot/etc.
  const BOT_UA_TOKENS = [
    'bot', 'crawler', 'spider', 'crawl', 'slurp', 'prerender',
    'headless', 'phantomjs', 'puppeteer', 'playwright', 'selenium',
    'lighthouse', 'pagespeed', 'gtmetrix', 'pingdom', 'uptimerobot',
    'python-requests', 'python-urllib', 'urllib', 'aiohttp', 'httpx',
    'go-http-client', 'java/', 'okhttp', 'curl/', 'wget', 'libwww',
    'scrapy', 'axios', 'node-fetch', 'undici', 'guzzle', 'httpclient',
    'dataprovider', 'embedly',
  ];

  if (!userAgent || BOT_UA_TOKENS.some(token => ua.includes(token))) {
    return res.status(200).json({ success: true, skipped: 'bot' });
  }

  const {
    eventType,
    filename,
    category,
    originalSource,
    sessionId,
    visitorId,
    pageViewsInSession,
    downloadsInSession,
    visitorType,
    landingPage
  } = req.body;

  const now = new Date();
  const row = [
    now.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    eventType || 'widget_event',
    originalSource || 'direct',
    filename || 'comparison-widget',
    category || 'hd',
    pageViewsInSession || 0,
    downloadsInSession || 0,
    visitorType || 'new',
    landingPage || '',
    sessionId || '',
    visitorId || 'unknown',
    now.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
    now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    req.headers['user-agent'] || 'unknown',
    req.headers['referer'] || 'direct',
  ];

  try {
    await redis.rpush('analytics:queue', JSON.stringify(row));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics queueing failed:', error.message);
    res.status(500).json({ error: 'Tracking failed' });
  }
}
