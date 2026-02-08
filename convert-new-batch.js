const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.env.HOME, 'Desktop', 'new-pngs');

const folderConfig = {
  'coffee-shops': { start: 23, end: 44, pattern: 'coffee-shop-' },
  'gardens-patios': { start: 31, end: 44, pattern: 'garden-patio-' },
  'urban-lofts': { start: 36, end: 45, pattern: 'urban-loft-' },
  'libraries': { start: 39, end: 70, pattern: 'library-' },
  'living-rooms': { start: 48, end: 71, pattern: 'living-room-' },
  'conference-rooms': { start: 1, end: 48, pattern: 'conference-room-', padded: true }
};

async function convertToWebp() {
  let totalCount = 0;
  
  console.log('Starting WebP conversion...\n');
  
  for (const [folder, config] of Object.entries(folderConfig)) {
    const folderPath = path.join(sourceDir, folder);
    
    if (!fs.existsSync(folderPath)) {
      console.log(`⚠️  Folder not found: ${folder}`);
      continue;
    }
    
    console.log(`Processing ${folder}...`);
    
    for (let i = config.start; i <= config.end; i++) {
      const num = config.padded ? String(i).padStart(2, '0') : i;
      const filename = `${config.pattern}${num}`;
      const inputPath = path.join(folderPath, `${filename}.png`);
      const outputPath = path.join(folderPath, `${filename}.webp`);
      
      if (!fs.existsSync(inputPath)) {
        continue;
      }
      
      try {
        await sharp(inputPath)
          .webp({ quality: 85 })
          .toFile(outputPath);
        
        console.log(`  ✓ ${filename}.png → ${filename}.webp`);
        totalCount++;
      } catch (error) {
        console.error(`  ✗ Failed ${filename}:`, error.message);
      }
    }
    
    console.log('');
  }
  
  console.log(`✅ Converted ${totalCount} images!`);
}

convertToWebp();