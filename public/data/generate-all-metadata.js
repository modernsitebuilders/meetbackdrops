const fs = require('fs');
const path = require('path');

// Read existing metadata
const existingMetadata = JSON.parse(fs.readFileSync('image-metadata.json', 'utf8'));

// Get all image files from the images directory
const imagesDir = '../images';
const categories = fs.readdirSync(imagesDir).filter(item => {
  const itemPath = path.join(imagesDir, item);
  return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
});

console.log('Found categories:', categories);

const newMetadata = { ...existingMetadata };
let addedCount = 0;

categories.forEach(category => {
  const categoryPath = path.join(imagesDir, category);
  const files = fs.readdirSync(categoryPath)
    .filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
    .sort();
  
  console.log(`\nProcessing ${category}: ${files.length} images`);
  
  files.forEach((file, index) => {
    const fileNameWithoutExt = file.replace(/\.(webp|png|jpg)$/, '');
    const number = String(index + 1).padStart(2, '0');
    const key = `${category}-${number}`;
    
    if (!newMetadata[key]) {
      // Generate basic metadata for missing entries
      newMetadata[key] = {
        filename: file,
        downloadName: fileNameWithoutExt + '.png',
        category: category,
        title: `${category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Background ${index + 1}`,
        description: `Professional ${category.replace(/-/g, ' ')} virtual background for video calls`,
        alt: `${category.replace(/-/g, ' ')} background ${index + 1}`,
        keywords: [
          'virtual background',
          'zoom background',
          'video call',
          'streaming',
          category.replace(/-/g, ' ')
        ]
      };
      addedCount++;
      console.log(`  ✅ Added: ${key}`);
    }
  });
});

// Write updated metadata
fs.writeFileSync('image-metadata-complete.json', JSON.stringify(newMetadata, null, 2));

console.log(`\n🎉 Complete! Added ${addedCount} new metadata entries.`);
console.log(`📁 Saved as: image-metadata-complete.json`);
console.log(`\nTotal entries: ${Object.keys(newMetadata).length}`);