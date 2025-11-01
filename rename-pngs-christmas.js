const fs = require('fs');
const path = require('path');

const batchFolder = path.join(process.env.HOME, 'Desktop/new-batch');

// Get all PNG files
const pngFiles = fs.readdirSync(batchFolder)
  .filter(file => file.endsWith('.png'))
  .sort();

console.log(`Found ${pngFiles.length} PNG files to rename...\n`);

pngFiles.forEach((file, index) => {
  const oldPath = path.join(batchFolder, file);
  const newNumber = String(index + 1).padStart(2, '0');
  const newFileName = `christmas-background-${newNumber}.png`;
  const newPath = path.join(batchFolder, newFileName);
  
  fs.renameSync(oldPath, newPath);
  console.log(`✓ ${file} → ${newFileName}`);
});

console.log(`\n✅ Renamed all ${pngFiles.length} PNG files!`);