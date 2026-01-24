// rename-living-rooms.js
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const cloudinaryUrls = require('./cloudinary-urls.json');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function rename() {
  const livingRooms = Object.keys(cloudinaryUrls)
    .filter(k => k.startsWith('living-room-') && k.includes('_'));
  
  console.log(`Found ${livingRooms.length} files to rename`);
  
  for (const oldId of livingRooms) {
    const newId = oldId.replace(/_.*$/, ''); // Remove suffix
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