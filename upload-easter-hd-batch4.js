// upload-easter-hd-batch4.js
// Uploads 5 Easter HD PNGs to S3 and 5 standard PNGs to Cloudinary (batch 4)
require('dotenv').config({ path: '.env.local' });
const AWS = require('aws-sdk');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const BUCKET = 'streambackdrops-premium';
const HD_SOURCE = path.join(process.env.HOME, 'Downloads');
const STANDARD_SOURCE = path.join(process.env.HOME, 'Desktop', 'new-pngs', 'easter');
const URLS_FILE = path.join(__dirname, 'cloudinary-urls.json');

const images = [
  'easter-background-02',
  'easter-background-04',
  'easter-background-32',
  'easter-background-35',
  'easter-background-49',
];

async function run() {
  // ── Cloudinary (standard) ──────────────────────────────────────────────────
  console.log('=== Cloudinary standard uploads ===');
  const existing = JSON.parse(fs.readFileSync(URLS_FILE, 'utf8'));
  let cloudSuccess = 0, cloudFail = 0;

  for (const id of images) {
    const localPath = path.join(STANDARD_SOURCE, `${id}.png`);
    if (!fs.existsSync(localPath)) {
      console.log(`✗ ${id}: not found at ${localPath}`);
      cloudFail++;
      continue;
    }
    try {
      const result = await cloudinary.uploader.upload(localPath, { public_id: id, overwrite: true });
      existing[id] = result.secure_url;
      console.log(`✓ ${id}: ${result.secure_url}`);
      cloudSuccess++;
    } catch (err) {
      console.log(`✗ ${id}: ${err.message}`);
      cloudFail++;
    }
  }

  fs.writeFileSync(URLS_FILE, JSON.stringify(existing, null, 2));
  console.log(`Cloudinary: ${cloudSuccess} uploaded, ${cloudFail} failed.\n`);

  // ── S3 (HD) ────────────────────────────────────────────────────────────────
  console.log('=== S3 HD uploads ===');
  let s3Success = 0, s3Fail = 0;

  for (const id of images) {
    const hdId = `${id}-hd`;
    const localPath = path.join(HD_SOURCE, `${hdId}.png`);
    if (!fs.existsSync(localPath)) {
      console.log(`✗ ${hdId}: not found at ${localPath}`);
      s3Fail++;
      continue;
    }
    try {
      const fileContent = fs.readFileSync(localPath);
      await s3.putObject({
        Bucket: BUCKET,
        Key: `${hdId}.png`,
        Body: fileContent,
        ContentType: 'image/png',
      }).promise();
      const size = (fs.statSync(localPath).size / 1024 / 1024).toFixed(1);
      console.log(`✓ ${hdId} (${size} MB)`);
      s3Success++;
    } catch (err) {
      console.log(`✗ ${hdId}: ${err.message}`);
      s3Fail++;
    }
  }

  console.log(`S3: ${s3Success} uploaded, ${s3Fail} failed.`);
}

run();
