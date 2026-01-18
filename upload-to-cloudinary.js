require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const folder = '/Users/davidmiles/Desktop/new-batch/libraries';
const files = fs.readdirSync(folder).filter(f => f.endsWith('.png'));

(async () => {
  for (const file of files) {
    const filePath = path.join(folder, file);
    const publicId = file.replace('.png', '');
    
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        resource_type: 'image'
      });
      console.log(`✓ ${file}: ${result.secure_url}`);
    } catch (error) {
      console.error(`✗ ${file}:`, error.message);
    }
  }
})();