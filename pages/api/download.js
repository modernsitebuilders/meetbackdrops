import { google } from 'googleapis';
import crypto from 'crypto';

function parseSessionData(req) {
  try {
    const sessionDataParam = req.query.sessionData;
    return sessionDataParam ? JSON.parse(decodeURIComponent(sessionDataParam)) : {};
  } catch (e) {
    return {};
  }
}

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'salt_streambackdrops').digest('hex').substring(0, 16);
}

async function checkIPLimit(hashedIP) {
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
      range: 'Analytics!A:M',
    });

    const rows = response.data.values || [];
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    let dailyCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const eventType = row[1];
      const rowHashedIP = row[12]; // Column M
      const timestamp = new Date(row[0]).getTime();
      
      if (eventType === 'download' && rowHashedIP === hashedIP && timestamp > oneDayAgo) {
        dailyCount++;
      }
    }

    return dailyCount;
  } catch (error) {
    console.error('IP check failed:', error);
    return 0;
  }
}

export default async function handler(req, res) {
  const { url, filename } = req.query;
  
  if (!url || !filename) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const sessionData = parseSessionData(req);
  const sessionId = sessionData.sessionId;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const hashedIP = hashIP(ip);

  // Localhost bypass
  const isLocalhost = req.headers.host?.includes('localhost');
  if ((!sessionId || sessionId === 'undefined') && !isLocalhost) {
    return res.status(403).json({ 
      error: 'Session required. Please download from streambackdrops.com' 
    });
  }

  // Check IP-based limit (20 per day)
  const ipDownloads = await checkIPLimit(hashedIP);
  if (ipDownloads >= 20) {
    return res.status(429).json({ 
      error: 'Daily download limit reached for your network. Try again tomorrow.' 
    });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(429).json({ error: 'Download failed' });
    }
    
    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const category = filename.match(/^StreamBackdrops-(.+?)-\d+\.png$/)?.[1] || 'unknown';

    try {
      await fetch(`${req.headers.origin || 'https://streambackdrops.com'}/api/track-download`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'user-agent': req.headers['user-agent'] || 'browser',
          'x-forwarded-for': req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          'x-hashed-ip': hashedIP
        },
        body: JSON.stringify({
          filename,
          category,
          hashedIP,
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