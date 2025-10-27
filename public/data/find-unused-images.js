const fs = require('fs');
const path = require('path');

// Read existing metadata to see what's on the website
const existingMetadata = JSON.parse(fs.readFileSync('image-metadata.json', 'utf8'));

// Get all images currently in metadata
const imagesInMetadata = new Set();
Object.values(existingMetadata).forEach(item => {
  imagesInMetadata.add(item.filename);
});

console.log(`Images currently on website: ${imagesInMetadata.size}\n`);

// Scan all image folders
const imagesDir = '../images';
const categories = fs.readdirSync(imagesDir).filter(item => {
  const itemPath = path.join(imagesDir, item);
  return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
});

let totalFiles = 0;
let unusedFiles = 0;
const unusedByCategory = {};

categories.forEach(category => {
  const categoryPath = path.join(imagesDir, category);
  const files = fs.readdirSync(categoryPath)
    .filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
    .sort();
  
  totalFiles += files.length;
  
  const unused = files.filter(file => !imagesInMetadata.has(file));
  
  if (unused.length > 0) {
    unusedByCategory[category] = unused;
    unusedFiles += unused.length;
  }
});

console.log(`Total image files saved: ${totalFiles}`);
console.log(`Images NOT on website: ${unusedFiles}\n`);
console.log('=====================================\n');

// Show unused images by category
Object.keys(unusedByCategory).sort().forEach(category => {
  const unused = unusedByCategory[category];
  console.log(`\n📁 ${category.toUpperCase()} (${unused.length} unused images):`);
  unused.forEach(file => {
    console.log(`   - ${file}`);
  });
});

console.log('\n=====================================');
console.log(`\n💡 You have ${unusedFiles} images saved but not on your website.`);
console.log(`These are "extras" you can review before adding to the site.`);