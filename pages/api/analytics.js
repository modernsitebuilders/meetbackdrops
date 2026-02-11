// analytics.js - UPDATED VERSION
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userAgent = req.headers['user-agent'] || '';
  
  if (!userAgent || 
      userAgent.includes('bot') || 
      userAgent.includes('Bot') ||
      userAgent.includes('crawler') || 
      userAgent.includes('spider') ||
      userAgent.includes('Prerender')) {
    return res.status(200).json({ success: true, skipped: 'bot' });
  }
  
  // Get session data from request body
  const { 
    eventType, 
    filename, 
    category, 
    originalSource,
    sessionId,
    visitorId,
    pageViewsInSession,
    downloadsInSession,
    visitorType,
    landingPage
  } = req.body;
  
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

    // CORRECTED COLUMN STRUCTURE - matches track-download.js and track-page-view.js
    const eventData = [
      new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      eventType || 'widget_event',
      originalSource || 'direct',
      filename || 'comparison-widget',
      category || 'hd',
      pageViewsInSession || 0,           // Column F: Page Views in Session
      downloadsInSession || 0,           // Column G: Downloads in Session
      visitorType || 'new',              // Column H: Visitor Type
      landingPage || '',                 // Column I: Landing Page
      sessionId || '',                   // Column J: Session ID
      visitorId || 'unknown',            // Column K: Visitor ID
      new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
      new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      req.headers['user-agent'] || 'unknown',
      req.headers['referer'] || 'direct'
    ];

        const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:O',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [eventData]
      }
    });

    // 🟩 Highlight HD purchases in light green
    if (eventType === 'hd_purchase') {
      const updatedRange = appendResponse.data.updatedRange; // e.g. "Analytics!A1523:O1523"
      const match = updatedRange.match(/!A(\d+):O(\d+)/);
      if (match) {
        const rowNumber = parseInt(match[1], 10);
        
        // Get the sheet ID for "Analytics" sheet
        const spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          fields: 'sheets.properties'
        });
        const sheet = spreadsheet.data.sheets.find(s => s.properties.title === 'Analytics');
        if (!sheet) throw new Error('Analytics sheet not found');
        const sheetId = sheet.properties.sheetId;
        
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          resource: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: rowNumber - 1,
                    endRowIndex: rowNumber
                    // No column range → entire row is highlighted
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: {
                        red: 0.85,
                        green: 0.92,
                        blue: 0.83
                      }
                    }
                  },
                  fields: 'userEnteredFormat.backgroundColor'
                }
              }
            ]
          }
        });
        
        console.log(`✅ Highlighted HD purchase at row ${rowNumber}`);
      }
    }

    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Widget tracking failed:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
}