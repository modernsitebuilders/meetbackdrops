const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function updateCache() {
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
    range: 'Analytics!A:I',
  });

  const rows = response.data.values;
  const downloadCounts = {};
  
  for (let i = 1; i < rows.length; i++) {
   const row = rows[i];
const actionType = row[1];
const filename = row[3];  // ✅ Column D - Filename
const category = row[4];  // ✅ Column E - Category
    
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

  const folderMap = {
    'christmas-background': 'christmas-backgrounds',
    'halloween-background': 'halloween-backgrounds',
    'nature-landscape': 'nature-landscapes',
    'living-room': 'living-rooms',
    'office-space': 'office-spaces',
    'bookshelf': 'bookshelves-dark',
    'library': 'libraries',
    'kitchen': 'kitchens',
    'garden': 'gardens-patios',
    'coffee-shop': 'coffee-shops',
    'historic-space': 'historic-spaces',
    'urban-loft': 'urban-lofts',
    'wall-shelves-bright': 'wall-shelves-bright',
    'wall-shelves-dark': 'wall-shelves-dark',
  };

  const topImages = Object.values(downloadCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 25)
    .map(item => {
      const webFilename = item.filename.replace('.png', '.webp');
      const extracted = item.category.replace(/\.webp$/i, '').replace(/\.png$/i, '').replace(/-\d+$/, '');
      const category = folderMap[extracted] || extracted;
      
      return {
        filename: item.filename,
        category: category,
        downloadCount: item.count,
        webPath: `/images/${category}/${webFilename}`
      };
    });

  const cacheData = {
    lastUpdated: new Date().toISOString(),
    images: topImages
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'public/popular-cache.json'),
    JSON.stringify(cacheData, null, 2)
  );

  console.log('Cache updated successfully!');
}

updateCache().catch(console.error);