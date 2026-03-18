// upload-easter-standard-batch2.js
// Uploads 11 new Easter standard PNGs to Cloudinary for the comparison widget,
// then merges their URLs into cloudinary-urls.json
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const SOURCE_DIR = path.join(process.env.HOME, 'Desktop', 'new-pngs', 'easter');
const URLS_FILE = path.join(__dirname, 'cloudinary-urls.json');

const images = [
  'easter-background-56',
  'easter-background-57',
  'easter-background-59',
  'easter-background-61',
  'easter-background-66',
  'easter-background-72',
  'easter-background-73',
  'easter-background-74',
  'easter-background-75',
  'easter-background-87',
  'easter-background-88',
];

async function upload() {
  console.log(`Uploading ${images.length} Easter standard PNGs to Cloudinary...\n`);

  const existing = JSON.parse(fs.readFileSync(URLS_FILE, 'utf8'));
  let uploaded = 0;
  let failed = 0;

  for (const id of images) {
    const localPath = path.join(SOURCE_DIR, `${id}.png`);

    if (!fs.existsSync(localPath)) {
      console.log(`✗ ${id}: File not found at ${localPath}`);
      failed++;
      continue;
    }

    try {
      const result = await cloudinary.uploader.upload(localPath, {
        public_id: id,
        overwrite: true
      });
      existing[id] = result.secure_url;
      console.log(`✓ ${id}: ${result.secure_url}`);
      uploaded++;
    } catch (err) {
      console.log(`✗ ${id}: ${err.message}`);
      failed++;
    }
  }

  fs.writeFileSync(URLS_FILE, JSON.stringify(existing, null, 2));
  console.log(`\nDone! ${uploaded} uploaded, ${failed} failed.`);
  console.log(`cloudinary-urls.json updated.`);
}

upload();
