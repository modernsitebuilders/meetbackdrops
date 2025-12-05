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
    const sessions = {};
    const landingPages = {};
    const paths = {};

    rows.slice(1).forEach(row => {
      const sessionId = row[9];
      const eventType = row[1];
      const page = row[3];
      const landingPage = row[8];

      if (!sessionId) return;

      if (!sessions[sessionId]) {
        sessions[sessionId] = { pages: [], downloads: 0, landing: landingPage || '/' };
      }

      if (eventType === 'page_view') {
        sessions[sessionId].pages.push(page);
      } else if (eventType === 'download') {
        sessions[sessionId].downloads++;
      }

      if (landingPage && !landingPages[landingPage]) {
        landingPages[landingPage] = { sessions: 0, downloads: 0 };
      }
    });

    Object.values(sessions).forEach(session => {
      const landing = session.landing;
      if (landingPages[landing]) {
        landingPages[landing].sessions++;
        landingPages[landing].downloads += session.downloads;
      }

      if (session.downloads > 0 && session.pages.length > 0) {
        const pathKey = session.pages.slice(0, 3).join(' → ');
        paths[pathKey] = (paths[pathKey] || 0) + 1;
      }
    });

    const landingPagesArray = Object.entries(landingPages)
      .map(([page, data]) => ({
        page,
        sessions: data.sessions,
        downloads: data.downloads,
        conversion: data.sessions > 0 ? ((data.downloads / data.sessions) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    const commonPaths = Object.entries(paths)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const homepageOnly = Object.values(sessions).filter(s => s.pages.length === 1 && s.pages[0] === '/').length;
    const categoryNoDL = Object.values(sessions).filter(s => 
      s.pages.some(p => p.includes('/category/')) && s.downloads === 0
    ).length;

    res.status(200).json({
      landingPages: landingPagesArray,
      commonPaths,
      dropoff: { homepageOnly, categoryNoDL }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}