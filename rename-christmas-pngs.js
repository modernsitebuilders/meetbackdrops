const fs = require('fs');
const path = require('path');

const batchFolder = path.join(process.env.HOME, 'Desktop/new-batch');

const pngFiles = fs.readdirSync(batchFolder)
  .filter(file => file.endsWith('.png'))
  .sort();

console.log(`Found ${pngFiles.length} PNG files to rename...\n`);

let counter = 128; // Start at 128 (you have 127 already)
pngFiles.forEach(file => {
  const oldPath = path.join(batchFolder, file);
  const newFileName = `christmas-background-${String(counter).padStart(2, '0')}.png`;
  const newPath = path.join(batchFolder, newFileName);
  
  fs.renameSync(oldPath, newPath);
  console.log(`✓ ${file} → ${newFileName}`);
  counter++;
});

console.log(`\n✅ Renamed all ${pngFiles.length} PNG files!`);