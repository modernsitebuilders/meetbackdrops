import { google } from 'googleapis';
import { isDownloadEvent } from '../../../lib/analyticsNormalize';

export default async function handler(req, res) {
  try {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
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
      range: 'Analytics!A:O'
    });

    const rows = response.data.values || [];
    let pageViews = 0;
    const imageDownloads = {};

    rows.slice(1).forEach(row => {
      const eventType = row[1];
      const filename = row[3];
      const category = row[4] || '';

      if (category.toLowerCase().includes('christmas')) {
        if (eventType === 'page_view') {
          pageViews++;
        } else if (isDownloadEvent(eventType) && filename && filename.match(/\.(png|webp|jpg)$/i)) {
          imageDownloads[filename] = (imageDownloads[filename] || 0) + 1;
        }
      }
    });

    const totalDownloads = Object.values(imageDownloads).reduce((sum, count) => sum + count, 0);
    const conversionRate = pageViews > 0 ? ((totalDownloads / pageViews) * 100).toFixed(1) : '0.0';

    const topImages = Object.entries(imageDownloads)
      .map(([filename, downloads]) => ({ filename, downloads }))
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);

    const downloadedFilenames = new Set(Object.keys(imageDownloads));
    const zeroDownloads = [];
    for (let i = 1; i <= 127; i++) {
      const padded = String(i).padStart(2, '0');
      const filename = `christmas-background-${padded}.png`;
      if (!downloadedFilenames.has(filename)) {
        zeroDownloads.push({ filename });
      }
    }

    res.status(200).json({
      pageViews,
      downloads: totalDownloads,
      conversionRate,
      topImages,
      zeroDownloads: zeroDownloads.slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}