/**
 * /api/cron/flush-analytics
 *
 * Runs every 5 minutes. Drains the Redis analytics:queue into Google Sheets
 * in a single batch append, replacing the per-request Sheets writes from
 * track-page-view and track-download.
 *
 * A Redis lock prevents concurrent flushes if a previous run is still in progress.
 */

import { google } from 'googleapis';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const QUEUE_KEY = 'analytics:queue';
const LOCK_KEY  = 'analytics:flush:lock';

export default async function handler(req, res) {
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const isAuthorized = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

  if (!isVercelCron && !isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Acquire lock — prevents overlapping flush if a run takes longer than 5 min
  const gotLock = await redis.set(LOCK_KEY, '1', { nx: true, ex: 90 });
  if (!gotLock) {
    console.log('⏳ Flush already in progress, skipping');
    return res.status(200).json({ message: 'Flush already in progress', flushed: 0 });
  }

  try {
    const count = await redis.llen(QUEUE_KEY);
    if (count === 0) {
      return res.status(200).json({ message: 'Queue empty', flushed: 0 });
    }

    // Read all queued items and trim them atomically from the front.
    // Any events that arrive after llen() go into positions count..N and are
    // left in the queue for the next flush run.
    const items = await redis.lrange(QUEUE_KEY, 0, count - 1);
    await redis.ltrim(QUEUE_KEY, count, -1);

    const rows = items
      .map(item => {
        try { return typeof item === 'string' ? JSON.parse(item) : item; }
        catch { return null; }
      })
      .filter(Boolean);

    if (rows.length === 0) {
      return res.status(200).json({ message: 'No valid rows', flushed: 0 });
    }

    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:P',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: rows },
    });

    console.log(`✅ Flushed ${rows.length} analytics events to Sheets`);
    return res.status(200).json({ message: 'Flushed', flushed: rows.length });

  } catch (error) {
    console.error('❌ Flush failed:', error.message);
    return res.status(500).json({ error: error.message });
  } finally {
    await redis.del(LOCK_KEY);
  }
}
