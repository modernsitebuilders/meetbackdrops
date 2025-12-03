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

    function extractCategory(filename) {
      if (!filename) return 'unknown';
      
      const name = filename.replace(/\.(png|jpg|jpeg|webp|gif)$/i, '');
      const base = name.replace(/-\d+$/, '');
      
      if (base.endsWith('-background')) return base + 's';
      if (base.endsWith('-space')) return base + 's';
      if (base === 'library') return 'libraries';
      
      return base;
    }

    // Count downloads by filename
    const downloadCounts = {};
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const actionType = row[1];
      const filename = row[3];
      
      if (actionType === 'download' && filename) {
        const category = extractCategory(filename);
        
        if (!downloadCounts[filename]) {
          downloadCounts[filename] = {
            filename: filename,
            category: category,
            count: 0
          };
        }
        downloadCounts[filename].count++;
      }
    }

    const sortedDownloads = Object.values(downloadCounts)
      .filter(item => {
        // Exclude seasonal backgrounds
        return !item.filename.match(/^(halloween|christmas)-background/i);
      })
      .sort((a, b) => b.count - a.count);

    res.status(200).json({
      totalDownloads: sortedDownloads.reduce((sum, item) => sum + item.count, 0),
      uniqueFiles: sortedDownloads.length,
      topDownloads: sortedDownloads.slice(0, 50),
      allDownloads: sortedDownloads
    });

  } catch (error) {
    console.error('Failed to get download stats:', error);
    res.status(500).json({ error: error.message });
  }
}