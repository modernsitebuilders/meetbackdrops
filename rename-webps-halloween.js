const fs = require('fs');
const path = require('path');

const batchFolder = path.join(process.env.HOME, 'Desktop/new-batch');

// Get all WebP files
const webpFiles = fs.readdirSync(batchFolder).filter(file => 
  file.startsWith('halloween-porch-') && file.endsWith('.webp')
);

console.log(`Found ${webpFiles.length} WebP files to rename...\n`);

webpFiles.forEach(file => {
  const oldPath = path.join(batchFolder, file);
  const newFileName = file.replace('halloween-porch-', 'halloween-background-');
  const newPath = path.join(batchFolder, newFileName);
  
  fs.renameSync(oldPath, newPath);
  console.log(`✓ ${file} → ${newFileName}`);
});

console.log(`\n✅ Renamed all ${webpFiles.length} WebP files!`);