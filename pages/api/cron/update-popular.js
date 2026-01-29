import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const RESET_DATE = new Date('2026-01-25');

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
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
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:O',
    });

    const rows = response.data.values;
    const imageStats = {};
    const now = new Date();
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const timestamp = row[0];
      const actionType = row[1];
      const filename = row[3];
      const category = row[4];
      
      const eventDate = new Date(timestamp);
      
      if (actionType === 'download' && 
          filename && 
          filename.match(/\.(webp|png|jpg|jpeg)$/i) &&
          eventDate >= RESET_DATE) {
        if (!imageStats[filename]) {
          imageStats[filename] = {
            filename: filename,
            category: category || 'unknown',
            downloads: 0,
            lastDownload: null
          };
        }
        imageStats[filename].downloads++;
        
        if (!imageStats[filename].lastDownload || eventDate > imageStats[filename].lastDownload) {
          imageStats[filename].lastDownload = eventDate;
        }
      }
    }

    const folderMap = {
      'christmas-background': 'christmas-backgrounds',
      'halloween-background': 'halloween-backgrounds',
      'nature-landscape': 'nature-landscapes',
      'living-room': 'living-rooms',
      'office-space': 'office-spaces',
      'office-spaces': 'office-spaces',
      'bookshelf': 'bookshelves-dark',
      'bookshelves-bright': 'bookshelves-bright',
      'bookshelves-dark': 'bookshelves-dark',
      'library': 'libraries',
      'kitchen': 'kitchens',
      'garden': 'gardens-patios',
      'coffee-shop': 'coffee-shops',
      'historic-space': 'historic-spaces',
      'historic-spaces': 'historic-spaces',
      'urban-loft': 'urban-lofts',
      'wall-shelves-bright': 'wall-shelves-bright',
      'wall-shelves-dark': 'wall-shelves-dark',
      'bokeh': 'bokeh-backgrounds',
      'bokeh-backgrounds': 'bokeh-backgrounds',
      'art-gallery': 'art-galleries',
      'art-galleries': 'art-galleries'
    };

    const scoredImages = Object.values(imageStats).map(item => {
      let score = 30;
      score += item.downloads * 10;
      
      if (item.lastDownload) {
        const monthsSince = (now - item.lastDownload) / (1000 * 60 * 60 * 24 * 30);
        score -= Math.floor(monthsSince) * 5;
      } else {
        const monthsSince = (now - RESET_DATE) / (1000 * 60 * 60 * 24 * 30);
        score -= Math.floor(monthsSince) * 5;
      }
      
      score = Math.max(0, score);
      
      const webFilename = item.filename
          .replace('StreamBackdrops-', '')
          .replace('.png', '.webp');
      const extracted = item.category.replace(/\.webp$/i, '').replace(/\.png$/i, '').replace(/-\d+$/, '');
      const category = folderMap[extracted] || extracted;
      
      return {
        filename: item.filename,
        category: category,
        downloadCount: item.downloads,
        score: score,
        webPath: `/images/${category}/${webFilename}`
      };
    });

    const topImages = scoredImages
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);

    const cacheData = {
      lastUpdated: new Date().toISOString(),
      images: topImages
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'public/popular-cache.json'),
      JSON.stringify(cacheData, null, 2)
    );

    res.status(200).json({ 
      success: true, 
      updated: new Date().toISOString(),
      topScore: topImages[0]?.score || 0 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}