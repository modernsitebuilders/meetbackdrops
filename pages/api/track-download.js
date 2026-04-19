import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { resolveByAnyExtension } from '../../lib/manifest';
import { normalizeAnalyticsCategory } from '../../lib/analyticsNormalize';

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'salt_streambackdrops').digest('hex').substring(0, 16);
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  console.log('📥 Download tracking request received:', {
    method: req.method,
    hasBody: !!req.body,
    filename: req.body?.filename,
    category: req.body?.category,
    timestamp: new Date().toISOString()
  });

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Block tracking from bots, crawlers, and build processes
  const userAgent = req.headers['user-agent'] || '';
  const isBot = !userAgent ||
    userAgent.includes('bot') ||
    userAgent.includes('Bot') ||
    userAgent.includes('crawler') ||
    userAgent.includes('spider') ||
    userAgent.includes('Prerender') ||
    userAgent.toLowerCase().startsWith('node') ||
    userAgent.includes('axios') ||
    userAgent.includes('python') ||
    userAgent.includes('curl') ||
    userAgent.includes('wget');

  if (isBot) {
    console.log('🤖 Skipping bot/crawler:', userAgent);
    return res.status(200).json({ success: true, skipped: 'bot' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const hashedIP = hashIP(ip);

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
    eventType = 'cat_image_download'
  } = req.body;

  if (!filename) {
    console.log('❌ Missing filename in request');
    return res.status(400).json({ success: false, error: 'Missing filename' });
  }

  console.log('📊 Processing download tracking for:', {
    filename,
    category,
    sessionId: sessionId?.substring(0, 10) + '...',
    visitorId: visitorId?.substring(0, 10) + '...',
    visitorType
  });

  // Canonical category comes from the manifest lookup by filename.
  // If the filename doesn't resolve (should be rare for real downloads),
  // fall back to normalizing the client-provided category via the
  // shared analytics normalizer. Never inferred from filename shape.
  const manifestEntry = resolveByAnyExtension(filename);
  const cleanCategory = manifestEntry
    ? manifestEntry.category
    : (normalizeAnalyticsCategory(category) || 'unknown');

  const buildSourceString = () => {
    if (originalUtmSource) {
      let s = originalUtmSource;
      if (originalUtmMedium) s += `/${originalUtmMedium}`;
      if (originalUtmCampaign) s += `/${originalUtmCampaign}`;
      return s;
    }
    return originalReferrer || 'direct';
  };

  const buildRow = (eventType) => {
    const now = new Date();
    return [
      now.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventType,
      buildSourceString(),
      filename,
      cleanCategory,
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
      hashedIP,
    ];
  };

  try {
    // ── 1. Duplicate check (Redis SET NX) ──────────────────────────────────────
    console.log('🔍 Checking for duplicates...');
    if (sessionId) {
      const dupKey = `dl:dup:${sessionId}:${filename}`;
      const alreadyExists = await redis.exists(dupKey);
      if (alreadyExists) {
        console.log('⭕ Skipping duplicate download:', { filename, sessionId: sessionId?.substring(0, 10) + '...' });
        return res.status(200).json({ success: true, skipped: 'recent_duplicate' });
      }
    }

    const isAdmin = req.body.isAdmin === true;

    if (!isAdmin) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const dailyKey = `dl:daily:${hashedIP}:${today}`;
      const monthlyKey = `dl:monthly:${hashedIP}`;
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      // ── 2. Daily limit (5 per 24h) ─────────────────────────────────────────
      const dailyCount = parseInt(await redis.get(dailyKey) || '0', 10);
      if (dailyCount >= 5) {
        await redis.rpush('analytics:queue', JSON.stringify(buildRow('download_denied')));
        console.log('⛔ Daily limit reached for IP:', hashedIP.substring(0, 8) + '...');
        return res.status(429).json({
          error: 'Daily download limit reached. You can download 5 images per day. Come back tomorrow!'
        });
      }

      // ── 3. Monthly limit (10 per 30 days) ──────────────────────────────────
      await redis.zremrangebyscore(monthlyKey, 0, thirtyDaysAgo);
      const monthlyCount = await redis.zcard(monthlyKey);
      if (monthlyCount >= 10) {
        // Get oldest entry to calculate expiry
        const [oldestMember] = await redis.zrange(monthlyKey, 0, 0);
        const oldestTs = oldestMember
          ? parseFloat(await redis.zscore(monthlyKey, oldestMember) || thirtyDaysAgo)
          : thirtyDaysAgo;
        const daysUntilExpiry = Math.max(1, Math.ceil((oldestTs + 30 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)));

        await redis.rpush('analytics:queue', JSON.stringify(buildRow('download_denied')));
        console.log('⛔ Monthly limit reached for IP:', hashedIP.substring(0, 8) + '...');
        return res.status(429).json({
          error: `Monthly download limit reached. Your oldest download will expire in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}, then you can download more!`
        });
      }
    } else {
      console.log('👑 Admin bypass - skipping limits');
    }

    // ── 4. Mark duplicate & update counters ────────────────────────────────────
    if (sessionId) {
      await redis.set(`dl:dup:${sessionId}:${filename}`, '1', { ex: 86400 });
    }

    if (!isAdmin) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const dailyKey = `dl:daily:${hashedIP}:${today}`;
      const monthlyKey = `dl:monthly:${hashedIP}`;
      const uniqueId = `${Date.now()}-${Math.random()}`;

      await redis.incr(dailyKey);
      await redis.expire(dailyKey, 26 * 60 * 60); // 26h TTL
      await redis.zadd(monthlyKey, { score: Date.now(), member: uniqueId });
      await redis.expire(monthlyKey, 35 * 24 * 60 * 60); // 35d TTL
    }

    // ── 5. Queue event ─────────────────────────────────────────────────────────
    const row = buildRow(eventType);
    await redis.rpush('analytics:queue', JSON.stringify(row));

    console.log('✅ Download queued successfully:', { filename, category: cleanCategory });
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Download tracking failed:', {
      error: error.message,
      filename,
      category: cleanCategory,
      timestamp: new Date().toISOString()
    });
    res.status(200).json({
      success: false,
      error: 'Tracking failed but download may proceed',
      message: error.message,
    });
  }
}
