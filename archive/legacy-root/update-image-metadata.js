const fs = require('fs');
const path = require('path');

const metadataPath = path.join(__dirname, 'public/data/image-metadata-complete.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

console.log('\n📝 UPDATING IMAGE-METADATA-COMPLETE.JSON\n');
console.log('='.repeat(60));

const newMetadata = {};

// Process all existing entries
Object.keys(metadata).forEach(key => {
  let newKey = key;
  let entry = { ...metadata[key] };
  
  // Rename bookshelves-bright-XX to wall-shelves-bright-XX
  if (key.startsWith('bookshelves-bright-')) {
    newKey = key.replace('bookshelves-bright-', 'wall-shelves-bright-');
    entry.category = 'wall-shelves-bright';
    entry.title = entry.title.replace('Bookshelves Bright', 'Wall Shelves Bright');
    entry.description = entry.description.replace('bookshelves bright', 'wall shelves bright');
    entry.keywords = entry.keywords.map(k => k === 'bookshelves bright' ? 'wall shelves bright' : k);
    console.log(`✓ Renamed: ${key} → ${newKey}`);
  }
  // Rename bookshelves-dark-XX to wall-shelves-dark-XX
  else if (key.startsWith('bookshelves-dark-')) {
    newKey = key.replace('bookshelves-dark-', 'wall-shelves-dark-');
    entry.category = 'wall-shelves-dark';
    entry.title = entry.title.replace('Bookshelves Dark', 'Wall Shelves Dark');
    entry.description = entry.description.replace('bookshelves dark', 'wall shelves dark');
    entry.keywords = entry.keywords.map(k => k === 'bookshelves dark' ? 'wall shelves dark' : k);
    console.log(`✓ Renamed: ${key} → ${newKey}`);
  }
  
  newMetadata[newKey] = entry;
});

// Write updated file
fs.writeFileSync(metadataPath, JSON.stringify(newMetadata, null, 2));

console.log('\n' + '='.repeat(60));
console.log('✅ METADATA UPDATED!');
console.log('='.repeat(60));
console.log('\nAll old bookshelves entries renamed to wall-shelves');
console.log('Next: Add NEW bookshelves metadata\n');