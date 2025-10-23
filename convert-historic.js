const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, 'public', 'images', 'historic-spaces');

async function convert() {
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.png'));
  
  console.log(`Converting ${files.length} PNG files...`);
  
  for (const file of files) {
    const inputPath = path.join(folder, file);
    const outputPath = path.join(folder, file.replace('.png', '.webp'));
    
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✓ ${file} → ${file.replace('.png', '.webp')}`);
  }
  
  console.log('\n✅ Done!');
}

convert();
