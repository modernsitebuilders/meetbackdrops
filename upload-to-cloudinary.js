const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFolder = path.join(process.env.HOME, 'Desktop', 'new-batch');

async function uploadImages() {
  const files = fs.readdirSync(uploadFolder)
    .filter(f => f.endsWith('.png'))
    .sort();
  
  console.log(`\nUploading ${files.length} images to Cloudinary...\n`);
  
  const urls = {};
  
  for (const file of files) {
    const filePath = path.join(uploadFolder, file);
    const publicId = file.replace('.png', '');
    
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: false
      });
      
      urls[publicId] = result.secure_url;
      console.log(`✓ ${file} → ${result.secure_url}`);
    } catch (error) {
      console.error(`✗ Failed to upload ${file}:`, error.message);
    }
  }
  
  console.log('\n✅ Upload complete! Writing URLs to file...');
  
  // Read existing cloudinary-urls.json
  const urlsFile = './cloudinary-urls.json';
  const existingUrls = JSON.parse(fs.readFileSync(urlsFile, 'utf8'));
  
  // Merge new URLs
  const updatedUrls = { ...existingUrls, ...urls };
  
  // Write back
  fs.writeFileSync(urlsFile, JSON.stringify(updatedUrls, null, 2));
  
  console.log(`✓ Updated ${urlsFile} with ${Object.keys(urls).length} new URLs`);
}

uploadImages();
