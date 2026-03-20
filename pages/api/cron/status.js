// pages/api/cron/status.js
// No auth required — safe to hit in browser to check cron health
import { google } from 'googleapis';

export default async function handler(req, res) {
  const now = new Date();

  try {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (!privateKey) throw new Error('GOOGLE_PRIVATE_KEY env var missing');
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'PopularCache!A1:G8',
    });

    const rows = response.data.values || [];

    if (rows.length < 4) {
      return res.status(200).json({
        ok: false,
        reason: 'PopularCache sheet exists but has no data — cron has never run successfully',
        checkedAt: now.toISOString(),
      });
    }

    const lastUpdated = rows[1]?.[1] || null;
    const totalImages = rows[2]?.[1] || null;
    const averageScore = rows[3]?.[1] || null;
    const topImage = rows[6]?.[1] || null; // First data row after header

    const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : null;
    const ageHours = lastUpdatedDate
      ? Math.round((now - lastUpdatedDate) / (1000 * 60 * 60) * 10) / 10
      : null;

    const ok = ageHours !== null && ageHours < 25;

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ok,
      lastUpdated,
      ageHours,
      stale: !ok,
      totalImages: totalImages ? parseInt(totalImages) : null,
      averageScore: averageScore ? parseFloat(averageScore) : null,
      topImage,
      checkedAt: now.toISOString(),
      hint: ok
        ? 'Cron is running normally'
        : ageHours === null
          ? 'Could not parse last updated timestamp'
          : `Last update was ${ageHours}h ago — expected < 25h. Check Vercel cron logs.`,
    });

  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({
      ok: false,
      error: error.message,
      checkedAt: now.toISOString(),
      hint: 'Google Sheets API error — check GOOGLE_PRIVATE_KEY, GOOGLE_SERVICE_EMAIL, GOOGLE_SHEET_ID env vars in Vercel',
    });
  }
}
