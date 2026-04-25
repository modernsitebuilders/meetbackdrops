// One-shot uploader for HD PNGs into the `streambackdrops-premium` bucket.
//
// Usage:
//   node scripts/upload-hd-to-s3.js <file1.png> <file2.png> ...
//
// Reads AWS creds from .env.local. Each file is uploaded with its basename
// as the S3 Key (matching what hd-preview-url.js / hd-s3-download.js expect).

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const BUCKET = 'streambackdrops-premium';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function exists(key) {
  try {
    await s3.headObject({ Bucket: BUCKET, Key: key }).promise();
    return true;
  } catch (err) {
    if (err.code === 'NotFound' || err.statusCode === 404) return false;
    throw err;
  }
}

async function upload(filePath) {
  const key = path.basename(filePath);
  const body = fs.readFileSync(filePath);
  const already = await exists(key);
  if (already) {
    console.log(`SKIP  ${key} (already in bucket)`);
    return { key, skipped: true };
  }
  await s3.putObject({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: 'image/png',
  }).promise();
  console.log(`OK    ${key} (${(body.length / 1024 / 1024).toFixed(2)} MB)`);
  return { key, skipped: false };
}

(async () => {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('Usage: node scripts/upload-hd-to-s3.js <file.png> ...');
    process.exit(1);
  }
  for (const f of args) {
    try {
      await upload(f);
    } catch (err) {
      console.error(`FAIL  ${f}: ${err.message}`);
      process.exitCode = 1;
    }
  }
})();
