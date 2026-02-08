import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Block tracking from bots, crawlers, and build processes
  const userAgent = req.headers['user-agent'] || '';
  
  // Only block actual bots, not real browsers
  if (!userAgent || 
    userAgent.includes('bot') || 
    userAgent.includes('Bot') ||
    userAgent.includes('crawler') || 
    userAgent.includes('spider') ||
    userAgent.includes('Prerender') ||
    userAgent.toLowerCase().startsWith('node') ||
    userAgent.includes('axios') ||
    userAgent.includes('python') ||
    userAgent.includes('curl') ||
    userAgent.includes('wget')) {
  return res.status(200).json({ success: true, skipped: 'bot' });
}

  const { 
    filename, 
    category,
    // New session-based attribution
    sessionId,
    originalReferrer,
    originalUtmSource,
    originalUtmMedium,
    originalUtmCampaign,
    landingPage,
    pageViewsInSession,
    downloadsInSession,
    visitorId,
    visitorType
  } = req.body;
  
  // Normalize category to canonical folder names
  const categoryMap = {
    'art-gallery': 'art-galleries',
    'bokeh': 'bokeh-backgrounds',
    'bookshelf': 'bookshelves-dark',
    'office-space': 'office-spaces',
    'historic-space': 'historic-spaces',
    'nature-landscape': 'nature-landscapes',
    'living-room': 'living-rooms',
    'conference-room': 'conference-rooms',
    'coffee-shop': 'coffee-shops',
    'urban-loft': 'urban-lofts',
    'garden': 'gardens-patios',
    'library': 'libraries',
    'kitchen': 'kitchens'
  };
  
  let cleanCategory = category.includes('.') 
    ? category.replace(/\.webp$/i, '').replace(/\.png$/i, '').replace(/-\d+$/, '')
    : category;
  
  cleanCategory = categoryMap[cleanCategory] || cleanCategory;
  
  try {
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

    // Check for duplicate downloads in last 10 seconds
    const recentData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:P',
    });
    
    const rows = recentData.data.values || [];
    const tenSecondsAgo = Date.now() - 10000;
    
    for (let i = rows.length - 1; i >= Math.max(0, rows.length - 20); i--) {
      const row = rows[i];
      const rowTime = new Date(row[0]).getTime();
      
      if (rowTime < tenSecondsAgo) break;
      
      if (row[1] === 'download' && 
          row[3] === filename && 
          row[9] === sessionId) {
        return res.status(200).json({ success: true, skipped: 'recent_duplicate' });
      }
    }

    // Build the original source string (most important for conversion attribution)
    let originalSource = originalReferrer || 'direct';
    if (originalUtmSource) {
      originalSource = originalUtmSource;
      if (originalUtmMedium) {
        originalSource += `/${originalUtmMedium}`;
      }
      if (originalUtmCampaign) {
        originalSource += `/${originalUtmCampaign}`;
      }
    }

    const downloadData = [
      new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      'download',
      originalSource,
      filename,
      cleanCategory,
      pageViewsInSession || 0,
      downloadsInSession || 0,
      visitorType || 'new',
      landingPage || '',
      sessionId || '',
      visitorId || 'unknown',
      new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
      new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      req.headers['user-agent'] || 'unknown',
      req.headers['referer'] || 'direct',
      req.headers['x-hashed-ip'] || 'unknown' 
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:O',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [downloadData]
      }
    });

    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Download tracking failed:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
}