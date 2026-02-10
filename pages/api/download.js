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
      range: 'Analytics!A:P',
    });

    const rows = response.data.values || [];
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    let dailyCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 16) continue;
      
      const eventType = row[1];
      const rowHashedIP = row[15]; // Column P
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

async function checkIPLimitMonthly(hashedIP) {
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
      range: 'Analytics!A:P',
    });

    const rows = response.data.values || [];
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    let monthlyCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 16) continue;
      
      const eventType = row[1];
      const rowHashedIP = row[15]; // Column P
      const timestamp = new Date(row[0]).getTime();
      
      if (eventType === 'download' && rowHashedIP === hashedIP && timestamp > thirtyDaysAgo) {
        monthlyCount++;
      }
    }

    return monthlyCount;
  } catch (error) {
    console.error('Monthly IP check failed:', error);
    return 0;
  }
}

async function getOldestDownloadDate(hashedIP) {
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
      range: 'Analytics!A:P',
    });

    const rows = response.data.values || [];
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    let oldestDate = null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 16) continue;
      
      const eventType = row[1];
      const rowHashedIP = row[15]; // Column P
      const timestamp = new Date(row[0]);
      
      if (eventType === 'download' && rowHashedIP === hashedIP && timestamp.getTime() > thirtyDaysAgo) {
        if (!oldestDate || timestamp < oldestDate) {
          oldestDate = timestamp;
        }
      }
    }

    return oldestDate;
  } catch (error) {
    console.error('Oldest download check failed:', error);
    return null;
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

  // Check IP-based limits
  const ipDownloads = await checkIPLimit(hashedIP);
  
  // Daily limit: 5 downloads per day
  const dailyLimit = 5;
  const dailyDownloads = ipDownloads;
  if (dailyDownloads >= dailyLimit) {
    return res.status(429).json({ 
      error: 'Daily download limit reached. You can download 5 images per day. Come back tomorrow!' 
    });
  }
  
  // Monthly limit: 10 downloads per 30 days
  const monthlyLimit = 10;
  const monthlyDownloads = await checkIPLimitMonthly(hashedIP);
  if (monthlyDownloads >= monthlyLimit) {
    const oldestDownloadDate = await getOldestDownloadDate(hashedIP);
    const daysUntilExpiry = oldestDownloadDate ? Math.ceil((oldestDownloadDate.getTime() + 30*24*60*60*1000 - Date.now()) / (24*60*60*1000)) : 1;
    return res.status(429).json({ 
      error: `Monthly download limit reached. Your oldest download will expire in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}, then you can download more!`
    });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(500).json({ error: 'Download failed' });
    }
    
    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Download failed:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}