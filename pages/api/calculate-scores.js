import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Cache scores in memory (persists during function lifetime)
let cachedScores = null;
let lastCalculated = null;

export default async function handler(req, res) {
  try {
    // If we have cached scores less than 1 hour old, return them
    if (cachedScores && lastCalculated && (Date.now() - lastCalculated < 3600000)) {
      return res.status(200).json({ 
        message: 'Returning cached scores',
        cached: true,
        calculatedAt: new Date(lastCalculated).toISOString(),
        scores: cachedScores
      });
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
    
    // Load ALL images from metadata
    const metadataPath = path.join(process.cwd(), 'public', 'data', 'image-metadata-complete.json');
    const allImagesData = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I',
    });

    const rows = response.data.values || [];
    const now = new Date();
    
    // Map old category names to new slugs
    const categoryMapping = {
      'ambient-lighting': 'wall-shelves-dark',
      'Ambient Lighting': 'wall-shelves-dark',
      'well-lit': 'wall-shelves-bright',
      'Well Lit': 'wall-shelves-bright'
    };
    
    // Category display names
    const categoryNames = {
      'bookshelves-bright': 'Bookshelves - Bright',
      'bookshelves-dark': 'Bookshelves - Dark',
      'wall-shelves-bright': 'Wall Shelves - Bright',
      'wall-shelves-dark': 'Wall Shelves - Dark',
      'office-spaces': 'Office Spaces',
      'living-rooms': 'Living Rooms',
      'kitchens': 'Kitchens',
      'coffee-shops': 'Coffee Shops',
      'art-galleries': 'Art Galleries',
      'urban-lofts': 'Urban Lofts',
      'gardens-patios': 'Gardens & Patios',
      'historic-spaces': 'Historic Spaces',
      'nature-landscapes': 'Nature & Landscapes',
      'libraries': 'Libraries',
      'christmas-backgrounds': 'Christmas Backgrounds',
      'halloween-backgrounds': 'Halloween Backgrounds',
      'bokeh-backgrounds': 'Bokeh Backgrounds'
    };
    
    // Initialize stats for ALL images from metadata
    const imageStats = {};
    
    Object.entries(allImagesData).forEach(([imageId, image]) => {
      const category = image.category;
      const categoryDisplayName = categoryNames[category] || category;
      
      imageStats[image.filename] = {
        category: categoryDisplayName,
        categorySlug: category,
        downloads: 0,
        pageviews: 0,
        firstSeen: now,
        lastDownload: null,
        recentDownloads: 0,
        score: 0,
        tracked: false
      };
    });
    
    // Now update with actual tracking data from sheets
    rows.slice(1).forEach(row => {
      const timestamp = row[0];
      const eventType = row[1];
      const filename = row[3];
      let category = row[4];
      
      if (!filename) return;
      
      if (filename.startsWith('/') || 
          filename.includes('/category/') || 
          filename.includes('/blog') ||
          filename.includes('/contact') ||
          filename.includes('/about') ||
          !filename.match(/\.(webp|jpg|jpeg|png)$/i)) {
        return;
      }
      
      if (categoryMapping[category]) {
        category = categoryMapping[category];
      }
      
      // Try to find matching image by stripping extension
      let matchedFilename = filename;
      if (!imageStats[filename]) {
        const baseName = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
        const variants = [
          `${baseName}.webp`,
          `${baseName}.png`,
          `${baseName}.jpg`,
          `${baseName}.jpeg`
        ];
        
        let found = false;
        for (const variant of variants) {
          if (imageStats[variant]) {
            matchedFilename = variant;
            found = true;
            break;
          }
        }
        
        if (!found) {
          return;
        }
      }
      
      if (!imageStats[matchedFilename].tracked) {
        imageStats[matchedFilename].tracked = true;
        imageStats[matchedFilename].firstSeen = new Date(timestamp);
      }
      
      const eventDate = new Date(timestamp);
      
      if (eventType === 'download') {
        imageStats[matchedFilename].downloads += 1;
        
        if (!imageStats[matchedFilename].lastDownload || eventDate > imageStats[matchedFilename].lastDownload) {
          imageStats[matchedFilename].lastDownload = eventDate;
        }
        
        const daysSinceEvent = (now - eventDate) / (1000 * 60 * 60 * 24);
        if (daysSinceEvent <= 30) {
          imageStats[matchedFilename].recentDownloads += 1;
        }
      } else if (eventType === 'page_view') {
        imageStats[matchedFilename].pageviews += 1;
      }
      
      if (eventDate < imageStats[matchedFilename].firstSeen) {
        imageStats[matchedFilename].firstSeen = eventDate;
      }
    });

    // Calculate final scores
    Object.keys(imageStats).forEach(filename => {
      const stats = imageStats[filename];
      
      if (!stats.tracked) {
        stats.score = 0;
        stats.daysOld = 0;
        stats.daysSinceLastDownload = null;
        return;
      }
      
      let score = 0;
      
      score += (stats.downloads * 10);
      score += (stats.pageviews * 1);
      
      if (stats.recentDownloads > 0) {
        score += stats.recentDownloads * 2;
      }
      
      if (stats.downloads === 0) {
        const daysOld = (now - stats.firstSeen) / (1000 * 60 * 60 * 24);
        const agePenalty = Math.floor(daysOld / 7) * 5;
        score -= agePenalty;
      }
      const isNewChristmas = filename.match(/christmas-background-(\d+)\.webp/);
if (isNewChristmas) {
  const num = parseInt(isNewChristmas[1]);
  if (num >= 47 && num <= 130) {
    stats.score += 15;
  }
}
      
      if (stats.downloads > 0 && stats.lastDownload) {
        const daysSinceLastDownload = (now - stats.lastDownload) / (1000 * 60 * 60 * 24);
        if (daysSinceLastDownload > 30) {
          const dormantPenalty = Math.floor(daysSinceLastDownload / 30) * 2;
          score -= dormantPenalty;
        }
      }
      
      if (stats.recentDownloads === 0 && stats.downloads > 5) {
        score -= 5;
      }
      
      if (stats.tracked) {
        score = Math.max(1, score);
      }
      
      stats.score = score;
      stats.daysOld = Math.floor((now - stats.firstSeen) / (1000 * 60 * 60 * 24));
      stats.daysSinceLastDownload = stats.lastDownload 
        ? Math.floor((now - stats.lastDownload) / (1000 * 60 * 60 * 24))
        : null;
    });

    // Cache the scores in memory
    cachedScores = imageStats;
    lastCalculated = Date.now();

    // Try to save to /tmp for backup (doesn't matter if it fails)
    try {
      const tmpPath = path.join('/tmp', 'image-scores.json');
      fs.writeFileSync(tmpPath, JSON.stringify(imageStats, null, 2));
    } catch (e) {
      // Ignore write errors
    }

    const summary = {
      totalImages: Object.keys(imageStats).length,
      trackedImages: Object.values(imageStats).filter(s => s.tracked).length,
      untrackedImages: Object.values(imageStats).filter(s => !s.tracked).length,
      zeroDownloads: Object.values(imageStats).filter(s => s.downloads === 0).length,
      dormant: Object.values(imageStats).filter(s => s.daysSinceLastDownload > 30).length,
      topPerformers: Object.entries(imageStats)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 10)
        .map(([filename, stats]) => ({ 
          filename,
          category: stats.category,
          score: stats.score, 
          downloads: stats.downloads,
          pageviews: stats.pageviews,
          tracked: stats.tracked
        })),
      bottomPerformers: Object.entries(imageStats)
        .sort((a, b) => a[1].score - b[1].score)
        .slice(0, 10)
        .map(([filename, stats]) => ({ 
          filename,
          category: stats.category,
          score: stats.score, 
          downloads: stats.downloads,
          pageviews: stats.pageviews,
          tracked: stats.tracked
        }))
    };

    res.status(200).json({ 
      message: 'Scores calculated successfully',
      cached: false,
      calculatedAt: new Date(lastCalculated).toISOString(),
      summary,
      scores: imageStats
    });

  } catch (error) {
    console.error('Error calculating scores:', error);
    res.status(500).json({ error: 'Failed to calculate scores', details: error.message });
  }
}