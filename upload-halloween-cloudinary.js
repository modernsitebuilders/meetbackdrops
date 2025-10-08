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

const sourceDir = path.join(process.env.HOME, 'Desktop/new-batch');
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

async function uploadHalloweenImages() {
  // Load existing URLs
  let urlMap = {};
  if (fs.existsSync(outputFile)) {
    urlMap = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`Loaded ${Object.keys(urlMap).length} existing URLs\n`);
  }
  
  // Get Halloween PNG files
  const files = fs.readdirSync(sourceDir).filter(f => 
    f.startsWith('halloween-background-') && f.endsWith('.png')
  );
  
  console.log(`Found ${files.length} Halloween PNG files to upload...\n`);
  
  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const publicId = file.replace('.png', '');
    
    console.log(`Uploading ${publicId}...`);
    const url = await uploadImage(filePath, publicId);
    
    if (url) {
      urlMap[publicId] = url;
      console.log(`✓ ${publicId} - SUCCESS`);
    } else {
      console.log(`✗ ${publicId} - FAILED`);
    }
  }
  
  // Save updated JSON file
  fs.writeFileSync(outputFile, JSON.stringify(urlMap, null, 2));
  console.log(`\n✅ Upload complete! URLs saved to cloudinary-urls.json`);
  console.log(`Total images in cloudinary-urls.json: ${Object.keys(urlMap).length}`);
}

uploadHalloweenImages();