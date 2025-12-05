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

    rows.slice(1).forEach(row => {
      const sessionId = row[9];
      const eventType = row[1];

      if (!sessionId) return;

      if (!sessions[sessionId]) {
        sessions[sessionId] = { pages: 0, downloads: 0 };
      }

      if (eventType === 'page_view') {
        sessions[sessionId].pages++;
      } else if (eventType === 'download') {
        sessions[sessionId].downloads++;
      }
    });

    const totalSessions = Object.keys(sessions).length;
    const sessionsWithDownload = Object.values(sessions).filter(s => s.downloads > 0).length;
    const multiDownloadSessions = Object.values(sessions).filter(s => s.downloads > 1).length;

    const totalPages = Object.values(sessions).reduce((sum, s) => sum + s.pages, 0);
    const pagesBeforeDownload = Object.values(sessions)
      .filter(s => s.downloads > 0)
      .reduce((sum, s) => sum + s.pages, 0);

    const avgPagesPerSession = (totalPages / totalSessions).toFixed(1);
    const avgPagesBeforeDownload = sessionsWithDownload > 0 ? (pagesBeforeDownload / sessionsWithDownload).toFixed(1) : '0';
    const conversionRate = ((sessionsWithDownload / totalSessions) * 100).toFixed(1);
    const multiDownloadPercent = sessionsWithDownload > 0 ? ((multiDownloadSessions / sessionsWithDownload) * 100).toFixed(1) : '0';

    res.status(200).json({
      totalSessions,
      sessionsWithDownload,
      conversionRate,
      avgPagesPerSession,
      avgPagesBeforeDownload,
      multiDownloadSessions,
      multiDownloadPercent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}