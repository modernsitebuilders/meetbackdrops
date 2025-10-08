const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const sourceDir = path.join(process.env.HOME, 'Desktop/new-pngs/coffee-shops');
const outputFile = path.join(__dirname, 'cloudinary-urls.json');

async function uploadImage(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
      format: 'png'
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${publicId}:`, error.message);
    return null;
  }
}

async function uploadFirst3() {
  let urlMap = {};
  if (fs.existsSync(outputFile)) {
    urlMap = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`Loaded ${Object.keys(urlMap).length} existing URLs\n`);
  }
  
  const filesToUpload = ['coffee-shop-01.png', 'coffee-shop-02.png', 'coffee-shop-03.png'];
  
  for (const file of filesToUpload) {
    const filePath = path.join(sourceDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${file} not found, skipping...`);
      continue;
    }
    
    const publicId = file.replace('.png', '');
    console.log(`Uploading ${file} as ${publicId}...`);
    
    const url = await uploadImage(filePath, publicId);
    
    if (url) {
      urlMap[publicId] = url;
      console.log(`✓ ${publicId} uploaded successfully\n`);
    } else {
      console.log(`✗ ${publicId} - FAILED\n`);
    }
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(urlMap, null, 2));
  console.log(`\n✅ Upload complete!`);
  console.log(`Total images in cloudinary-urls.json: ${Object.keys(urlMap).length}`);
}

uploadFirst3();