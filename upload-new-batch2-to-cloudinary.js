// upload-new-batch2-to-cloudinary.js
// Uploads new bookshelves-bright (43–75) and office-spaces (105–124) to Cloudinary

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImages() {
  const baseDir = path.join(__dirname, 'public/images');

  const uploads = [
    { category: 'bookshelves-bright', start: 43, end: 75 },
    { category: 'office-spaces', start: 105, end: 124 },
  ];

  let total = 0;

  for (const { category, start, end } of uploads) {
    console.log(`\n📁 ${category} (${start}–${end}):`);

    for (let i = start; i <= end; i++) {
      const pad = i < 10 ? `0${i}` : `${i}`;
      const filename = `${category}-${pad}.webp`;
      const filePath = path.join(baseDir, category, filename);

      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  Skipping ${filename} (not found)`);
        continue;
      }

      try {
        await cloudinary.uploader.upload(filePath, {
          public_id: filename.replace('.webp', ''),
          folder: `streambackdrops/${category}`,
          overwrite: false,
        });
        console.log(`  ✓ ${filename}`);
        total++;
      } catch (error) {
        console.error(`  ✗ ${filename}:`, error.message);
      }
    }
  }

  console.log(`\n✅ ${total} images uploaded to Cloudinary`);
}

uploadImages();
