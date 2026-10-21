import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { resolveByAnyExtension } from '../../lib/manifest';
import { normalizeAnalyticsCategory } from '../../lib/analyticsNormalize';
import { shouldSkipAnalytics, isSuspectedBehavioralBot } from '../../lib/botFilter';
import { insertAnalyticsEventSafe } from '../../lib/neonEvents.mjs';

// Free downloads per hashed IP per UTC day.
const DAILY_LIMIT = 30;

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

  // Block tracking from bots, crawlers, HTTP-lib scrapers, and browser-UA
  // spoofers (shared gate — see lib/botFilter.js). Keeps automated "downloads"
  // out of the popularity scoring that feeds featured/most-popular rankings.
  if (shouldSkipAnalytics(req)) {
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
      // ── 2. Daily limit ─────────────────────────────────────────────────────
      // Abuse guard only, set well above normal use. There is no monthly cap:
      // the old 5/day + 10/30-day wall blocked ~300 visitors a quarter for ~no
      // revenue, and IP-keyed caps hit whole offices sharing one address.
      const dailyCount = parseInt(await redis.get(dailyKey) || '0', 10);
      if (dailyCount >= DAILY_LIMIT) {
        const deniedRow = buildRow('download_denied');
        const isBot = isSuspectedBehavioralBot({ userAgent: deniedRow[13], referer: deniedRow[14] });
        await redis.rpush('analytics:queue', JSON.stringify(deniedRow));
        await insertAnalyticsEventSafe(deniedRow, { isBot }); // live mirror to Neon (safe no-op without DATABASE_URL)
        console.log('⛔ Daily limit reached for IP:', hashedIP.substring(0, 8) + '...');
        return res.status(429).json({
          error: `Daily download limit reached. You can download ${DAILY_LIMIT} images per day. Come back tomorrow!`
        });
      }
    } else {
      console.log('👑 Admin bypass - skipping limits');
    }

    // ── 3. Mark duplicate & update counters ────────────────────────────────────
    if (sessionId) {
      await redis.set(`dl:dup:${sessionId}:${filename}`, '1', { ex: 86400 });
    }

    if (!isAdmin) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const dailyKey = `dl:daily:${hashedIP}:${today}`;

      await redis.incr(dailyKey);
      await redis.expire(dailyKey, 26 * 60 * 60); // 26h TTL
    }

    // ── 4. Queue event ─────────────────────────────────────────────────────────
    const row = buildRow(eventType);
    const isBot = isSuspectedBehavioralBot({ userAgent: row[13], referer: row[14] });
    await redis.rpush('analytics:queue', JSON.stringify(row));
    await insertAnalyticsEventSafe(row, { isBot }); // live mirror to Neon (safe no-op without DATABASE_URL)

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
