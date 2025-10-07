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

const publicDir = path.join(__dirname, 'public', 'images');
const outputFile = path.join(__dirname, 'cloudinary-urls.json');

// Only upload NEW categories
const NEW_CATEGORIES = [
  'coffee-shops',
  'art-galleries',
  'urban-lofts',
  'gardens-patios',
  'historic-spaces',
  'nature-landscapes',
  'libraries'
];

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

async function uploadNewImages() {
  // Load existing URLs
  let urlMap = {};
  if (fs.existsSync(outputFile)) {
    urlMap = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`Loaded ${Object.keys(urlMap).length} existing URLs\n`);
  }
  
  console.log(`Uploading NEW categories only: ${NEW_CATEGORIES.join(', ')}\n`);
  
  for (const category of NEW_CATEGORIES) {
    const categoryPath = path.join(publicDir, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️  Category ${category} not found, skipping...`);
      continue;
    }
    
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.webp'));
    
    console.log(`Uploading ${files.length} images from ${category}...`);
    
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const publicId = file.replace('.webp', '');
      
      const url = await uploadImage(filePath, publicId);
      
      if (url) {
        urlMap[publicId] = url;
        console.log(`✓ ${publicId}`);
      } else {
        console.log(`✗ ${publicId} - FAILED`);
      }
    }
    
    console.log(`Completed ${category}\n`);
  }
  
  // Save updated JSON file
  fs.writeFileSync(outputFile, JSON.stringify(urlMap, null, 2));
  console.log(`\n✅ Upload complete! URLs saved to cloudinary-urls.json`);
  console.log(`Total images in file: ${Object.keys(urlMap).length}`);
}

uploadNewImages();