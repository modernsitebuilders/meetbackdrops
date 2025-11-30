const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const categories = ['christmas-modern', 'christmas-traditional', 'christmas-rustic'];

async function convertImages() {
  for (const category of categories) {
    const dir = path.join(__dirname, 'public/images', category);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    
    console.log(`\nConverting ${files.length} files in ${category}...`);
    
    for (const file of files) {
      const input = path.join(dir, file);
      const output = path.join(dir, file.replace('.png', '.webp'));
      
      await sharp(input)
        .webp({ quality: 90 })
        .toFile(output);
      
      console.log(`✓ ${file} → ${file.replace('.png', '.webp')}`);
    }
  }
  
  console.log('\nDone!');
}

convertImages().catch(console.error);
