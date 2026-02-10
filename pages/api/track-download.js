import { google } from 'googleapis';

export default async function handler(req, res) {
  console.log('📥 Download tracking request received:', {
    method: req.method,
    hasBody: !!req.body,
    filename: req.body?.filename,
    category: req.body?.category,
    timestamp: new Date().toISOString()
  });

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Block tracking from bots, crawlers, and build processes
  const userAgent = req.headers['user-agent'] || '';
  
  const isBot = !userAgent || 
    userAgent.includes('bot') || 
    userAgent.includes('Bot') ||
    userAgent.includes('crawler') || 
    userAgent.includes('spider') ||
    userAgent.includes('Prerender') ||
    userAgent.toLowerCase().startsWith('node') ||
    userAgent.includes('axios') ||
    userAgent.includes('python') ||
    userAgent.includes('curl') ||
    userAgent.includes('wget');
  
  if (isBot) {
    console.log('🤖 Skipping bot/crawler:', userAgent);
    return res.status(200).json({ success: true, skipped: 'bot' });
  }

  const { 
    filename, 
    category,
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
  
  if (!filename) {
    console.log('❌ Missing filename in request');
    return res.status(400).json({ success: false, error: 'Missing filename' });
  }
  
  console.log('📊 Processing download tracking for:', {
    filename,
    category,
    sessionId: sessionId?.substring(0, 10) + '...',
    visitorId: visitorId?.substring(0, 10) + '...',
    visitorType
  });

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
  
  let cleanCategory = category || 'unknown';
  if (cleanCategory.includes('.')) {
    cleanCategory = cleanCategory.replace(/\.webp$/i, '').replace(/\.png$/i, '').replace(/-\d+$/, '');
  }
  
  cleanCategory = categoryMap[cleanCategory] || cleanCategory;
  
  try {
    if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SERVICE_EMAIL || !process.env.GOOGLE_SHEET_ID) {
      console.error('❌ Missing Google Sheets environment variables');
      throw new Error('Google Sheets configuration missing');
    }

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

    console.log('🔍 Checking for duplicates...');
    let duplicateCheckPassed = true;
    
    try {
      const recentData = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Analytics!A:P',
      });
      
      const rows = recentData.data.values || [];
      const tenSecondsAgo = Date.now() - 10000;
      
      const checkLimit = Math.min(50, rows.length);
      for (let i = rows.length - 1; i >= Math.max(0, rows.length - checkLimit); i--) {
        const row = rows[i];
        if (row && row.length >= 10) {
          const rowTime = row[0] ? new Date(row[0]).getTime() : 0;
          
          if (rowTime && rowTime < tenSecondsAgo) break;
          
          if (row[1] === 'download' && 
              row[3] === filename && 
              row[9] === sessionId) {
            console.log('⭕ Skipping duplicate download:', {
              filename,
              sessionId: sessionId?.substring(0, 10) + '...',
              rowTime: new Date(rowTime).toISOString()
            });
            duplicateCheckPassed = false;
            break;
          }
        }
      }
    } catch (duplicateError) {
      console.warn('⚠️ Duplicate check failed, proceeding anyway:', duplicateError.message);
    }

    if (!duplicateCheckPassed) {
      return res.status(200).json({ success: true, skipped: 'recent_duplicate' });
    }

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

    const now = new Date();

    const downloadData = [
      now.toLocaleString('en-US', {
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
      now.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
      now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      req.headers['user-agent'] || 'unknown',
      req.headers['referer'] || 'direct',
      req.headers['x-hashed-ip'] || 'unknown' 
    ];

    console.log('📝 Appending to Google Sheets:', {
      filename,
      cleanCategory,
      timestamp: downloadData[0]
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:P',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [downloadData]
      }
    });

    console.log('✅ Download tracked successfully:', {
      filename,
      category: cleanCategory,
      sessionId: sessionId?.substring(0, 10) + '...',
      timestamp: now.toISOString()
    });
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('❌ Download tracking failed:', {
      error: error.message,
      stack: error.stack,
      filename,
      category: cleanCategory,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ 
      success: false, 
      error: 'Tracking failed but download may proceed',
      message: error.message,
      timestamp: new Date().toISOString() 
    });
  }
}