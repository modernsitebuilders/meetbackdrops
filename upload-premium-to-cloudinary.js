const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImages() {
  const urls = {};
  const baseDir = path.join(__dirname, 'public/images');
  
  // Categories with HD images
  const categories = [
    'bookshelves-bright',
    'bookshelves-dark',
    'wall-shelves-bright',
    'wall-shelves-dark',
    'office-spaces',
    'nature-landscapes'
  ];
  
  let totalUploaded = 0;
  
  for (const category of categories) {
    const categoryPath = path.join(baseDir, category);
    const files = fs.readdirSync(categoryPath)
      .filter(f => f.endsWith('-hd.png'));
    
    console.log(`\n📁 ${category}: ${files.length} files`);
    
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const publicId = file.replace('.png', '');
      
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          public_id: publicId,
          folder: `streambackdrops/${category}`,
          overwrite: false,
          resource_type: 'image'
        });
        
        urls[`${category}/${publicId}`] = result.secure_url;
        console.log(`  ✓ ${file}`);
        totalUploaded++;
      } catch (error) {
        console.error(`  ✗ Failed ${file}:`, error.message);
      }
    }
  }
  
  console.log(`\n✅ ${totalUploaded} HD images uploaded to Cloudinary`);
  
  const urlsFile = './cloudinary-premium-urls.json';
  fs.writeFileSync(urlsFile, JSON.stringify(urls, null, 2));
  console.log(`✓ Created ${urlsFile}`);
}

uploadImages();