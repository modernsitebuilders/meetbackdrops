const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.env.HOME, 'Desktop/new-batch');
const targetDir = path.join(__dirname, 'public/images/halloween-porches');

// Get all webp files
const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.webp'));

console.log(`Moving ${files.length} WebP files...\n`);

files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✓ Moved: ${file}`);
});

console.log(`\n✅ Moved all ${files.length} images to public/images/halloween-porches/`);