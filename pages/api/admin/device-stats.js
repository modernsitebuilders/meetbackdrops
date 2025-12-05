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
    const deviceData = { desktop: { views: 0, downloads: 0 }, mobile: { views: 0, downloads: 0 } };
    const browserData = {};
    const osData = {};

    rows.slice(1).forEach(row => {
      const eventType = row[1];
      const userAgent = row[13] || '';

      const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
      const device = isMobile ? 'mobile' : 'desktop';

      if (eventType === 'page_view') {
        deviceData[device].views++;
      } else if (eventType === 'download') {
        deviceData[device].downloads++;
      }

      let browser = 'Other';
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Edge')) browser = 'Edge';

      if (!browserData[browser]) browserData[browser] = { sessions: 0, downloads: 0 };
      if (eventType === 'page_view') browserData[browser].sessions++;
      else if (eventType === 'download') browserData[browser].downloads++;

      let os = 'Other';
      if (userAgent.includes('Windows')) os = 'Windows';
      else if (userAgent.includes('Mac')) os = 'macOS';
      else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

      if (!osData[os]) osData[os] = { sessions: 0, downloads: 0 };
      if (eventType === 'page_view') osData[os].sessions++;
      else if (eventType === 'download') osData[os].downloads++;
    });

    const totalViews = deviceData.desktop.views + deviceData.mobile.views;
    const devices = {
      desktop: {
        percent: ((deviceData.desktop.views / totalViews) * 100).toFixed(1),
        conversion: deviceData.desktop.views > 0 ? ((deviceData.desktop.downloads / deviceData.desktop.views) * 100).toFixed(1) : '0.0'
      },
      mobile: {
        percent: ((deviceData.mobile.views / totalViews) * 100).toFixed(1),
        conversion: deviceData.mobile.views > 0 ? ((deviceData.mobile.downloads / deviceData.mobile.views) * 100).toFixed(1) : '0.0'
      }
    };

    const browsers = Object.entries(browserData)
      .map(([name, data]) => ({
        name,
        sessions: data.sessions,
        downloads: data.downloads,
        conversion: data.sessions > 0 ? ((data.downloads / data.sessions) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.sessions - a.sessions);

    const os = Object.entries(osData)
      .map(([name, data]) => ({
        name,
        sessions: data.sessions,
        downloads: data.downloads,
        conversion: data.sessions > 0 ? ((data.downloads / data.sessions) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.sessions - a.sessions);

    res.status(200).json({ devices, browsers, os });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}