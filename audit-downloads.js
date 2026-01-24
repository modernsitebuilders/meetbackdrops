// audit-downloads.js
const fs = require('fs');
const path = require('path');
const cloudinaryUrls = require('./cloudinary-urls.json');

const categories = [
  'bookshelves-bright',
  'bookshelves-dark',
  'coffee-shops',
  'libraries',
  'living-rooms',
  'nature-landscapes',
  'office-spaces',
  'wall-shelves-bright',
  'wall-shelves-dark'
];

const missing = [];

categories.forEach(cat => {
  const dir = path.join(__dirname, 'public', 'images', cat);
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp'));
  
  files.forEach(file => {
    const baseFilename = file.replace('.webp', '');
    if (!cloudinaryUrls[baseFilename]) {
      missing.push({ category: cat, file });
    }
  });
});

console.log(`Missing PNGs: ${missing.length}`);
missing.forEach(m => console.log(`${m.category}/${m.file}`));