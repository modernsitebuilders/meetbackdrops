import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
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

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:O',
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return res.status(200).json({ success: false, message: 'No data' });
    }

    const downloadCounts = {};
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const actionType = row[1];
      const filename = row[3];
      const category = row[4];
      
      if (actionType === 'download' && filename && filename.match(/\.(webp|png|jpg|jpeg)$/i)) {
        if (!downloadCounts[filename]) {
          downloadCounts[filename] = {
            filename: filename,
            category: category || 'unknown',
            count: 0
          };
        }
        downloadCounts[filename].count++;
      }
    }

    const topImages = Object.values(downloadCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => {
        const webFilename = item.filename.replace('.png', '.webp');
        const extracted = item.category.replace(/\.webp$/i, '').replace(/\.png$/i, '').replace(/-\d+$/, '');
        
        const folderMap = {
          'christmas-background': 'christmas-backgrounds',
          'christmas-modern': 'christmas-modern',
          'christmas-rustic': 'christmas-rustic',
          'christmas-traditional': 'christmas-traditional',
          'halloween-background': 'halloween-backgrounds',
          'nature-landscape': 'nature-landscapes',
          'living-room': 'living-rooms',
          'office-space': 'office-spaces',
          'bookshelf': 'bookshelves-dark',
          'library': 'libraries',
          'kitchen': 'kitchens',
          'garden': 'gardens-patios',
          'conference-room': 'conference-rooms',
          'coffee-shop': 'coffee-shops',
          'historic-space': 'historic-spaces',
          'urban-loft': 'urban-lofts',
          'wall-shelves-bright': 'wall-shelves-bright',
          'wall-shelves-dark': 'wall-shelves-dark',
        };
        
        const category = folderMap[extracted] || extracted;
        
        return {
          filename: item.filename,
          category: category,
          downloadCount: item.count,
          webPath: `https://res.cloudinary.com/dnhju6mhg/image/upload/webp/${category}/${webFilename}`
        };
      });

    const cacheData = {
      lastUpdated: new Date().toISOString(),
      images: topImages
    };

    const publicDir = path.join(process.cwd(), 'public');
    fs.writeFileSync(
      path.join(publicDir, 'popular-cache.json'),
      JSON.stringify(cacheData, null, 2)
    );

    res.status(200).json({ 
      success: true, 
      cached: topImages.length,
      timestamp: cacheData.lastUpdated 
    });
    
  } catch (error) {
    console.error('Cache generation failed:', error);
    res.status(500).json({ error: error.message });
  }
}