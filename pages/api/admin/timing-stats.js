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
    const hourData = {};
    const dayData = {};

    rows.slice(1).forEach(row => {
      const timestamp = row[0];
      const eventType = row[1];

      if (!timestamp) return;

      try {
        const date = new Date(timestamp);
        const hour = date.getHours();
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });

        if (!hourData[hour]) hourData[hour] = { views: 0, downloads: 0 };
        if (!dayData[day]) dayData[day] = { views: 0, downloads: 0 };

        if (eventType === 'page_view') {
          hourData[hour].views++;
          dayData[day].views++;
        } else if (eventType === 'download') {
          hourData[hour].downloads++;
          dayData[day].downloads++;
        }
      } catch (e) {}
    });

    const hours = Object.entries(hourData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        views: data.views,
        downloads: data.downloads,
        conversion: data.views > 0 ? ((data.downloads / data.views) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => a.hour - b.hour);

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const days = dayOrder.map(day => ({
      day,
      views: dayData[day]?.views || 0,
      downloads: dayData[day]?.downloads || 0,
      conversion: dayData[day]?.views > 0 ? ((dayData[day].downloads / dayData[day].views) * 100).toFixed(1) : '0.0'
    }));

    const bestHour = hours.sort((a, b) => parseFloat(b.conversion) - parseFloat(a.conversion))[0];
    const bestDay = days.sort((a, b) => parseFloat(b.conversion) - parseFloat(a.conversion))[0];

    res.status(200).json({
      hours: hours.sort((a, b) => a.hour - b.hour),
      days,
      bestHour: { hour: bestHour.hour, conversion: bestHour.conversion },
      bestDay: { day: bestDay.day, conversion: bestDay.conversion }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}