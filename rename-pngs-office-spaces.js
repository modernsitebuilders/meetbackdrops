const fs = require('fs');
const path = require('path');

const batchFolder = path.join(process.env.HOME, 'Desktop/new-batch');

// Get all PNG files
const pngFiles = fs.readdirSync(batchFolder)
  .filter(file => file.endsWith('.png'))
  .sort();

console.log(`Found ${pngFiles.length} PNG files to rename...\n`);

// Start at 45 since you have 44 office-spaces currently
const startNumber = 45;

pngFiles.forEach((file, index) => {
  const oldPath = path.join(batchFolder, file);
  const newNumber = String(startNumber + index).padStart(2, '0');
  const newFileName = `office-spaces-${newNumber}.png`;
  const newPath = path.join(batchFolder, newFileName);
  
  fs.renameSync(oldPath, newPath);
  console.log(`✓ ${file} → ${newFileName}`);
});

console.log(`\n✅ Renamed all ${pngFiles.length} PNG files!`);
console.log(`New files: office-spaces-${String(startNumber).padStart(2, '0')}.png through office-spaces-${String(startNumber + pngFiles.length - 1).padStart(2, '0')}.png`);
