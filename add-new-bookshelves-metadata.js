const fs = require('fs');
const path = require('path');

const metadataPath = path.join(__dirname, 'public/data/image-metadata-complete.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

console.log('\n📝 ADDING NEW BOOKSHELVES METADATA\n');
console.log('='.repeat(60));

// Add bright images 01-18
console.log('\n🟡 Adding BRIGHT metadata (01-18)...\n');
for (let i = 1; i <= 18; i++) {
  const num = String(i).padStart(2, '0');
  const key = `bookshelves-bright-${num}`;
  
  metadata[key] = {
    "filename": `bookshelves-bright-${num}.webp`,
    "downloadName": `bookshelves-bright-${num}.png`,
    "category": "bookshelves-bright",
    "title": `Bookshelves Bright Background ${i}`,
    "description": "Professional bright bookshelf virtual background for video calls with excellent lighting and clarity",
    "alt": `bright bookshelf background ${i} professional video call zoom background`,
    "keywords": [
      "virtual background",
      "zoom background",
      "video call",
      "streaming",
      "bookshelves bright",
      "bookshelf background"
    ]
  };
  
  console.log(`✓ Added: ${key}`);
}

// Add dark images 01-24
console.log('\n⚫ Adding DARK metadata (01-24)...\n');
for (let i = 1; i <= 24; i++) {
  const num = String(i).padStart(2, '0');
  const key = `bookshelves-dark-${num}`;
  
  metadata[key] = {
    "filename": `bookshelves-dark-${num}.webp`,
    "downloadName": `bookshelves-dark-${num}.png`,
    "category": "bookshelves-dark",
    "title": `Bookshelves Dark Background ${i}`,
    "description": "Professional warm ambient bookshelf virtual background for video calls with sophisticated lighting",
    "alt": `dark bookshelf background ${i} professional video call zoom background ambient lighting`,
    "keywords": [
      "virtual background",
      "zoom background",
      "video call",
      "streaming",
      "bookshelves dark",
      "bookshelf background",
      "ambient lighting"
    ]
  };
  
  console.log(`✓ Added: ${key}`);
}

// Write updated file
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

console.log('\n' + '='.repeat(60));
console.log('✅ NEW METADATA ADDED!');
console.log('='.repeat(60));
console.log('\n📊 Summary:');
console.log(`  • Added 18 bright bookshelf entries`);
console.log(`  • Added 24 dark bookshelf entries`);
console.log(`  • Total new entries: 42\n`);
console.log('NOTE: These have placeholder descriptions.');
console.log('You can customize them later with specific details!\n');