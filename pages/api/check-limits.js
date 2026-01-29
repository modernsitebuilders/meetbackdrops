import { google } from 'googleapis';

export default async function handler(req, res) {
  const { sessionId } = req.query;
  
  if (!sessionId) {
    return res.json({ dailyCount: 0, atLimit: false });
  }

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:J',
    });

    const rows = response.data.values || [];
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    let dailyCount = 0;
    let monthlyCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const eventType = row[1];
      const rowSessionId = row[9];
      
      if (eventType === 'download' && rowSessionId === sessionId) {
        const downloadTime = new Date(row[0]).getTime();
        if (downloadTime > oneDayAgo) dailyCount++;
        if (downloadTime > thirtyDaysAgo) monthlyCount++;
      }
    }

    const atLimit = dailyCount >= 5 || monthlyCount >= 10;
    const message = dailyCount >= 5 
      ? 'Daily limit reached (5). Try tomorrow.'
      : 'Monthly limit reached (10). Come back soon.';

    return res.json({ dailyCount, monthlyCount, atLimit, message });
  } catch (error) {
    return res.json({ dailyCount: 0, atLimit: false });
  }
}