const fs = require('fs');
const path = require('path');

console.log('\n📁 CREATING WALL-SHELVES CATEGORY\n');
console.log('='.repeat(60));

// Create directories
const brightDir = path.join(__dirname, 'public/images/wall-shelves-bright');
const darkDir = path.join(__dirname, 'public/images/wall-shelves-dark');

if (!fs.existsSync(brightDir)) {
  fs.mkdirSync(brightDir, { recursive: true });
  console.log('✓ Created: public/images/wall-shelves-bright/');
} else {
  console.log('⚠ Already exists: public/images/wall-shelves-bright/');
}

if (!fs.existsSync(darkDir)) {
  fs.mkdirSync(darkDir, { recursive: true });
  console.log('✓ Created: public/images/wall-shelves-dark/');
} else {
  console.log('⚠ Already exists: public/images/wall-shelves-dark/');
}

console.log('\n✅ Folders created!');
console.log('\nNext: Add these entries to categories-config.js:');
console.log('='.repeat(60));
console.log(`
  "wall-shelves-bright": {
    "name": "Wall Shelves - Bright",
    "description": "Clean, minimalist wall shelf backgrounds with bright lighting for modern professional video calls",
    "count": 18
  },
  "wall-shelves-dark": {
    "name": "Wall Shelves - Dark",
    "description": "Sleek wall shelf backgrounds with warm ambient lighting for sophisticated video calls",
    "count": 24
  },
`);
console.log('='.repeat(60));
console.log('\n');