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
    const catData = {};

    rows.slice(1).forEach(row => {
      const eventType = row[1];
      const category = row[4];

      if (!category || category === '/' || category === 'homepage' || category.includes('.png') || category.includes('.webp')) {
        return;
      }

      if (!catData[category]) {
        catData[category] = { views: 0, downloads: 0 };
      }

      if (eventType === 'page_view') {
        catData[category].views++;
      } else if (eventType === 'download') {
        catData[category].downloads++;
      }
    });

    const categories = Object.entries(catData)
      .map(([name, data]) => ({
        name,
        views: data.views,
        downloads: data.downloads,
        conversion: data.views > 0 ? ((data.downloads / data.views) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.downloads - a.downloads);

    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}