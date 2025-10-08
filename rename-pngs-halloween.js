const fs = require('fs');
const path = require('path');

const batchFolder = path.join(process.env.HOME, 'Desktop/new-batch');

// Get all PNG files
const pngFiles = fs.readdirSync(batchFolder).filter(file => 
  file.startsWith('halloween-porch-') && file.endsWith('.png')
);

console.log(`Found ${pngFiles.length} PNG files to rename...\n`);

pngFiles.forEach(file => {
  const oldPath = path.join(batchFolder, file);
  const newFileName = file.replace('halloween-porch-', 'halloween-background-');
  const newPath = path.join(batchFolder, newFileName);
  
  fs.renameSync(oldPath, newPath);
  console.log(`✓ ${file} → ${newFileName}`);
});

console.log(`\n✅ Renamed all ${pngFiles.length} PNG files!`);