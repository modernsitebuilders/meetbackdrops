const fs = require('fs');
const path = require('path');

// Backup function
function backup(filepath) {
  fs.copyFileSync(filepath, `${filepath}.backup`);
  console.log(`✓ Backed up: ${filepath}`);
}

// 1. pages/category/[slug].js - add default image
console.log('\n1. Updating pages/category/[slug].js...');
const slugFile = 'pages/category/[slug].js';
backup(slugFile);
let slugContent = fs.readFileSync(slugFile, 'utf8');
slugContent = slugContent.replace(
  "'coffee-shops': 'coffee-shop-01.webp',",
  "'coffee-shops': 'coffee-shop-01.webp',\n    'conference-rooms': 'conference-room-01.webp',"
);
fs.writeFileSync(slugFile, slugContent);
console.log('✓ Added default image');

// 2. pages/api/categories.js - add category
console.log('\n2. Updating pages/api/categories.js...');
const catApiFile = 'pages/api/categories.js';
backup(catApiFile);
let catApiContent = fs.readFileSync(catApiFile, 'utf8');
catApiContent = catApiContent.replace(
  "'coffee-shops': {",
  "'conference-rooms': {\n    name: 'Conference Rooms',\n    description: 'Professional conference room backgrounds for team meetings',\n    count: 48\n  },\n  'coffee-shops': {"
);
fs.writeFileSync(catApiFile, catApiContent);
console.log('✓ Added category data');

// 3. pages/image-lookup.js - add pattern
console.log('\n3. Updating pages/image-lookup.js...');
const lookupFile = 'pages/image-lookup.js';
backup(lookupFile);
let lookupContent = fs.readFileSync(lookupFile, 'utf8');
lookupContent = lookupContent.replace(
  "else if (cleanFilename.startsWith('coffee-shop-')) cat = 'coffee-shops';",
  "else if (cleanFilename.startsWith('coffee-shop-')) cat = 'coffee-shops';\n      else if (cleanFilename.startsWith('conference-room-')) cat = 'conference-rooms';"
);
fs.writeFileSync(lookupFile, lookupContent);
console.log('✓ Added filename pattern');

// 4. components/Footer.js - add link
console.log('\n4. Updating components/Footer.js...');
const footerFile = 'components/Footer.js';
backup(footerFile);
let footerContent = fs.readFileSync(footerFile, 'utf8');
footerContent = footerContent.replace(
  '<Link href="/category/coffee-shops"',
  '<Link href="/category/conference-rooms" style={{ color: \'#d1d5db\', textDecoration: \'none\', fontSize: \'0.9rem\' }}>\n                Conference Rooms\n              </Link>\n              <Link href="/category/coffee-shops"'
);
fs.writeFileSync(footerFile, footerContent);
console.log('✓ Added footer link');

// 5. components/Layout.js - add prefetch
console.log('\n5. Updating components/Layout.js...');
const layoutFile = 'components/Layout.js';
backup(layoutFile);
let layoutContent = fs.readFileSync(layoutFile, 'utf8');
layoutContent = layoutContent.replace(
  '<link rel="prefetch" href="/category/coffee-shops" />',
  '<link rel="prefetch" href="/category/conference-rooms" />\n            <link rel="prefetch" href="/category/coffee-shops" />'
);
fs.writeFileSync(layoutFile, layoutContent);
console.log('✓ Added prefetch');

// 6. pages/api/track-download.js - add mapping
console.log('\n6. Updating pages/api/track-download.js...');
const trackFile = 'pages/api/track-download.js';
backup(trackFile);
let trackContent = fs.readFileSync(trackFile, 'utf8');
trackContent = trackContent.replace(
  "'coffee-shop': 'coffee-shops',",
  "'conference-room': 'conference-rooms',\n    'coffee-shop': 'coffee-shops',"
);
fs.writeFileSync(trackFile, trackContent);
console.log('✓ Added download tracking');

// 7. pages/api/calculate-scores.js
console.log('\n7. Updating pages/api/calculate-scores.js...');
const scoresFile = 'pages/api/calculate-scores.js';
backup(scoresFile);
let scoresContent = fs.readFileSync(scoresFile, 'utf8');
scoresContent = scoresContent.replace(
  "'coffee-shops': 'Coffee Shops',",
  "'conference-rooms': 'Conference Rooms',\n      'coffee-shops': 'Coffee Shops',"
);
fs.writeFileSync(scoresFile, scoresContent);
console.log('✓ Added to calculate-scores');

// 8. pages/api/recently-added.js
console.log('\n8. Updating pages/api/recently-added.js...');
const recentFile = 'pages/api/recently-added.js';
backup(recentFile);
let recentContent = fs.readFileSync(recentFile, 'utf8');
recentContent = recentContent.replace(
  "else if (filename.startsWith('coffee-shop-')) category = 'coffee-shops';",
  "else if (filename.startsWith('conference-room-')) category = 'conference-rooms';\n        else if (filename.startsWith('coffee-shop-')) category = 'coffee-shops';"
);
fs.writeFileSync(recentFile, recentContent);
console.log('✓ Added to recently-added');

// 9. pages/api/cache-popular.js
console.log('\n9. Updating pages/api/cache-popular.js...');
const cacheFile = 'pages/api/cache-popular.js';
backup(cacheFile);
let cacheContent = fs.readFileSync(cacheFile, 'utf8');
cacheContent = cacheContent.replace(
  "'coffee-shop': 'coffee-shops',",
  "'conference-room': 'conference-rooms',\n          'coffee-shop': 'coffee-shops',"
);
fs.writeFileSync(cacheFile, cacheContent);
console.log('✓ Added to cache-popular');

// 10. pages/api/cron/update-popular.js
console.log('\n10. Updating pages/api/cron/update-popular.js...');
const cronFile = 'pages/api/cron/update-popular.js';
backup(cronFile);
let cronContent = fs.readFileSync(cronFile, 'utf8');
cronContent = cronContent.replace(
  "'coffee-shop': 'coffee-shops',",
  "'conference-room': 'conference-rooms',\n  'coffee-shop': 'coffee-shops',"
);
cronContent = cronContent.replace(
  "return 'coffee-shops';",
  "return 'conference-rooms';\n    } else if (filename.startsWith('coffee-shop-')) {\n      return 'coffee-shops';"
);
fs.writeFileSync(cronFile, cronContent);
console.log('✓ Added to cron/update-popular');

console.log('\n✅ All files updated!');
console.log('\nBackups created with .backup extension');
console.log('Test locally, then delete backups if all works');
