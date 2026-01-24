// regenerate-cloudinary-urls.js
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function regenerate() {
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: '',
    max_results: 500
  });

  const urls = {};
  result.resources.forEach(r => {
    urls[r.public_id] = r.secure_url;
  });

  fs.writeFileSync('cloudinary-urls.json', JSON.stringify(urls, null, 2));
  console.log(`✓ Generated ${Object.keys(urls).length} URLs`);
}

regenerate();