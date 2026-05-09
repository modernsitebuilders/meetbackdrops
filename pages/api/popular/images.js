// pages/api/popular/images.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    // 1. Setup Google Sheets API
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
    
    // 2. Try to read from "PopularCache" sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'PopularCache!A1:G30', // Read the main table
    });

    const rows = response.data.values || [];
    
    if (rows.length < 7) {
      throw new Error('No popular data found in Google Sheets');
    }
    
    // 3. Parse the data
    const lastUpdated = rows[1][1] || new Date().toISOString();
    const totalImages = parseInt(rows[2][1]) || 0;
    const averageScore = parseFloat(rows[3][1]) || 0;
    
    // 4. Extract images (skip header rows)
    // Cached rows may carry the legacy "StreamBackdrops-" filename prefix from
    // before the May 2026 rebrand; the actual R2 objects don't have it, so strip
    // it from both filename and webPath to keep image src + download flows valid.
    const stripLegacyPrefix = (s) => (s || '').replace(/StreamBackdrops-/gi, '');
    const images = [];
    for (let i = 6; i < rows.length; i++) {
      const row = rows[i];
      if (row.length >= 7 && row[1]) { // Has filename in column B
        images.push({
          rank: parseInt(row[0]) || i - 5,
          filename: stripLegacyPrefix(row[1]),
          category: row[2] || '',
          score: parseInt(row[3]) || 0,
          downloads: parseInt(row[4]) || 0,
          lastDownload: row[5] || null,
          webPath: stripLegacyPrefix(row[6])
        });
      }
    }
    
    // 5. Try to get JSON version for faster parsing
    let jsonData = null;
    try {
      const jsonResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'PopularCache!A31:A32', // Where JSON is stored
      });
      
      if (jsonResponse.data.values && jsonResponse.data.values.length > 1) {
        const jsonString = jsonResponse.data.values[1][0];
        jsonData = JSON.parse(jsonString);
      }
    } catch (jsonError) {
      console.log('Could not read JSON version, using parsed data');
    }
    
    // 6. Set caching headers for performance
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=300');
    
    // 7. Return response
    const responseData = {
      success: true,
      lastUpdated,
      totalImages,
      averageScore,
      images: images.slice(0, 25), // Ensure max 25
      source: 'google-sheets',
      cached: true
    };
    
    // If we have JSON data, use it (it includes full metadata)
    if (jsonData && jsonData.topImages) {
      responseData.images = jsonData.topImages.map((img) => ({
        ...img,
        filename: stripLegacyPrefix(img.filename),
        webPath: stripLegacyPrefix(img.webPath),
      }));
      responseData.topScore = jsonData.topScore;
      responseData.topImage = jsonData.topImage;
    }
    
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Error reading popular images from Google Sheets:', error);
    
    // 8. Fallback: Try to read from /tmp cache
    try {
      const fs = await import('fs');
      const path = await import('path');
      const tmpPath = path.join('/tmp', 'popular-cache.json');
      
      if (fs.existsSync(tmpPath)) {
        const cached = JSON.parse(fs.readFileSync(tmpPath, 'utf8'));
        console.log('Using fallback cache from /tmp');
        
        res.setHeader('Cache-Control', 'public, s-maxage=30');
        return res.status(200).json({
          ...cached,
          source: 'fallback-cache',
          warning: 'Using fallback cache due to Google Sheets error',
          error: error.message
        });
      }
    } catch (fallbackError) {
      // Continue to error response
    }
    
    // 9. Final error response
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch popular images',
      details: error.message,
      hint: 'Make sure the cron job has run at least once to populate data'
    });
  }
}