import { google } from 'googleapis';

function parseSessionData(req) {
  try {
    const sessionDataParam = req.query.sessionData;
    return sessionDataParam ? JSON.parse(decodeURIComponent(sessionDataParam)) : {};
  } catch (e) {
    return {};
  }
}

async function checkSessionDownloads(sessionId) {
  if (!sessionId) {
    return { dailyCount: 0, monthlyDownloads: [] };
  }

  try {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: privateKey,
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
    const monthlyDownloads = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const timestamp = row[0];
      const eventType = row[1];
      const rowSessionId = row[9];
      
      if (eventType === 'download' && rowSessionId === sessionId) {
        const downloadTime = new Date(timestamp).getTime();
        
        if (downloadTime > oneDayAgo) {
          dailyCount++;
        }
        
        if (downloadTime > thirtyDaysAgo) {
          monthlyDownloads.push(downloadTime);
        }
      }
    }

    return { dailyCount, monthlyDownloads };
  } catch (error) {
    console.error('Failed to check session downloads:', error);
    return { dailyCount: 0, monthlyDownloads: [] };
  }
}

export default async function handler(req, res) {
  const { url, filename } = req.query;
  
  if (!url || !filename) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const sessionData = parseSessionData(req);
  const sessionId = sessionData.sessionId;

  // Check rate limits from Google Sheets
  const { dailyCount, monthlyDownloads } = await checkSessionDownloads(sessionId);
  
  if (req.method === 'HEAD') {
    if (dailyCount >= 5) {
      return res.status(429).json({ 
        error: 'Daily download limit of 5 reached. Please try again tomorrow.' 
      });
    }
    
    if (monthlyDownloads.length >= 10) {
      const oldestDownload = Math.min(...monthlyDownloads);
      const daysUntilAvailable = Math.ceil((oldestDownload + (30 * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000));
      
      return res.status(429).json({ 
        error: `Monthly download limit of 10 reached. Your oldest download will expire in ${daysUntilAvailable} day${daysUntilAvailable !== 1 ? 's' : ''}.` 
      });
    }
    
    return res.status(200).end();
  }

  if (dailyCount >= 5) {
    return res.status(429).json({ 
      error: 'Daily download limit of 5 reached. Please try again tomorrow.' 
    });
  }
  
  if (monthlyDownloads.length >= 10) {
    const oldestDownload = Math.min(...monthlyDownloads);
    const daysUntilAvailable = Math.ceil((oldestDownload + (30 * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000));
    
    return res.status(429).json({ 
      error: `Monthly download limit of 10 reached. Your oldest download will expire in ${daysUntilAvailable} day${daysUntilAvailable !== 1 ? 's' : ''}.` 
    });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(429).json({ error: 'Download limit reached' });
    }
    
    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Track successful download AFTER limit check passes
    const category = filename.match(/^StreamBackdrops-(.+?)-\d+\.png$/)?.[1] || 'unknown';

    // Track via API call
    try {
      await fetch(`${req.headers.origin || 'https://streambackdrops.com'}/api/track-download`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'user-agent': req.headers['user-agent'] || 'browser',
          'x-forwarded-for': req.headers['x-forwarded-for'] || req.socket.remoteAddress
        },
        body: JSON.stringify({
          filename,
          category,
          ...sessionData
        })
      });
    } catch (trackError) {
      console.error('Tracking failed:', trackError);
    }
    
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Download failed:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}