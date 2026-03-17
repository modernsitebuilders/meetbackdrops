require('dotenv').config({ path: '.env.local' });
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const sourceDir = path.join(process.env.HOME, 'Desktop/new-pngs/easter');
const outputDir = path.join(__dirname, 'public/images/easter-backgrounds');
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.png')).sort();

(async () => {
  console.log(`Processing ${files.length} Easter images...\n`);

  for (const file of files) {
    const inputPath = path.join(sourceDir, file);
    const webpFilename = file.replace('.png', '.webp');
    const outputPath = path.join(outputDir, webpFilename);
    const publicId = file.replace('.png', '');

    // Convert to WebP
    await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath);
    console.log(`✓ WebP: ${webpFilename}`);

    // Upload PNG to Cloudinary
    try {
      const result = await cloudinary.uploader.upload(inputPath, {
        public_id: publicId,
        resource_type: 'image'
      });
      console.log(`✓ Cloudinary: ${publicId} → ${result.secure_url}`);
    } catch (err) {
      console.error(`✗ Cloudinary: ${file}:`, err.message);
    }

    console.log('');
  }

  console.log('✅ All Easter images processed.');
})();
