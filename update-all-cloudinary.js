const fs = require('fs');
const path = require('path');

const projectCloudinary = path.join(__dirname, 'cloudinary-urls.json');
const cloudinaryData = JSON.parse(fs.readFileSync(projectCloudinary, 'utf8'));

console.log('\n🔄 UPDATING CLOUDINARY-URLS.JSON\n');
console.log('='.repeat(60));

const newData = {};

// Process all existing entries
Object.keys(cloudinaryData).forEach(key => {
  let newKey = key;
  
  // Change bookshelves-bright-XX to wall-shelves-bright-XX
  if (key.startsWith('bookshelves-bright-')) {
    newKey = key.replace('bookshelves-bright-', 'wall-shelves-bright-');
    console.log(`✓ Renamed: ${key} → ${newKey}`);
  }
  // Change bookshelves-dark-XX to wall-shelves-dark-XX
  else if (key.startsWith('bookshelves-dark-')) {
    newKey = key.replace('bookshelves-dark-', 'wall-shelves-dark-');
    console.log(`✓ Renamed: ${key} → ${newKey}`);
  }
  
  newData[newKey] = cloudinaryData[key];
});

console.log('\n' + '='.repeat(60));
console.log('✅ CLOUDINARY-URLS.JSON UPDATED!');
console.log('='.repeat(60));
console.log('\nOld bookshelves entries renamed to wall-shelves');
console.log('New bookshelves entries already added from upload\n');

// Write updated file
fs.writeFileSync(projectCloudinary, JSON.stringify(newData, null, 2));