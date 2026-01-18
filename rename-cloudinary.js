require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dnhju6mhg',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function findWallShelves() {
  const result = await cloudinary.api.resources({
    type: 'upload',
    max_results: 500
  });

  const wallShelvesImages = result.resources.filter(img => 
    img.public_id.includes('wall-shelves') || 
    img.public_id.includes('well-lit') ||
    img.public_id.includes('ambient')
  );

  console.log(`\nFound ${wallShelvesImages.length} wall-shelves related images:\n`);
  wallShelvesImages.slice(0, 20).forEach(img => {
    console.log(img.public_id);
  });
}

findWallShelves().catch(console.error);