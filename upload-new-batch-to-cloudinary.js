// upload-new-batch-to-cloudinary.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImages() {
  const baseDir = path.join(__dirname, 'public/images');
  
  const uploads = [
    { category: 'libraries', start: 33, end: 38 },
    { category: 'wall-shelves-dark', start: 42, end: 61 },
    { category: 'bookshelves-dark', start: 25, end: 46 }
  ];
  
  let total = 0;
  
  for (const {category, start, end} of uploads) {
    console.log(`\n📁 ${category}:`);
    
    for (let i = start; i <= end; i++) {
      const filename = category === 'libraries' ? `library-${i}.webp` : `${category}-${i}.webp`;
      const filePath = path.join(baseDir, category, filename);
      
      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  Skipping ${filename} (not found)`);
        continue;
      }
      
      try {
        await cloudinary.uploader.upload(filePath, {
          public_id: filename.replace('.webp', ''),
          folder: `streambackdrops/${category}`,
          overwrite: false
        });
        console.log(`  ✓ ${filename}`);
        total++;
      } catch (error) {
        console.error(`  ✗ ${filename}:`, error.message);
      }
    }
  }
  
  console.log(`\n✅ ${total} images uploaded to Cloudinary`);
}

uploadImages();