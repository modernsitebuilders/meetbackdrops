// migrate-hd-s3.js — move 16 HD files on S3 from office-spaces to home-offices
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

const migrations = [
  ['office-spaces-03-hd', 'home-offices-01-hd'],
  ['office-spaces-05-hd', 'home-offices-03-hd'],
  ['office-spaces-06-hd', 'home-offices-04-hd'],
  ['office-spaces-07-hd', 'home-offices-05-hd'],
  ['office-spaces-10-hd', 'home-offices-07-hd'],
  ['office-spaces-11-hd', 'home-offices-08-hd'],
  ['office-spaces-16-hd', 'home-offices-12-hd'],
  ['office-spaces-17-hd', 'home-offices-13-hd'],
  ['office-spaces-18-hd', 'home-offices-14-hd'],
  ['office-spaces-24-hd', 'home-offices-17-hd'],
  ['office-spaces-48-hd', 'home-offices-22-hd'],
  ['office-spaces-50-hd', 'home-offices-23-hd'],
  ['office-spaces-69-hd', 'home-offices-28-hd'],
  ['office-spaces-70-hd', 'home-offices-29-hd'],
  ['office-spaces-71-hd', 'home-offices-30-hd'],
  ['office-spaces-77-hd', 'home-offices-31-hd'],
];

async function migrate() {
  let s3Ok = 0, s3Fail = 0, fileOk = 0;

  console.log('Migrating 16 HD files: office-spaces → home-offices\n');

  for (const [oldId, newId] of migrations) {
    // S3: copy then delete
    try {
      await s3.copyObject({
        Bucket: BUCKET,
        CopySource: `${BUCKET}/${oldId}.png`,
        Key: `${newId}.png`,
      }).promise();
      await s3.deleteObject({ Bucket: BUCKET, Key: `${oldId}.png` }).promise();
      console.log(`✓ S3: ${oldId} → ${newId}`);
      s3Ok++;
    } catch (e) {
      console.log(`✗ S3: ${oldId} — ${e.message}`);
      s3Fail++;
    }

    // hd-images folder: rename local PNG
    const oldPath = path.join(HD_FOLDER, `${oldId}.png`);
    const newPath = path.join(HD_FOLDER, `${newId}.png`);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      fileOk++;
    }
  }

  console.log(`\nS3:    ${s3Ok} moved, ${s3Fail} failed`);
  console.log(`Files: ${fileOk} renamed in ~/Desktop/hd-images/`);
}

migrate();
