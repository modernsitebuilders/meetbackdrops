/**
 * /api/cron/flush-analytics
 *
 * Runs every 6 hours. Drains the Redis analytics:queue into Google Sheets
 * in a single batch append, replacing the per-request Sheets writes from
 * track-page-view, track-download, track-preview, track-bundle, and analytics.
 *
 * A Redis lock prevents concurrent flushes if a previous run is still in progress.
 * Purchase/subscription rows are highlighted green after each batch write.
 */

import { google } from 'googleapis';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const QUEUE_KEY = 'analytics:queue';
const LOCK_KEY  = 'analytics:flush:lock';

const REVENUE_EVENTS = new Set(['hd_purchase', 'hd_subscription']);

export default async function handler(req, res) {
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const isAuthorized = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

  if (!isVercelCron && !isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Acquire lock — prevents overlapping flush if a run takes longer than 6 hours
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

    // Cap per-run to 1000 rows to stay within cron-job.org's 30s request timeout.
    // Any remaining items will be processed on the next flush run.
    const MAX_PER_RUN = 1000;
    const processCount = Math.min(count, MAX_PER_RUN);

    // Read queued items and trim them atomically from the front.
    const items = await redis.lrange(QUEUE_KEY, 0, processCount - 1);

    const rows = items
      .map(item => {
        try { return typeof item === 'string' ? JSON.parse(item) : item; }
        catch { return null; }
      })
      .filter(Boolean);

    if (rows.length === 0) {
      await redis.ltrim(QUEUE_KEY, processCount, -1);
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

    // Fetch the Analytics sheet ID once (needed for highlighting)
    let analyticsSheetId = null;
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        fields: 'sheets.properties',
      });
      const sheet = spreadsheet.data.sheets.find(s => s.properties.title === 'Analytics');
      if (sheet) analyticsSheetId = sheet.properties.sheetId;
    } catch (e) {
      console.warn('⚠️ Could not fetch sheet ID for highlighting:', e.message);
    }

    // Write in batches of 500 to avoid Sheets API limits and timeouts
    const BATCH_SIZE = 500;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Analytics!A:P',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: batch },
      });
      console.log(`✅ Wrote batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} rows`);

      // Highlight revenue rows (hd_purchase = light green, hd_subscription = vivid green)
      if (analyticsSheetId !== null) {
        const updatedRange = appendResponse.data.updates?.updatedRange; // e.g. "Analytics!A1523:P1573"
        const match = updatedRange?.match(/!A(\d+):/);
        if (match) {
          const batchStartRow = parseInt(match[1], 10);
          const highlightRequests = [];

          batch.forEach((row, idx) => {
            const eventType = row[1];
            if (!REVENUE_EVENTS.has(eventType)) return;

            const absoluteRow = batchStartRow + idx;
            const color = eventType === 'hd_subscription'
              ? { red: 0.42, green: 0.78, blue: 0.42 }
              : { red: 0.85, green: 0.92, blue: 0.83 };

            highlightRequests.push({
              repeatCell: {
                range: {
                  sheetId: analyticsSheetId,
                  startRowIndex: absoluteRow - 1,
                  endRowIndex: absoluteRow,
                },
                cell: { userEnteredFormat: { backgroundColor: color } },
                fields: 'userEnteredFormat.backgroundColor',
              },
            });
          });

          if (highlightRequests.length > 0) {
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId: process.env.GOOGLE_SHEET_ID,
              resource: { requests: highlightRequests },
            });
            console.log(`✅ Highlighted ${highlightRequests.length} revenue row(s) in batch ${Math.floor(i / BATCH_SIZE) + 1}`);
          }
        }
      }
    }

    // Only trim the queue AFTER successful write so data isn't lost on failure
    await redis.ltrim(QUEUE_KEY, processCount, -1);

    const remaining = count - processCount;
    console.log(`✅ Flushed ${rows.length} analytics events to Sheets${remaining > 0 ? `, ${remaining} remaining` : ''}`);
    return res.status(200).json({ message: 'Flushed', flushed: rows.length, remaining });

  } catch (error) {
    console.error('❌ Flush failed:', error.message);
    return res.status(500).json({ error: error.message });
  } finally {
    await redis.del(LOCK_KEY);
  }
}
