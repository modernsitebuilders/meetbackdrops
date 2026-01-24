// upload-hd-standards.js
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const files = ['11', '20', '21', '30'];

async function upload() {
  for (const num of files) {
    const path = `/Users/davidmiles/Desktop/new-pngs/nature-landscapes/nature-landscape-${num}.png`;
    console.log(`Uploading nature-landscape-${num}...`);
    
    await cloudinary.uploader.upload(path, {
      public_id: `nature-landscape-${num}`,
      overwrite: true
    });
    console.log('✓');
  }
  
  console.log('\nRegenerating URLs...');
  const result = await cloudinary.api.resources({ type: 'upload', max_results: 500 });
  const urls = {};
  result.resources.forEach(r => { urls[r.public_id] = r.secure_url; });
  fs.writeFileSync('cloudinary-urls.json', JSON.stringify(urls, null, 2));
  console.log('✓ Done');
}

upload();