const fs = require('fs');
const path = require('path');

// Read the image metadata
const metadataPath = path.join(__dirname, 'public', 'data', 'image-metadata-complete.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Count images per category
const categoryCounts = {};
Object.values(metadata).forEach(image => {
  const category = image.category;
  categoryCounts[category] = (categoryCounts[category] || 0) + 1;
});

// Calculate total
const totalImages = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

// Print results
console.log('\n📊 Category Counts:\n');
Object.entries(categoryCounts).sort().forEach(([category, count]) => {
  console.log(`  ${category}: ${count}`);
});
console.log(`\n✅ Total Images: ${totalImages}\n`);

// Generate the updated config file
const configPath = path.join(__dirname, 'lib', 'categories-config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Update each category count
Object.entries(categoryCounts).forEach(([category, count]) => {
  // Match pattern: "category-name": { ... "count": XX, ... }
  const regex = new RegExp(`("${category}":\\s*{[^}]*"count":\\s*)\\d+`, 'g');
  configContent = configContent.replace(regex, `$1${count}`);
});

// Update total images
configContent = configContent.replace(
  /export const TOTAL_IMAGES = \d+;/,
  `export const TOTAL_IMAGES = ${totalImages};`
);

// Write updated config
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✅ Updated lib/categories-config.js with new counts!\n');