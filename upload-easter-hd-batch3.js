// upload-easter-hd-batch3.js
// Uploads 6 new Easter HD images to S3 bucket: streambackdrops-premium
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
const HD_FOLDER = path.join(process.env.HOME, 'Downloads');

const images = [
  'easter-background-91-hd',
  'easter-background-92-hd',
  'easter-background-93-hd',
  'easter-background-99-hd',
  'easter-background-101-hd',
  'easter-background-106-hd',
];

async function upload() {
  console.log(`Uploading ${images.length} Easter HD images to S3 (${BUCKET})...\n`);
  let success = 0;
  let failed = 0;

  for (const id of images) {
    const localPath = path.join(HD_FOLDER, `${id}.png`);
    const s3Key = `${id}.png`;

    if (!fs.existsSync(localPath)) {
      console.log(`✗ ${id}: File not found`);
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
