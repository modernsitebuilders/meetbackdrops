const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const basePath = path.join(process.env.HOME, 'Desktop', 'new-batch');

async function convertImages() {
  const files = fs.readdirSync(basePath).filter(f => f.endsWith('.png'));
  
  console.log(`\nConverting ${files.length} images in new-batch...`);
  
  for (const file of files) {
    const inputPath = path.join(basePath, file);
    const outputPath = path.join(basePath, file.replace('.png', '.webp'));
    
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✓ ${file} → ${file.replace('.png', '.webp')}`);
  }
  
  console.log('\n✅ All conversions complete!');
}

convertImages();
