const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertFolder(folderPath) {
  const files = fs.readdirSync(folderPath)
    .filter(f => f.endsWith('.png'));
  
  console.log(`Converting ${files.length} files in ${path.basename(folderPath)}...`);
  
  for (const file of files) {
    const inputPath = path.join(folderPath, file);
    const outputPath = inputPath.replace('.png', '.webp');
    
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✓ ${file}`);
  }
}

async function run() {
  const base = path.join(process.env.HOME, 'Desktop/new-batch');
  
  await convertFolder(path.join(base, 'libraries'));
  await convertFolder(path.join(base, 'wall-shelves-dark'));
  await convertFolder(path.join(base, 'bookshelves-dark'));
  
  console.log('✅ All conversions complete');
}

run();
