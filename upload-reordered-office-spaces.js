const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const newBatchDir = path.join(process.env.HOME, 'Desktop', 'new-batch');
const oldBatchDir = path.join(process.env.HOME, 'Desktop', 'old-office-spaces');

async function uploadImages() {
  console.log('\nUploading reordered office-spaces PNGs to Cloudinary...\n');
  
  const urls = {};
  
  // Upload 01-25 from new-batch
  for (let i = 1; i <= 25; i++) {
    const num = String(i).padStart(2, '0');
    const filename = `office-spaces-${num}.png`;
    const filePath = path.join(newBatchDir, filename);
    const publicId = `office-spaces-${num}`;
    
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true
      });
      
      urls[publicId] = result.secure_url;
      console.log(`✓ ${filename} → ${result.secure_url}`);
    } catch (error) {
      console.error(`✗ Failed to upload ${filename}:`, error.message);
    }
  }
  
  // Upload 26-44 from old-office-spaces
  for (let i = 26; i <= 44; i++) {
    const num = String(i).padStart(2, '0');
    const filename = `office-spaces-${num}.png`;
    const filePath = path.join(oldBatchDir, filename);
    const publicId = `office-spaces-${num}`;
    
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true
      });
      
      urls[publicId] = result.secure_url;
      console.log(`✓ ${filename} → ${result.secure_url}`);
    } catch (error) {
      console.error(`✗ Failed to upload ${filename}:`, error.message);
    }
  }
  
  console.log('\n✅ Upload complete! Updating cloudinary-urls.json...');
  
  // Read existing cloudinary-urls.json
  const urlsFile = './cloudinary-urls.json';
  const existingUrls = JSON.parse(fs.readFileSync(urlsFile, 'utf8'));
  
  // Update office-spaces URLs
  Object.keys(existingUrls).forEach(key => {
    if (key.startsWith('office-spaces-')) {
      delete existingUrls[key];
    }
  });
  
  const updatedUrls = { ...existingUrls, ...urls };
  
  // Write back
  fs.writeFileSync(urlsFile, JSON.stringify(updatedUrls, null, 2));
  
  console.log(`✓ Updated cloudinary-urls.json with all 44 reordered URLs`);
}

uploadImages();
