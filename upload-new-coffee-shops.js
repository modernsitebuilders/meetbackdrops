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

async function uploadNewCoffeeShops() {
  // Load existing URLs
  let urlMap = {};
  if (fs.existsSync(outputFile)) {
    urlMap = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`Loaded ${Object.keys(urlMap).length} existing URLs\n`);
  }
  
  // Get all PNG files from new-batch folder
  const files = fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.png'));
  
  console.log(`Found ${files.length} PNG files to upload...\n`);
  
  let uploadCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(sourceDir, file);
    
    // Create the public_id as coffee-shop-XX (matching your webp filenames)
    const publicId = `coffee-shop-${String(i + 4).padStart(2, '0')}`;
    
    console.log(`Uploading ${file} as ${publicId}...`);
    
    const url = await uploadImage(filePath, publicId);
    
    if (url) {
      urlMap[publicId] = url;
      uploadCount++;
      console.log(`✓ ${publicId} uploaded successfully\n`);
    } else {
      console.log(`✗ ${publicId} - FAILED\n`);
    }
  }
  
  // Save updated JSON file
  fs.writeFileSync(outputFile, JSON.stringify(urlMap, null, 2));
  console.log(`\n✅ Upload complete!`);
  console.log(`Uploaded: ${uploadCount} new images`);
  console.log(`Total images in cloudinary-urls.json: ${Object.keys(urlMap).length}`);
}

uploadNewCoffeeShops();