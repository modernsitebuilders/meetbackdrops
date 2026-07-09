// upload-hd-s3-batch3.js — Mar 2, 2026 batch
// Uploads HD images to S3 bucket: streambackdrops-premium
require('dotenv').config({ path: '.env.local' });
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET = 'streambackdrops-premium';
const HD_FOLDER = path.join(process.env.HOME, 'Desktop', 'hd-images');

const newImages = [
  // Bookshelves Bright
  'bookshelves-bright-19-hd',
  'bookshelves-bright-42-hd',
  // Bookshelves Dark
  'bookshelves-dark-25-hd',
  'bookshelves-dark-27-hd',
  'bookshelves-dark-28-hd',
  'bookshelves-dark-37-hd',
  // Wall Shelves Bright
  'wall-shelves-bright-20-hd',
  'wall-shelves-bright-29-hd',
  'wall-shelves-bright-51-hd',
  // Office Spaces
  'office-spaces-20-hd',
  'office-spaces-48-hd',
  'office-spaces-50-hd',
  'office-spaces-59-hd',
  'office-spaces-62-hd',
  'office-spaces-63-hd',
  'office-spaces-66-hd',
  'office-spaces-70-hd',
];

async function upload() {
  console.log(`Uploading ${newImages.length} HD images to S3 (${BUCKET})...\n`);
  let success = 0;
  let failed = 0;

  for (const id of newImages) {
    const localPath = path.join(HD_FOLDER, `${id}.png`);
    const s3Key = `${id}.png`;

    if (!fs.existsSync(localPath)) {
      console.log(`✗ ${id}: File not found at ${localPath}`);
      failed++;
      continue;
    }

    try {
      const fileContent = fs.readFileSync(localPath);
      await s3.putObject({
        Bucket: BUCKET,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'image/png',
      }).promise();
      const size = (fs.statSync(localPath).size / 1024 / 1024).toFixed(1);
      console.log(`✓ ${id} (${size} MB)`);
      success++;
    } catch (err) {
      console.log(`✗ ${id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} uploaded, ${failed} failed.`);
}

upload();
