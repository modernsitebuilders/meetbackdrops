const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.env.HOME, 'Desktop/new-batch');
const targetDir = path.join(__dirname, 'public/images/christmas-backgrounds');

// Create the new folder
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('✅ Created christmas-backgrounds folder\n');
}

// Get all WebP files
const webpFiles = fs.readdirSync(sourceDir)
  .filter(file => file.startsWith('christmas-background-') && file.endsWith('.webp'))
  .sort();

console.log(`Moving ${webpFiles.length} WebP files...\n`);

webpFiles.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✓ Moved: ${file}`);
});

console.log(`\n✅ Moved all ${webpFiles.length} images to public/images/christmas-backgrounds/`);
console.log('\nNext: Upload PNGs to Cloudinary!');