// regenerate-all.js
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getAll() {
  const urls = {};
  let next = null;
  
  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      next_cursor: next
    });
    
    result.resources.forEach(r => {
      urls[r.public_id] = r.secure_url;
    });
    
    console.log(`Fetched ${Object.keys(urls).length} URLs so far...`);
    next = result.next_cursor;
  } while (next);
  
  fs.writeFileSync('cloudinary-urls.json', JSON.stringify(urls, null, 2));
  console.log(`✓ Total: ${Object.keys(urls).length} URLs`);
}

getAll();