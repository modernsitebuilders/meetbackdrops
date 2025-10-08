const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.env.HOME, 'Desktop/new-batch');

// Get all PNG files
const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.png'));

console.log(`Found ${files.length} PNG files to rename...\n`);

// Rename each file
files.forEach((file, index) => {
  const newNumber = String(index + 1).padStart(2, '0');
  const newFileName = `halloween-porch-${newNumber}.png`;
  const oldPath = path.join(sourceDir, file);
  const newPath = path.join(sourceDir, newFileName);
  
  fs.renameSync(oldPath, newPath);
  console.log(`✓ ${file} → ${newFileName}`);
});

console.log(`\n✅ Renamed all ${files.length} files!`);