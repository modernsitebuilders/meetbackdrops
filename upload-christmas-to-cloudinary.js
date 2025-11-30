const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const batchFolder = path.join(process.env.HOME, 'Desktop/new-batch');

async function uploadChristmasImages() {
  const pngFiles = fs.readdirSync(batchFolder)
    .filter(file => file.startsWith('christmas-background-') && file.endsWith('.png'))
    .sort();
  
  console.log(`\nUploading ${pngFiles.length} Christmas PNG images to Cloudinary...\n`);
  
  const results = {};
  
  for (const file of pngFiles) {
    const filePath = path.join(batchFolder, file);
    const publicId = file.replace('.png', '');
    
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        resource_type: 'image'
      });
      
      results[publicId] = result.secure_url;
      console.log(`✓ ${file}`);
    } catch (error) {
      console.error(`✗ Failed to upload ${file}:`, error.message);
    }
  }
  
  // Save URLs to a JSON file
  const outputPath = path.join(__dirname, 'christmas-cloudinary-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Uploaded all ${pngFiles.length} images!`);
  console.log(`📁 URLs saved to: christmas-cloudinary-urls.json`);
}

uploadChristmasImages();