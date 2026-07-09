// convert-and-copy-new-batch.js
// Converts new PNGs in ~/Desktop/new-pngs/ to WebP and copies to public/images/

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const HOME = process.env.HOME;
const NEW_PNGS_BASE = path.join(HOME, 'Desktop/new-pngs');
const PROJECT_IMAGES = path.join(__dirname, 'public/images');

const categories = ['bookshelves-bright', 'office-spaces'];

async function run() {
  for (const category of categories) {
    const srcDir = path.join(NEW_PNGS_BASE, category);
    const destDir = path.join(PROJECT_IMAGES, category);

    const files = fs.readdirSync(srcDir)
      .filter(f => f.endsWith('.png'))
      .sort();

    console.log(`\n${category}: converting ${files.length} files...`);

    for (const file of files) {
      const inputPath = path.join(srcDir, file);
      const webpName = file.replace('.png', '.webp');
      const outputPath = path.join(destDir, webpName);

      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);

      console.log(`  ✓ ${webpName}`);
    }
  }

  console.log('\n✅ All conversions complete');
}

run().catch(console.error);
