import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Block tracking from bots, crawlers, and build processes
  const userAgent = req.headers['user-agent'] || '';
  const blockedAgents = ['bot', 'crawler', 'spider', 'vercel', 'headless'];
  
  if (blockedAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return res.status(200).json({ success: true, skipped: 'bot' });
  }
  const { page, category, referrer } = req.body;
  
  try {
    // Check if environment variables exist
    if (!process.env.GOOGLE_SERVICE_EMAIL) {
      throw new Error('GOOGLE_SERVICE_EMAIL not set');
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('GOOGLE_PRIVATE_KEY not set');
    }
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID not set');
    }

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

    const pageViewData = [
      new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      'page_view',
      page,
      category || 'n/a',
      referrer || 'direct',
      'not-collected',
      req.headers['user-agent'] || 'unknown',
      new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
      new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [pageViewData]
      }
    });

    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Page view tracking failed:', error.message);
    res.status(500).json({ error: error.message });
  }
}