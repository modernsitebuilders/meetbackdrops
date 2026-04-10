// pages/api/cron/update-popular.js
import { google } from 'googleapis';
import { calculateImageScore } from '../../../lib/imageScoring';

const RESET_DATE = new Date('2026-01-25');

// Map old category names to new slugs (same as calculate-scores.js)
const categoryMapping = {
  'ambient-lighting': 'wall-shelves-dark',
  'Ambient Lighting': 'wall-shelves-dark',
  'well-lit': 'wall-shelves-bright',
  'Well Lit': 'wall-shelves-bright'
};

// Folder map for conversion
const folderMap = {
  'christmas-background': 'christmas-backgrounds',
  'halloween-background': 'halloween-backgrounds',
  'nature-landscape': 'nature-landscapes',
  'nature-landscapes': 'nature-landscapes',
  'living-room': 'living-rooms',
  'living-rooms': 'living-rooms',
  'office-space': 'office-spaces',
  'office-spaces': 'office-spaces',
  'bookshelf': 'bookshelves-dark',
  'bookshelves-bright': 'bookshelves-bright',
  'bookshelves-dark': 'bookshelves-dark',
  'library': 'libraries',
  'kitchen': 'kitchens',
  'garden': 'gardens-patios',
  'conference-room': 'conference-rooms',
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

// Helper function to clean and match filenames (same as calculate-scores.js)
function cleanFilename(filename) {
  if (!filename) return null;
  
  // Strip StreamBackdrops prefix
  let clean = filename;
  if (clean.startsWith('StreamBackdrops-')) {
    clean = clean.replace('StreamBackdrops-', '');
  }
  
  // Skip non-image entries
  if (clean.startsWith('/') ||
      clean.includes('/category/') || 
      clean.includes('/blog') ||
      clean.includes('/contact') ||
      clean.includes('/about') ||
      !clean.match(/\.(webp|png|jpg|jpeg)$/i)) {
    return null;
  }
  
  return clean;
}

// Helper to get webp version
function toWebpFilename(filename) {
  return filename.replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

// Helper to extract category from filename
function extractCategory(filename, rawCategory) {
  let category = rawCategory || '';
  
  // Apply category mapping if needed
  if (categoryMapping[category]) {
    category = categoryMapping[category];
  }
  
  // If category is empty or looks like a filename (contains .png/.webp), extract from filename
  if (!category || category.includes('.webp') || category.includes('.png')) {
    const baseName = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
    const nameParts = baseName.split('-');
    
    // Remove number suffix and get the category part
    const withoutNumber = nameParts.filter(part => !/^\d+$/.test(part)).join('-');
    
    // Handle special cases - these return CLEAN category slugs
    if (withoutNumber.includes('office-spaces') || withoutNumber === 'office-spaces') {
      return 'office-spaces';
    } else if (withoutNumber.includes('bookshelves-bright') || withoutNumber === 'bookshelves-bright') {
      return 'bookshelves-bright';
    } else if (withoutNumber.includes('bookshelves-dark') || withoutNumber === 'bookshelves-dark') {
      return 'bookshelves-dark';
    } else if (withoutNumber.includes('wall-shelves-bright') || withoutNumber === 'wall-shelves-bright') {
      return 'wall-shelves-bright';
    } else if (withoutNumber.includes('wall-shelves-dark') || withoutNumber === 'wall-shelves-dark') {
      return 'wall-shelves-dark';
    } else if (withoutNumber.includes('living-room') || withoutNumber === 'living-room') {
      return 'living-rooms';
    } else if (withoutNumber.includes('nature-landscape') || withoutNumber === 'nature-landscape') {
      return 'nature-landscapes';
    } else if (withoutNumber.includes('coffee-shop') || withoutNumber === 'coffee-shop') {
      return 'conference-rooms';
    } else if (filename.startsWith('coffee-shop-')) {
      return 'coffee-shops';
    } else if (withoutNumber.includes('art-gallery') || withoutNumber === 'art-gallery') {
      return 'art-galleries';
    } else if (withoutNumber.includes('urban-loft') || withoutNumber === 'urban-loft') {
      return 'urban-lofts';
    } else if (withoutNumber.includes('garden') || withoutNumber === 'garden') {
      return 'gardens-patios';
    } else if (withoutNumber.includes('historic-space') || withoutNumber === 'historic-space') {
      return 'historic-spaces';
    } else if (withoutNumber.includes('library') || withoutNumber === 'library') {
      return 'libraries';
    } else if (withoutNumber.includes('kitchen') || withoutNumber === 'kitchen') {
      return 'kitchens';
    } else if (withoutNumber.includes('christmas-background') || withoutNumber === 'christmas-background') {
      return 'christmas-backgrounds';
    } else if (withoutNumber.includes('halloween-background') || withoutNumber === 'halloween-background') {
      return 'halloween-backgrounds';
    } else if (withoutNumber.includes('bokeh') || withoutNumber === 'bokeh') {
      return 'bokeh-backgrounds';
    }
    
    // Map to folder for any remaining cases
    return folderMap[withoutNumber] || withoutNumber;
  }
  
  // Final folder mapping for whatever remains
  return folderMap[category] || category;
}

export default async function handler(req, res) {
  // Security check
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Starting popular cache update at', new Date().toISOString());

  try {
    // 1. Setup Google Sheets API
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('GOOGLE_PRIVATE_KEY environment variable is missing');
    }
    
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
    
    // 2. Fetch download data from Google Sheets
    console.log('Fetching data from Google Sheets...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:O',
    });

    const rows = response.data.values || [];
    console.log(`Found ${rows.length} rows in Google Sheets`);
    
    const imageStats = {};
    const now = new Date();
    
    // 3. Process downloads from Jan 25, 2026 forward (SAME LOGIC AS calculate-scores.js)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const timestamp = row[0];
      const eventType = row[1];
      const filename = row[3];
      let category = row[4];
      
      // Clean filename
      const cleanName = cleanFilename(filename);
      if (!cleanName || eventType !== 'download') continue;
      
      const eventDate = new Date(timestamp);
      if (eventDate < RESET_DATE) continue;
      
      // Apply category mapping
      if (categoryMapping[category]) {
        category = categoryMapping[category];
      }
      
      // Try to find matching image by stripping extension (SAME AS calculate-scores.js)
      let matchedFilename = cleanName;
      if (!imageStats[cleanName]) {
        const baseName = cleanName.replace(/\.(webp|png|jpg|jpeg)$/i, '');
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
          // Initialize new entry
          imageStats[cleanName] = {
            filename: cleanName,
            category: category || 'unknown',
            downloads: 0,
            lastDownload: null
          };
          matchedFilename = cleanName;
        }
      }
      
      // Update stats
      const stats = imageStats[matchedFilename];
      stats.downloads += 1;
      
      if (!stats.lastDownload || eventDate > stats.lastDownload) {
        stats.lastDownload = eventDate;
      }
    }

    console.log(`Processed ${Object.keys(imageStats).length} unique images with downloads`);

    // 4. Calculate scores using new system
    console.log('Calculating scores...');
    const scoredImages = Object.values(imageStats).map(item => {
      const imageData = {
        createdDate: RESET_DATE,
        totalDownloads: item.downloads,
        lastDownload: item.lastDownload
      };
      
      const score = calculateImageScore(imageData, now);
      
      // Convert to webp for web display
      const webFilename = toWebpFilename(item.filename);
      
      // Extract and clean category
      const finalCategory = extractCategory(item.filename, item.category);
      
      return {
        filename: webFilename,  // office-spaces-35.webp
        originalFilename: item.filename,  // office-spaces-35.png (without StreamBackdrops-)
        category: finalCategory,
        downloadCount: item.downloads,
        score: score,
        lastDownload: item.lastDownload,
        webPath: `https://res.cloudinary.com/dnhju6mhg/image/upload/webp/${finalCategory}/${webFilename}`
      };
    });

    // 5. Sort and get top 25 — exclude HD-only images and holiday categories
    const EXCLUDED_CATEGORIES = [
      'valentines-backgrounds',
      'christmas-backgrounds',
      'halloween-backgrounds',
      'easter-backgrounds'
    ];

    const allImagesArray = require('../../../public/data/image-metadata-complete.json');
    const allImagesData = {};
    allImagesArray.forEach(img => { allImagesData[img.filename] = img; });
    const topImages = scoredImages
      .filter(img => {
        const meta = allImagesData[img.filename] || allImagesData[img.originalFilename];
        if (meta?.hdOnly) return false;
        if (EXCLUDED_CATEGORIES.includes(img.category)) return false;
        return true;
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.downloadCount !== a.downloadCount) return b.downloadCount - a.downloadCount;
        if (a.lastDownload && b.lastDownload) return new Date(b.lastDownload) - new Date(a.lastDownload);
        return 0;
      })
      .slice(0, 25);

    console.log(`Top image: ${topImages[0]?.filename} with score ${topImages[0]?.score}`);

   // 6. Prepare data for Google Sheets - FIXED VERSION
