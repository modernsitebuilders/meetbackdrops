import { google } from 'googleapis';
import { resolveByAnyExtension } from '../../lib/manifest';
import { normalizeAnalyticsCategory } from '../../lib/analyticsNormalize';

export default async function handler(req, res) {
  try {
    // Fix private key format
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

    // Get all data - need more columns for visitor tracking
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:K', // Need columns A through K for visitor data
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return res.status(200).json({ downloads: [] });
    }

    // Resolve canonical category from manifest by filename. Analytics
    // rows that can't be resolved fall back to normalizeAnalyticsCategory
    // against the row's category column — if that also fails, the row
    // is skipped. Category is never inferred from filename shape.
    function resolveCategory(filename, rawCategory) {
      const entry = resolveByAnyExtension(filename);
      if (entry) return entry.category;
      return normalizeAnalyticsCategory(rawCategory);
    }

    const uniqueDownloads = new Set();
    const downloadCounts = {};
    const visitorDownloads = {};

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const actionType = row[1];
      const filename = row[3];
      const rawCategory = row[4];
      const visitorId = row[10] || 'unknown';

      if (actionType === 'download' && filename && visitorId) {
        const uniqueKey = `${filename}:${visitorId}`;

        if (uniqueDownloads.has(uniqueKey)) {
          continue;
        }

        uniqueDownloads.add(uniqueKey);

        const category = resolveCategory(filename, rawCategory);
        if (!category) continue;

        if (!downloadCounts[filename]) {
          downloadCounts[filename] = {
            filename: filename,
            category: category,
            count: 0
          };
        }
        downloadCounts[filename].count++;
        
        // Track visitor download stats (optional, for user behavior analysis)
        if (!visitorDownloads[visitorId]) {
          visitorDownloads[visitorId] = 0;
        }
        visitorDownloads[visitorId]++;
      }
    }

    const allDownloads = Object.values(downloadCounts)
      .sort((a, b) => b.count - a.count);

    const SEASONAL_CATEGORIES = new Set([
      'halloween-backgrounds',
      'christmas-backgrounds',
    ]);
    const nonSeasonalDownloads = allDownloads.filter(item => !SEASONAL_CATEGORIES.has(item.category));
    const seasonalDownloads = allDownloads.filter(item => SEASONAL_CATEGORIES.has(item.category));

    // Optional: Calculate average downloads per unique visitor
    const uniqueVisitorCount = Object.keys(visitorDownloads).length;
    const avgDownloadsPerVisitor = uniqueVisitorCount > 0 
      ? (nonSeasonalDownloads.reduce((sum, item) => sum + item.count, 0) / uniqueVisitorCount).toFixed(2)
      : 0;

    res.setHeader('Cache-Control', 'public, max-age=7200, stale-while-revalidate=86400');
    res.status(200).json({
      totalDownloads: nonSeasonalDownloads.reduce((sum, item) => sum + item.count, 0),
      seasonalDownloads: seasonalDownloads.reduce((sum, item) => sum + item.count, 0),
      uniqueFiles: nonSeasonalDownloads.length,
      topDownloads: nonSeasonalDownloads.slice(0, 50),
      allDownloads: nonSeasonalDownloads,
      // Optional metrics:
      uniqueVisitors: uniqueVisitorCount,
      avgDownloadsPerVisitor: avgDownloadsPerVisitor,
      totalDownloadEvents: rows.length - 1 // For comparison
    });

  } catch (error) {
    console.error('Failed to get download stats:', error);
    res.status(500).json({ error: error.message });
  }
}