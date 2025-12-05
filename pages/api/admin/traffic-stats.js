import { google } from 'googleapis';

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
    const sourceData = {};

    rows.slice(1).forEach(row => {
      const eventType = row[1];
      const source = row[2] || 'direct';
      const sessionId = row[9];

      if (!sourceData[source]) {
        sourceData[source] = { views: 0, downloads: 0, sessions: new Set() };
      }

      if (eventType === 'page_view') {
        sourceData[source].views++;
        if (sessionId) sourceData[source].sessions.add(sessionId);
      } else if (eventType === 'download') {
        sourceData[source].downloads++;
      }
    });

    const sources = Object.entries(sourceData)
      .map(([source, data]) => ({
        source,
        views: data.views,
        downloads: data.downloads,
        conversion: data.views > 0 ? ((data.downloads / data.views) * 100).toFixed(1) : '0.0',
        sessions: data.sessions.size
      }))
      .sort((a, b) => b.downloads - a.downloads);

    res.status(200).json({ sources });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}