const sheetData = [
  ['=== POPULAR IMAGES CACHE ==='],
  ['Last Updated', new Date().toISOString()],
  ['Total Images Processed', scoredImages.length],
  ['Average Score', Math.round(scoredImages.reduce((sum, img) => sum + img.score, 0) / scoredImages.length)],
  [''],
  ['Rank', 'Web Filename', 'Category', 'Score', 'Downloads', 'Last Download', 'Web Path']
];

topImages.forEach((img, index) => {
  sheetData.push([
    index + 1,
    img.filename,                    // office-spaces-19.webp
    img.category,                    // office-spaces (NOT the filename!)
    img.score,                       // Actual score (not 0!)
    img.downloadCount,               // Downloads count
    img.lastDownload ? new Date(img.lastDownload).toISOString() : 'Never',
    img.webPath                      // /images/office-spaces/office-spaces-19.webp
  ]);
});

// 7. Write to Google Sheets "PopularCache" tab
console.log('Writing to Google Sheets...');

// Clear existing data
await sheets.spreadsheets.values.clear({
  spreadsheetId: process.env.GOOGLE_SHEET_ID,
  range: 'PopularCache!A1:Z1000'
});

// Write new data
await sheets.spreadsheets.values.update({
  spreadsheetId: process.env.GOOGLE_SHEET_ID,
  range: 'PopularCache!A1',
  valueInputOption: 'RAW',
  resource: { values: sheetData }
});

