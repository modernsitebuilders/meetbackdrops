const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const batchFolder = path.join(process.env.HOME, 'Desktop/new-batch');

async function convertChristmasImages() {
  const pngFiles = fs.readdirSync(batchFolder)
    .filter(file => file.startsWith('christmas-background-') && file.endsWith('.png'))
    .sort();
  
  console.log(`\nConverting ${pngFiles.length} Christmas PNG images to WebP...\n`);
  
  for (const file of pngFiles) {
    const inputPath = path.join(batchFolder, file);
    const outputPath = path.join(batchFolder, file.replace('.png', '.webp'));
    
    await sharp(inputPath)
      .webp({ quality: 90 })
      .toFile(outputPath);
    
    console.log(`✓ ${file} → ${file.replace('.png', '.webp')}`);
  }
  
  console.log(`\n✅ All ${pngFiles.length} Christmas images converted to WebP!`);
}

convertChristmasImages();