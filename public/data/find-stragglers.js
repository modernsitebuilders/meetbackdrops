const fs = require('fs');
const path = require('path');

// Read existing metadata
const existingMetadata = JSON.parse(fs.readFileSync('image-metadata.json', 'utf8'));

// Get what's in metadata by category
const metadataByCategory = {};
Object.keys(existingMetadata).forEach(key => {
  const item = existingMetadata[key];
  const category = item.category;
  if (!metadataByCategory[category]) {
    metadataByCategory[category] = [];
  }
  metadataByCategory[category].push(item.filename);
});

console.log('Categories in your metadata:');
console.log('============================\n');

// Check each category
const imagesDir = '../images';
const categories = fs.readdirSync(imagesDir).filter(item => {
  const itemPath = path.join(imagesDir, item);
  return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
});

categories.forEach(category => {
  const categoryPath = path.join(imagesDir, category);
  const filesInFolder = fs.readdirSync(categoryPath)
    .filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
    .sort();
  
  const filesInMetadata = metadataByCategory[category] || [];
  
  const missing = filesInFolder.filter(f => !filesInMetadata.includes(f));
  
  if (filesInMetadata.length > 0) {
    // This category exists in metadata
    console.log(`📁 ${category}`);
    console.log(`   In folder: ${filesInFolder.length} images`);
    console.log(`   In metadata: ${filesInMetadata.length} images`);
    
    if (missing.length > 0) {
      console.log(`   ⚠️  MISSING ${missing.length} images:`);
      missing.forEach(f => console.log(`      - ${f}`));
    } else if (filesInFolder.length === filesInMetadata.length) {
      console.log(`   ✅ All images accounted for`);
    }
    console.log('');
  }
});

console.log('\n============================');
console.log('Categories NOT in metadata at all:');
console.log('============================\n');

categories.forEach(category => {
  const categoryPath = path.join(imagesDir, category);
  const filesInFolder = fs.readdirSync(categoryPath)
    .filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
    .sort();
  
  const filesInMetadata = metadataByCategory[category] || [];
  
  if (filesInMetadata.length === 0) {
    console.log(`📁 ${category} (${filesInFolder.length} images) - ENTIRE CATEGORY MISSING`);
  }
});