// 8. Also write a simple JSON version for quick reading
const metadata = {
  lastUpdated: new Date().toISOString(),
  totalImages: scoredImages.length,
  topImage: topImages[0]?.filename || '',
  topScore: topImages[0]?.score || 0,
  topImages: topImages.map(img => ({
    rank: topImages.indexOf(img) + 1,
    filename: img.filename,
    category: img.category,
    score: img.score,
    downloads: img.downloadCount,
    lastDownload: img.lastDownload ? new Date(img.lastDownload).toISOString() : null,
    webPath: img.webPath
  }))
};

await sheets.spreadsheets.values.update({
  spreadsheetId: process.env.GOOGLE_SHEET_ID,
  range: 'PopularCache!A30',
  valueInputOption: 'RAW',
  resource: { values: [['=== JSON VERSION ==='], [JSON.stringify(metadata, null, 2)]] }
});
    
    // 9. Backup: Write to /tmp for fallback
    try {
      const fs = await import('fs');
      const path = await import('path');
      const cacheData = {
        lastUpdated: new Date().toISOString(),
        images: topImages,
        source: 'google-sheets-backup'
      };
      
      const tmpPath = path.join('/tmp', 'popular-cache.json');
      fs.writeFileSync(tmpPath, JSON.stringify(cacheData, null, 2));
      console.log('Backup written to /tmp');
    } catch (tmpError) {
      console.warn('Could not write backup to /tmp:', tmpError.message);
    }

    // 10. Return success response
    res.status(200).json({ 
      success: true, 
      updated: new Date().toISOString(),
      domain: 'streambackdrops.com',
      recordsProcessed: scoredImages.length,
      topScore: topImages[0]?.score || 0,
      topImage: topImages[0]?.filename || 'None',
      sheetUrl: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}/edit#gid=0`,
      message: 'Popular cache updated in Google Sheets successfully'
    });
    
  } catch (error) {
    console.error('Error updating popular cache:', error);
    res.status(500).json({ 
      error: error.message,
      domain: 'streambackdrops.com',
      timestamp: new Date().toISOString(),
      hint: 'Check Google Sheets API permissions and ensure "PopularCache" sheet exists'
    });
  }
}