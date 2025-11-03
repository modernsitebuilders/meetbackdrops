import { google } from 'googleapis';

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

    // Get all data from the Analytics sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I',
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return res.status(200).json({ downloads: [] });
    }

    // Count downloads by filename
    const downloadCounts = {};
    
    // Skip header row, start from index 1
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const actionType = row[1]; // Column B - action type
      const filename = row[2]; // Column C - filename
      const category = row[3]; // Column D - category
      
      // Only count download actions
      if (actionType === 'download' && filename) {
        if (!downloadCounts[filename]) {
          downloadCounts[filename] = {
            filename: filename,
            category: category || 'unknown',
            count: 0
          };
        }
        downloadCounts[filename].count++;
      }
    }

    // Convert to array and sort by count
    const sortedDownloads = Object.values(downloadCounts)
      .sort((a, b) => b.count - a.count);

    res.status(200).json({
      totalDownloads: sortedDownloads.reduce((sum, item) => sum + item.count, 0),
      uniqueFiles: sortedDownloads.length,
      topDownloads: sortedDownloads.slice(0, 50), // Top 50
      allDownloads: sortedDownloads
    });

  } catch (error) {
    console.error('Failed to get download stats:', error);
    res.status(500).json({ error: error.message });
  }
}