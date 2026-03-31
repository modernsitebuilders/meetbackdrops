// upload-webps-to-cloudinary.js
// Uploads all WebP thumbnails from public/images/ to Cloudinary under webp/{category}/
// Run: node upload-webps-to-cloudinary.js
// Resume-safe: skips already-uploaded files (overwrite: false)

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BASE_DIR = path.join(__dirname, 'public/images');
const PROGRESS_FILE = path.join(__dirname, '.webp-upload-progress.json');
const CONCURRENCY = 4; // parallel uploads at a time

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return new Set(JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')));
  }
  return new Set();
}

function saveProgress(done) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify([...done]));
}

async function uploadBatch(items, done, counters) {
  await Promise.all(items.map(async ({ filePath, publicId, folder, label }) => {
    try {
      await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder,
        overwrite: false,
        resource_type: 'image',
      });
      done.add(label);
      counters.uploaded++;
      if (counters.uploaded % 25 === 0) {
        saveProgress(done);
        console.log(`  [${counters.uploaded + counters.skipped}/${counters.total}] ${counters.uploaded} uploaded, ${counters.skipped} skipped`);
      }
    } catch (err) {
      // Cloudinary returns error code 0 when overwrite:false and file exists — treat as skip
      if (err.http_code === 0 || (err.message && err.message.includes('already exists'))) {
        done.add(label);
        counters.skipped++;
      } else {
        counters.errors++;
        console.error(`  ✗ ${label}: ${err.message}`);
      }
    }
  }));
}

async function uploadAll() {
  const done = loadProgress();
  const categories = fs.readdirSync(BASE_DIR).filter(f =>
    fs.statSync(path.join(BASE_DIR, f)).isDirectory()
  );

  // Build full list of work items
  const allItems = [];
  for (const category of categories) {
    const categoryDir = path.join(BASE_DIR, category);
    const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.webp'));
    for (const file of files) {
      const label = `${category}/${file}`;
      if (done.has(label)) continue;
      const baseFilename = file.replace('.webp', '');
      allItems.push({
        filePath: path.join(categoryDir, file),
        publicId: baseFilename,
        folder: `webp/${category}`,
        label,
      });
    }
  }

  const counters = {
    uploaded: 0,
    skipped: done.size,
    errors: 0,
    total: allItems.length + done.size,
  };

  console.log(`\n📦 WebP → Cloudinary upload`);
  console.log(`   Total images: ${counters.total}`);
  console.log(`   Already done: ${counters.skipped}`);
  console.log(`   To upload:    ${allItems.length}\n`);

  if (allItems.length === 0) {
    console.log('✅ All images already uploaded!');
    return;
  }

  // Process in batches of CONCURRENCY
  for (let i = 0; i < allItems.length; i += CONCURRENCY) {
    const batch = allItems.slice(i, i + CONCURRENCY);
    await uploadBatch(batch, done, counters);
  }

  saveProgress(done);

  console.log(`\n✅ Done!`);
  console.log(`   Uploaded: ${counters.uploaded}`);
  console.log(`   Skipped:  ${counters.skipped}`);
  console.log(`   Errors:   ${counters.errors}`);

  if (counters.errors > 0) {
    console.log(`\n⚠️  Some files failed. Re-run the script to retry — progress is saved.`);
  } else {
    console.log(`\n🎉 All ${counters.total} WebPs are on Cloudinary under webp/{category}/`);
    console.log(`   You can now delete public/images/ from the repo.`);
  }
}

uploadAll().catch(console.error);
