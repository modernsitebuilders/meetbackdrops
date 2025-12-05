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
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = { views: 0, downloads: 0 };
    const lastWeek = { views: 0, downloads: 0 };
    const daily = {};

    rows.slice(1).forEach(row => {
      const timestamp = row[0];
      const eventType = row[1];
      
      if (!timestamp) return;

      try {
        const date = new Date(timestamp);
        const dateStr = date.toLocaleDateString('en-US');

        if (!daily[dateStr]) {
          daily[dateStr] = { views: 0, downloads: 0 };
        }

        if (date >= thisWeekStart) {
          if (eventType === 'page_view') {
            thisWeek.views++;
            daily[dateStr].views++;
          } else if (eventType === 'download') {
            thisWeek.downloads++;
            daily[dateStr].downloads++;
          }
        } else if (date >= lastWeekStart && date < thisWeekStart) {
          if (eventType === 'page_view') lastWeek.views++;
          else if (eventType === 'download') lastWeek.downloads++;
        }
      } catch (e) {}
    });

    thisWeek.conversion = thisWeek.views > 0 ? ((thisWeek.downloads / thisWeek.views) * 100).toFixed(1) : '0.0';
    thisWeek.avgDaily = (thisWeek.downloads / 7).toFixed(1);

    const growth = {
      views: lastWeek.views > 0 ? (((thisWeek.views - lastWeek.views) / lastWeek.views) * 100).toFixed(1) : '0.0',
      downloads: lastWeek.downloads > 0 ? (((thisWeek.downloads - lastWeek.downloads) / lastWeek.downloads) * 100).toFixed(1) : '0.0',
      conversion: '0.0'
    };

    const dailyArray = Object.entries(daily)
      .map(([date, data]) => ({
        date,
        views: data.views,
        downloads: data.downloads,
        conversion: data.views > 0 ? ((data.downloads / data.views) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);

    res.status(200).json({ thisWeek, lastWeek, growth, daily: dailyArray });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}