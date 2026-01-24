// rename-wall-shelves.js
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const cloudinaryUrls = require('./cloudinary-urls.json');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function rename() {
  const wellLit = Object.keys(cloudinaryUrls).filter(k => k.startsWith('well-lit'));
  const ambient = Object.keys(cloudinaryUrls).filter(k => k.startsWith('ambient'));
  
  console.log(`Found ${wellLit.length} well-lit, ${ambient.length} ambient`);
  
  for (const oldId of wellLit) {
    const num = oldId.match(/\d+/)?.[0];
    if (!num) continue;
    const newId = `wall-shelves-bright-${num.padStart(2, '0')}`;
    console.log(`${oldId} → ${newId}`);
    try {
      await cloudinary.uploader.rename(oldId, newId);
      console.log('✓');
    } catch (err) {
      console.error('✗', err.message);
    }
  }
  
  for (const oldId of ambient) {
    const num = oldId.match(/\d+/)?.[0];
    if (!num) continue;
    const newId = `wall-shelves-dark-${num.padStart(2, '0')}`;
    console.log(`${oldId} → ${newId}`);
    try {
      await cloudinary.uploader.rename(oldId, newId);
      console.log('✓');
    } catch (err) {
      console.error('✗', err.message);
    }
  }
}

rename();