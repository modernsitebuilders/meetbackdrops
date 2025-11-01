const fs = require('fs');
const path = require('path');

// Read both JSON files
const christmasUrls = JSON.parse(fs.readFileSync('christmas-cloudinary-urls.json', 'utf8'));
const mainUrls = JSON.parse(fs.readFileSync('cloudinary-urls.json', 'utf8'));

// Merge them
const mergedUrls = { ...mainUrls, ...christmasUrls };

// Write back to main file
fs.writeFileSync('cloudinary-urls.json', JSON.stringify(mergedUrls, null, 2));

console.log(`✅ Merged ${Object.keys(christmasUrls).length} Christmas URLs into cloudinary-urls.json`);
console.log(`Total URLs: ${Object.keys(mergedUrls).length}`);