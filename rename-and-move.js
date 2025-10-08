const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.env.HOME, 'Desktop/new-batch/webp');
const targetDir = path.join(__dirname, 'public/images/coffee-shops');

// Get all webp files from source
const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.webp'));

console.log(`Found ${files.length} webp files to rename and move...`);

// Get the current highest number in target directory
const existingFiles = fs.readdirSync(targetDir);
const existingNumbers = existingFiles
  .filter(file => file.startsWith('coffee-shop-') && file.endsWith('.webp'))
  .map(file => {
    const match = file.match(/coffee-shop-(\d+)\.webp/);
    return match ? parseInt(match[1]) : 0;
  });

let startNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 4;

// Rename and move each file
files.forEach((file, index) => {
  const newNumber = String(startNumber + index).padStart(2, '0');
  const newFileName = `coffee-shop-${newNumber}.webp`;
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, newFileName);
  
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✓ Moved and renamed: ${file} → ${newFileName}`);
});

console.log(`\n🎉 Successfully moved all ${files.length} images to public/images/coffee-shops/`);