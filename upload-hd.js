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
  // New batch — Mar 2, 2026 (batch 3) — uploaded via upload-hd-s3-batch3.js
  { id: 'bookshelves-bright-19-hd', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-42-hd', category: 'bookshelves-bright' },
  { id: 'bookshelves-dark-25-hd', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-27-hd', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-28-hd', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-37-hd', category: 'bookshelves-dark' },
  { id: 'wall-shelves-bright-20-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-29-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-51-hd', category: 'wall-shelves-bright' },
  { id: 'office-spaces-20-hd', category: 'office-spaces' },
  { id: 'office-spaces-48-hd', category: 'office-spaces' },
  { id: 'office-spaces-50-hd', category: 'office-spaces' },
  { id: 'office-spaces-59-hd', category: 'office-spaces' },
  { id: 'office-spaces-62-hd', category: 'office-spaces' },
  { id: 'office-spaces-63-hd', category: 'office-spaces' },
  { id: 'office-spaces-66-hd', category: 'office-spaces' },
  { id: 'office-spaces-70-hd', category: 'office-spaces' },
  // New batch — Feb 2026 (batch 2)
  { id: 'bookshelves-bright-02-hd', category: 'bookshelves-bright' },
  { id: 'bookshelves-dark-06-hd', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-08-hd', category: 'bookshelves-dark' },
  { id: 'wall-shelves-bright-01-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-02-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-03-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-05-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-10-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-13-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-16-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-bright-17-hd', category: 'wall-shelves-bright' },
  { id: 'wall-shelves-dark-02-hd', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-04-hd', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-06-hd', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-17-hd', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-19-hd', category: 'wall-shelves-dark' },
  { id: 'wall-shelves-dark-29-hd', category: 'wall-shelves-dark' },
  { id: 'coffee-shop-04-hd', category: 'coffee-shops' },
  { id: 'coffee-shop-10-hd', category: 'coffee-shops' },
  { id: 'coffee-shop-12-hd', category: 'coffee-shops' },
  { id: 'coffee-shop-13-hd', category: 'coffee-shops' },
  { id: 'coffee-shop-19-hd', category: 'coffee-shops' },
  { id: 'conference-room-01-hd', category: 'conference-rooms' },
  { id: 'conference-room-02-hd', category: 'conference-rooms' },
  { id: 'conference-room-03-hd', category: 'conference-rooms' },
  { id: 'conference-room-04-hd', category: 'conference-rooms' },
  { id: 'conference-room-05-hd', category: 'conference-rooms' },
  { id: 'conference-room-06-hd', category: 'conference-rooms' },
  { id: 'nature-landscape-10-hd', category: 'nature-landscapes' },
  { id: 'nature-landscape-14-hd', category: 'nature-landscapes' },
  { id: 'nature-landscape-19-hd', category: 'nature-landscapes' },
  { id: 'nature-landscape-22-hd', category: 'nature-landscapes' },
  { id: 'living-room-11-hd', category: 'living-rooms' },
  { id: 'living-room-14-hd', category: 'living-rooms' },
  { id: 'living-room-17-hd', category: 'living-rooms' },
  { id: 'kitchen-04-hd', category: 'kitchens' },
  { id: 'kitchen-05-hd', category: 'kitchens' },
  { id: 'kitchen-06-hd', category: 'kitchens' },
  { id: 'kitchen-14-hd', category: 'kitchens' },
  { id: 'kitchen-15-hd', category: 'kitchens' },
  { id: 'kitchen-16-hd', category: 'kitchens' },
  { id: 'garden-patio-01-hd', category: 'gardens-patios' },
  { id: 'garden-patio-12-hd', category: 'gardens-patios' },
  { id: 'garden-patio-14-hd', category: 'gardens-patios' },
  { id: 'christmas-background-35-hd', category: 'christmas-backgrounds' },
  { id: 'office-spaces-11-hd', category: 'office-spaces' },
  { id: 'office-spaces-18-hd', category: 'office-spaces' },
  { id: 'office-spaces-38-hd', category: 'office-spaces' },
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