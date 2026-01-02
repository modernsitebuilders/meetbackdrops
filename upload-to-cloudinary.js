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
const folders = ['libraries', 'offices', 'wall-shelves- bright', 'bookshelves-bright', 'nature'];

async function uploadImages() {
  const urls = {};
  let totalCount = 0;
  
  console.log('Upload folder:', uploadFolder);
  console.log('Folders to process:', folders);
  
  for (const folder of folders) {
    const folderPath = path.join(uploadFolder, folder);
    console.log('\nChecking folder:', folderPath);
    console.log('Exists?', fs.existsSync(folderPath));
    
    if (!fs.existsSync(folderPath)) {
      console.log(`⚠️  Folder not found: ${folder}`);
      continue;
    }
    
    const files = fs.readdirSync(folderPath)
      .filter(f => f.endsWith('.png'))
      .sort();
    
    console.log(`Found ${files.length} PNG files in ${folder}`);
    
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const publicId = file.replace('.png', '');
      
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          public_id: publicId,
          overwrite: false
        });
        
        urls[publicId] = result.secure_url;
        console.log(`✓ ${file}`);
        totalCount++;
      } catch (error) {
        console.error(`✗ Failed ${file}:`, error.message);
      }
    }
  }
  
  console.log(`\n✅ ${totalCount} images uploaded`);
  
  const urlsFile = './cloudinary-urls.json';
  const existingUrls = JSON.parse(fs.readFileSync(urlsFile, 'utf8'));
  const updatedUrls = { ...existingUrls, ...urls };
  
  fs.writeFileSync(urlsFile, JSON.stringify(updatedUrls, null, 2));
  
  console.log(`✓ Updated ${urlsFile}`);
}

uploadImages();