const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFolder = path.join(process.env.HOME, 'Downloads');

async function uploadImages() {
  const urls = {};
  
  console.log('Upload folder:', uploadFolder);
  
  const files = fs.readdirSync(uploadFolder)
    .filter(f => f.endsWith('-hd.png'))
    .sort();
  
  console.log(`Found ${files.length} HD PNG files`);
  
  for (const file of files) {
    const filePath = path.join(uploadFolder, file);
    const publicId = file.replace('.png', '');
    
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder: 'premium',
        overwrite: false
      });
      
      urls[publicId] = result.secure_url;
      console.log(`✓ ${file}`);
    } catch (error) {
      console.error(`✗ Failed ${file}:`, error.message);
    }
  }
  
  console.log(`\n✅ ${files.length} images uploaded`);
  
  const urlsFile = './cloudinary-premium-urls.json';
  fs.writeFileSync(urlsFile, JSON.stringify(urls, null, 2));
  
  console.log(`✓ Created ${urlsFile}`);
}

uploadImages();