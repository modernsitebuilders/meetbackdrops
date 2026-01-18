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
  { id: 'bookshelves-bright-01-hd', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-04-hd', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-06-hd', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-07-hd', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-10-hd', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-23-hd', category: 'bookshelves-bright' },
  { id: 'bookshelves-dark-02-hd', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-07-hd', category: 'bookshelves-dark' },
  { id: 'bookshelves-dark-09-hd', category: 'bookshelves-dark' },
  { id: 'wall-shelves-bright-28-hd', category: 'wall-shelves-bright' },
  { id: 'coffee-shop-03-hd', category: 'coffee-shops' },
  { id: 'library-17-hd', category: 'libraries' },
  { id: 'office-spaces-01-hd', category: 'office-spaces' },
  { id: 'office-spaces-02-hd', category: 'office-spaces' },
  { id: 'office-spaces-03-hd', category: 'office-spaces' },
  { id: 'office-spaces-05-hd', category: 'office-spaces' },
  { id: 'office-spaces-06-hd', category: 'office-spaces' },
  { id: 'office-spaces-07-hd', category: 'office-spaces' },
  { id: 'office-spaces-08-hd', category: 'office-spaces' },
  { id: 'office-spaces-17-hd', category: 'office-spaces' },
  { id: 'office-spaces-19-hd', category: 'office-spaces' },
  { id: 'office-spaces-24-hd', category: 'office-spaces' },
  { id: 'office-spaces-33-hd', category: 'office-spaces' },
  { id: 'office-spaces-36-hd', category: 'office-spaces' },
  { id: 'office-spaces-43-hd', category: 'office-spaces' },
  { id: 'office-spaces-77-hd', category: 'office-spaces' },
  { id: 'nature-landscapes-11-hd', category: 'nature-landscapes' },
  { id: 'nature-landscapes-20-hd', category: 'nature-landscapes' },
  { id: 'nature-landscapes-21-hd', category: 'nature-landscapes' },
  { id: 'nature-landscapes-30-hd', category: 'nature-landscapes' },
  { id: 'nature-landscapes-46-hd', category: 'nature-landscapes' },
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