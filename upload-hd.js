require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dnhju6mhg',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const hdImages = [
  // New batch — Feb 2026
  { id: 'bookshelves-bright-11-hd', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-13-hd', category: 'bookshelves-bright' },
  { id: 'wall-shelves-bright-54-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-dark-34-hd', category: 'wall-shelves-dark' },
  { id: 'office-spaces-71-hd', category: 'office-spaces' },
  { id: 'nature-landscape-98-hd', category: 'nature-landscapes' },
  { id: 'nature-landscape-99-hd', category: 'nature-landscapes' },
  { id: 'living-room-10-hd', category: 'living-rooms' },
];

async function uploadHD() {
  const hdFolder = path.join(process.env.HOME, 'Desktop', 'hd-images');
  console.log(`Uploading ${hdImages.length} HD images...\n`);
  
  for (const img of hdImages) {
    const localPath = path.join(hdFolder, `${img.id}.png`);
    const cloudinaryPath = `streambackdrops/${img.category}/${img.id}`;
    
    if (!fs.existsSync(localPath)) {
      console.log(`✗ ${img.id}: Not found`);
      continue;
    }
    
    try {
      await cloudinary.uploader.upload(localPath, {
        public_id: cloudinaryPath,
        overwrite: true
      });
      console.log(`✓ ${img.id}`);
    } catch (err) {
      console.log(`✗ ${img.id}: ${err.message}`);
    }
  }
  
  console.log('\nDone!');
}

uploadHD();