// upload-easter-hd-batch2.js
// Uploads 11 new Easter HD images to S3 bucket: streambackdrops-premium
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
  'easter-background-56-hd',
  'easter-background-57-hd',
  'easter-background-59-hd',
  'easter-background-61-hd',
  'easter-background-66-hd',
  'easter-background-72-hd',
  'easter-background-73-hd',
  'easter-background-74-hd',
  'easter-background-75-hd',
  'easter-background-87-hd',
  'easter-background-88-hd',
];

async function upload() {
  console.log(`Uploading ${images.length} Easter HD images to S3 (${BUCKET})...\n`);
  let success = 0;
  let failed = 0;

  for (const id of images) {
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
