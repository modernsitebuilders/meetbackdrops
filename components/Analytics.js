import { google } from 'googleapis';

export default async function handler(req, res) {
  const { url, filename } = req.query;
  
  if (!url || !filename) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Get session ID from cookie
  const sessionId = req.cookies.session_id;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'No session found. Please refresh the page.' });
  }

  try {
    // Connect to Google Sheets to check download count
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

    // Get all analytics data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:N',
    });

    const rows = response.data.values || [];
    
    // Count downloads for this session
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    let dailyCount = 0;
    let weeklyCount = 0;
    
    // Skip header row, check all rows for this session's downloads
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const eventType = row[1]; // Column B
      const rowSessionId = row[9]; // Column J
      const timestamp = row[0]; // Column A
      
      if (eventType === 'download' && rowSessionId === sessionId) {
        const rowDate = new Date(timestamp);
        const rowTime = rowDate.getTime();
        
        if (rowTime > oneDayAgo) {
          dailyCount++;
        }
        if (rowTime > sevenDaysAgo) {
          weeklyCount++;
        }
      }
    }
    
    // Check daily limit (5 per day)
    if (dailyCount >= 5) {
      return res.status(429).json({ 
        error: 'Daily download limit of 5 reached. Please try again tomorrow.' 
      });
    }
    
    // Check weekly limit (30 per week)
    if (weeklyCount >= 30) {
      return res.status(429).json({ 
        error: 'Weekly download limit of 30 reached. Please try again in a few days.' 
      });
    }

    // Fetch image from Cloudinary
    const imageResponse = await fetch(url);
    
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const buffer = await imageResponse.arrayBuffer();
    
    // Set headers to force download with custom filename
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Download failed:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}