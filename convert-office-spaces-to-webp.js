const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const batchFolder = path.join(process.env.HOME, 'Desktop/new-batch');

async function convertOfficeSpacesImages() {
  const pngFiles = fs.readdirSync(batchFolder)
    .filter(file => file.startsWith('office-spaces-') && file.endsWith('.png'))
    .sort();
  
  console.log(`\nConverting ${pngFiles.length} Office Spaces PNG images to WebP...\n`);
  
  for (const file of pngFiles) {
    const inputPath = path.join(batchFolder, file);
    const outputPath = path.join(batchFolder, file.replace('.png', '.webp'));
    
    await sharp(inputPath)
      .webp({ quality: 90 })
      .toFile(outputPath);
    
    console.log(`✓ ${file} → ${file.replace('.png', '.webp')}`);
  }
  
  console.log(`\n✅ All ${pngFiles.length} Office Spaces images converted to WebP!`);
}

convertOfficeSpacesImages();