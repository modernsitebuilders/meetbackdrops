// check-missing-pngs.js
const fs = require('fs');
const path = require('path');
const cloudinaryUrls = require('./cloudinary-urls.json');

const imagesDir = './public/images';
const categories = fs.readdirSync(imagesDir);

let missing = [];

categories.forEach(category => {
  const categoryPath = path.join(imagesDir, category);
  if (!fs.statSync(categoryPath).isDirectory()) return;
  
  const files = fs.readdirSync(categoryPath);
  const webps = files.filter(f => f.endsWith('.webp'));
  
  webps.forEach(webp => {
    const baseName = webp.replace('.webp', '');
    if (!cloudinaryUrls[baseName]) {
      missing.push({ category, file: webp, baseName });
    }
  });
});

console.log(`Found ${missing.length} missing PNGs:\n`);
missing.forEach(m => console.log(`${m.category}/${m.baseName}`));

fs.writeFileSync('missing-pngs.json', JSON.stringify(missing, null, 2));
console.log('\nSaved to missing-pngs.json');