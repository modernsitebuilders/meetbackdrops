const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const newBatchPath = path.join(process.env.HOME, 'Desktop', 'new-batch');
const oldBatchPath = path.join(process.env.HOME, 'Desktop', 'old-office-spaces');
const outputPath = path.join(process.env.HOME, 'Desktop', 'Projects', 'streambackdrops-local', 'public', 'images', 'office-spaces');

async function convertImages() {
  console.log('\nConverting new batch (01-25)...');
  
  // Convert 01-25
  for (let i = 1; i <= 25; i++) {
    const num = String(i).padStart(2, '0');
    const filename = `office-spaces-${num}.png`;
    const inputPath = path.join(newBatchPath, filename);
    const webpPath = path.join(outputPath, `office-spaces-${num}.webp`);
    
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    console.log(`✓ ${filename} → office-spaces-${num}.webp`);
  }
  
  console.log('\nConverting old batch (26-44)...');
  
  // Convert 26-44
  for (let i = 26; i <= 44; i++) {
    const num = String(i).padStart(2, '0');
    const filename = `office-spaces-${num}.png`;
    const inputPath = path.join(oldBatchPath, filename);
    const webpPath = path.join(outputPath, `office-spaces-${num}.webp`);
    
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    console.log(`✓ ${filename} → office-spaces-${num}.webp`);
  }
  
  console.log('\n✅ All 44 images converted and copied to project!');
}

convertImages();
