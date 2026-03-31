// process-spring-batch.js
// Processes all spring images downloaded today from ~/Downloads:
//   1. Renames them sequentially to spring-background-01.png etc.
//   2. Copies renamed PNGs to ~/Desktop/spring-pngs/ (staging)
//   3. Converts each to WebP → public/images/spring-backgrounds/
//   4. Uploads original PNGs to Cloudinary (download URLs)
//   5. Updates cloudinary-urls.json
//   6. Appends placeholder metadata to public/data/image-metadata-complete.json
//
// After this script, run: node upload-webps-to-cloudinary.js
// to push the WebPs to Cloudinary under webp/spring-backgrounds/

require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DOWNLOADS_DIR = path.join(process.env.HOME, 'Downloads');
const STAGING_DIR = path.join(process.env.HOME, 'Desktop', 'spring-pngs');
const WEBP_OUT_DIR = path.join(__dirname, 'public', 'images', 'spring-backgrounds');
const URLS_FILE = path.join(__dirname, 'cloudinary-urls.json');
const METADATA_FILE = path.join(__dirname, 'public', 'data', 'image-metadata-complete.json');
const CATEGORY = 'spring-backgrounds';
const CONCURRENCY = 4;

// Extract a readable description from the AI-generated filename
function extractDescription(filename) {
  let name = path.basename(filename, '.png');
  // Remove UUID and trailing _N index
  name = name.replace(/_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}_\d+$/, '');
  // Remove streambackdrops_ prefix
  name = name.replace(/^streambackdrops_/, '');
  // Remove common AI prompt prefixes
  name = name.replace(/^[Pp]rofessional_photography_of_/, '');
  name = name.replace(/^[Pp]rofessional_working_/, '');
  name = name.replace(/^rofessional_working_/, '');
  // Replace underscores/dashes with spaces, collapse multiple spaces
  name = name.replace(/[-_]+/g, ' ').trim();
  // Capitalize first letter
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Spring background';
}

// Get today's date as YYYY-MM-DD
function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Filter PNGs from Downloads that were modified today
function getTodaysPngs() {
  const today = getTodayDate();
  return fs.readdirSync(DOWNLOADS_DIR)
    .filter(f => f.endsWith('.png'))
    .filter(f => {
      const stat = fs.statSync(path.join(DOWNLOADS_DIR, f));
      const mtime = stat.mtime;
      const fileDate = `${mtime.getFullYear()}-${String(mtime.getMonth() + 1).padStart(2, '0')}-${String(mtime.getDate()).padStart(2, '0')}`;
      return fileDate === today;
    })
    .sort();
}

async function uploadPngToCloudinary(localPath, publicId) {
  const result = await cloudinary.uploader.upload(localPath, {
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
  });
  return result.secure_url;
}

async function processBatch(items) {
  await Promise.all(items.map(async (item) => {
    try {
      const url = await uploadPngToCloudinary(item.pngPath, item.id);
      item.url = url;
      item.status = 'ok';
    } catch (err) {
      item.status = 'error';
      item.error = err.message;
    }
  }));
}

async function main() {
  console.log('\n🌸 Spring Batch Processor\n');

  // 1. Find today's PNGs
  const sourcePngs = getTodaysPngs();
  if (sourcePngs.length === 0) {
    console.error('❌ No PNGs found in ~/Downloads modified today.');
    process.exit(1);
  }
  console.log(`Found ${sourcePngs.length} PNGs from today in ~/Downloads\n`);

  // 2. Create output directories
  [STAGING_DIR, WEBP_OUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created: ${dir}`);
    }
  });

  // 3. Rename, copy, and convert
  console.log('📋 Renaming & converting to WebP...\n');
  const items = [];

  for (let i = 0; i < sourcePngs.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    const id = `spring-background-${num}`;
    const srcPath = path.join(DOWNLOADS_DIR, sourcePngs[i]);
    const stagedPng = path.join(STAGING_DIR, `${id}.png`);
    const webpPath = path.join(WEBP_OUT_DIR, `${id}.webp`);
    const description = extractDescription(sourcePngs[i]);

    // Copy renamed PNG to staging
    fs.copyFileSync(srcPath, stagedPng);

    // Convert to WebP
    await sharp(srcPath).webp({ quality: 85 }).toFile(webpPath);
    console.log(`  ✓ ${id}  ← ${sourcePngs[i].substring(0, 60)}...`);

    items.push({ id, pngPath: stagedPng, webpPath, description, num: i + 1 });
  }

  console.log(`\n✅ ${items.length} files renamed & converted\n`);

  // 4. Upload PNGs to Cloudinary
  console.log('☁️  Uploading PNGs to Cloudinary (for download URLs)...\n');
  const urlMap = JSON.parse(fs.readFileSync(URLS_FILE, 'utf8'));
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    await processBatch(batch);
    for (const item of batch) {
      if (item.status === 'ok') {
        urlMap[item.id] = item.url;
        uploaded++;
        process.stdout.write(`  ✓ ${item.id}\n`);
      } else {
        errors++;
        process.stdout.write(`  ✗ ${item.id}: ${item.error}\n`);
      }
    }
    // Save progress periodically
    if ((i + CONCURRENCY) % 20 === 0) {
      fs.writeFileSync(URLS_FILE, JSON.stringify(urlMap, null, 2));
    }
  }

  // Save final cloudinary-urls.json
  fs.writeFileSync(URLS_FILE, JSON.stringify(urlMap, null, 2));
  console.log(`\n✅ ${uploaded} uploaded, ${errors} errors → cloudinary-urls.json updated\n`);

  // 5. Add placeholder metadata entries
  console.log('📝 Adding placeholder metadata to image-metadata-complete.json...\n');
  const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));

  // Remove any existing spring-backgrounds entries (re-run safety)
  const filtered = metadata.filter(m => m.category !== CATEGORY);

  const newEntries = items.map(item => ({
    filename: `${item.id}.webp`,
    downloadName: `${item.id}.png`,
    category: CATEGORY,
    title: `Spring Background ${item.num}`,
    description: 'Spring virtual background for video calls with fresh seasonal scenery',
    alt: `${item.description} spring virtual background for Zoom and Teams video calls`,
    keywords: [
      'virtual background',
      'zoom background',
      'video call',
      'streaming',
      'spring backgrounds',
      'spring',
      'seasonal',
      'flowers',
    ],
    width: 1920,
    height: 1080,
  }));

  const updated = [...filtered, ...newEntries];
  fs.writeFileSync(METADATA_FILE, JSON.stringify(updated, null, 2));
  console.log(`✅ ${newEntries.length} metadata entries added\n`);

  // 6. Summary
  console.log('─────────────────────────────────────────');
  console.log('🌸 Spring batch complete!\n');
  console.log(`   PNGs renamed to: ~/Desktop/spring-pngs/`);
  console.log(`   WebPs created:   public/images/spring-backgrounds/`);
  console.log(`   Cloudinary URLs: cloudinary-urls.json`);
  console.log(`   Metadata:        public/data/image-metadata-complete.json`);
  console.log('\nNext step: upload WebPs to Cloudinary:');
  console.log('   node upload-webps-to-cloudinary.js\n');

  if (errors > 0) {
    console.log(`⚠️  ${errors} PNG upload(s) failed — re-run this script to retry`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
