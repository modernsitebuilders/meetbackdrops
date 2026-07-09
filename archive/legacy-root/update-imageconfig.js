const fs = require('fs');
const path = require('path');

const imageConfigPath = path.join(__dirname, 'imageConfig.js');
let content = fs.readFileSync(imageConfigPath, 'utf8');

console.log('\n📝 UPDATING IMAGECONFIG.JS\n');
console.log('='.repeat(60));

// Replace all bookshelves-bright with wall-shelves-bright
content = content.replace(/bookshelves-bright-(\d+)/g, 'wall-shelves-bright-$1');
console.log('✓ Renamed all bookshelves-bright-XX to wall-shelves-bright-XX');

// Replace all bookshelves-dark with wall-shelves-dark
content = content.replace(/bookshelves-dark-(\d+)/g, 'wall-shelves-dark-$1');
console.log('✓ Renamed all bookshelves-dark-XX to wall-shelves-dark-XX');

// Update category names in the renamed entries
content = content.replace(/"category": "bookshelves-bright"/g, '"category": "wall-shelves-bright"');
content = content.replace(/"category": "bookshelves-dark"/g, '"category": "wall-shelves-dark"');
console.log('✓ Updated category fields for wall-shelves entries');

// Write the updated content
fs.writeFileSync(imageConfigPath, content);

console.log('\n' + '='.repeat(60));
console.log('✅ IMAGECONFIG.JS UPDATED!');
console.log('='.repeat(60));
console.log('\nNext: Add NEW bookshelves metadata entries\n');