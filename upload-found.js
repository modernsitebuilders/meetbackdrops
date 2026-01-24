// upload-found.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const found = require('./found-pngs.json');
const cloudinaryUrls = require('./cloudinary-urls.json');

async function uploadFound() {
  console.log(`Uploading ${found.length} files...\n`);
  
  for (let i = 0; i < found.length; i++) {
    const item = found[i];
    
    try {
      const result = await cloudinary.uploader.upload(item.actualPath, {
        public_id: item.baseName,
        format: 'png',
        overwrite: false
      });
      
      cloudinaryUrls[item.baseName] = result.secure_url;
      console.log(`✓ ${i+1}/${found.length} ${item.baseName}`);
      
    } catch (error) {
      console.error(`✗ ${item.baseName}:`, error.message);
    }
  }
  
  fs.writeFileSync('./cloudinary-urls.json', JSON.stringify(cloudinaryUrls, null, 2));
  console.log('\n✓ Done! Updated cloudinary-urls.json');
}

uploadFound();