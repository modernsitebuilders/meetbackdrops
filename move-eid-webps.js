const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.env.HOME, 'Desktop/new-batch');
const targetDir = path.join(__dirname, 'public/images/eid-backgrounds');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('✅ Created eid-backgrounds folder\n');
}

const webpFiles = fs.readdirSync(sourceDir)
  .filter(file => file.endsWith('.webp'))
  .sort();

console.log(`Moving ${webpFiles.length} WebP files...\n`);

webpFiles.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✓ Moved: ${file}`);
});

console.log(`\n✅ Moved all ${webpFiles.length} images to public/images/eid-backgrounds/`);