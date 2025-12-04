const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.env.HOME, 'Desktop/new-batch');

async function convertToWebp() {
  const files = fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.png'))
    .sort();
  
  console.log(`\nConverting ${files.length} PNGs to WebP...\n`);
  
  for (const file of files) {
    const inputPath = path.join(sourceDir, file);
    const outputPath = inputPath.replace('.png', '.webp');
    
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✓ ${file} → ${file.replace('.png', '.webp')}`);
  }
  
  console.log(`\n✅ Converted all ${files.length} images!`);
}

convertToWebp();