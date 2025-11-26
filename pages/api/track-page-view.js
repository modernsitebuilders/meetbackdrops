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
      userAgent.includes('Prerender')) {
    return res.status(200).json({ success: true, skipped: 'bot' });
  }
  
  // Get the tracking data including session information
  const { 
    page, 
    category, 
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
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

    // Build the current page source string from UTM parameters
    let currentSource = 'direct';
    if (utm_source) {
      currentSource = `${utm_source}`;
      if (utm_medium) {
        currentSource += `/${utm_medium}`;
      }
      if (utm_campaign) {
        currentSource += `/${utm_campaign}`;
      }
    } else if (referrer && referrer !== 'direct') {
      currentSource = referrer;
    }

    // Build the original source string (most important for attribution)
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
      originalSource,                   // Column C: Original Source (moved up)
      page,
      category || 'n/a',
      pageViewsInSession || 1,          // Column F: Page Views in Session
      downloadsInSession || 0,          // Column G: Downloads in Session
      visitorType || 'new',             // Column H: Visitor Type
      landingPage || '',                // Column I: Landing Page
      sessionId || '',                  // Column J: Session ID
      visitorId || 'unknown',           // Column K: Visitor ID
      new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
      new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      req.headers['user-agent'] || 'unknown',
      currentSource                     // Column O: Current referrer
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:O',           // Extended to column O
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