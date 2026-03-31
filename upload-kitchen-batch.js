// upload-kitchen-batch.js
// Renames, converts to WebP, and uploads kitchen-19 through kitchen-34 to Cloudinary
// Run: node upload-kitchen-batch.js

require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DOWNLOADS = '/Users/davidmiles/Downloads';
const STAGING = path.join(__dirname, 'kitchen-staging');

// New files from today, in order → kitchen-19 through kitchen-34
const SOURCE_FILES = [
  'streambackdrops_Professional_photography_of_lived-in_luxury_k_e90e66a5-be3a-4382-9d6d-4a877f729fec_0.png',
  'streambackdrops_Professional_photography_of_lived-in_luxury_k_e90e66a5-be3a-4382-9d6d-4a877f729fec_2.png',
  'streambackdrops_Professional_photography_of_lived-in_luxury_k_e90e66a5-be3a-4382-9d6d-4a877f729fec_3.png',
  'streambackdrops_Professional_photography_of_lived_in_Scandina_a0349527-4e3a-4278-9100-3610e72e99e2_0.png',
  'streambackdrops_Professional_photography_of_lived_in_Scandina_a0349527-4e3a-4278-9100-3610e72e99e2_1.png',
  'streambackdrops_Professional_photography_of_lived_in_Scandina_a0349527-4e3a-4278-9100-3610e72e99e2_2.png',
  'streambackdrops_Professional_photography_of_lived_in_Scandina_a0349527-4e3a-4278-9100-3610e72e99e2_3.png',
  'streambackdrops_wide_view_of_Professional_photography_of_live_8fd1efe9-7d09-440f-ab6e-d1818eeb41fe_0.png',
  'streambackdrops_wide_view_of_Professional_photography_of_live_8fd1efe9-7d09-440f-ab6e-d1818eeb41fe_1.png',
  'streambackdrops_wide_view_of_Professional_photography_of_live_8fd1efe9-7d09-440f-ab6e-d1818eeb41fe_3.png',
  'streambackdrops_wide_view_of_Professional_photography_of_live_a463e7da-2c43-4881-8809-f9d01baa4153_0.png',
  'streambackdrops_wide_view_of_Professional_photography_of_live_a463e7da-2c43-4881-8809-f9d01baa4153_1.png',
  'streambackdrops_wide_view_of_Professional_photography_of_live_a463e7da-2c43-4881-8809-f9d01baa4153_2.png',
  'streambackdrops_wide_view_of_Professional_photography_of_live_a463e7da-2c43-4881-8809-f9d01baa4153_3.png',
  'streambackdrops_Professional_photography_of_lived-in_cottage__cea711ae-9ff3-4666-a735-3e8883c98f69_2.png',
  'streambackdrops_Professional_photography_of_lived-in_cottage__cea711ae-9ff3-4666-a735-3e8883c98f69_3.png',
];

const START_NUM = 19;

async function run() {
  // Create staging dir
  if (!fs.existsSync(STAGING)) fs.mkdirSync(STAGING);

  // Build items list from already-staged PNGs
  const items = [];
  for (let i = 0; i < SOURCE_FILES.length; i++) {
    const num = String(START_NUM + i).padStart(2, '0');
    const pngName = `kitchen-${num}.png`;
    const webpName = `kitchen-${num}.webp`;
    const pngDest = path.join(STAGING, pngName);
    const webpDest = path.join(STAGING, webpName);
    items.push({ num, pngName, webpName, pngDest, webpDest });
  }

  console.log('\n🖼  Step 2: Convert PNGs → WebP (sharp)\n');
  for (const { pngName, pngDest, webpDest } of items) {
    try {
      await sharp(pngDest).webp({ quality: 85 }).toFile(webpDest);
      console.log(`  ✓ ${pngName} → ${path.basename(webpDest)}`);
    } catch (e) {
      console.error(`  ✗ ${pngName}: ${e.message}`);
    }
  }

  console.log('\n☁️  Step 3: PNGs already uploaded — skipping\n');

  console.log('\n☁️  Step 4: Upload WebPs to Cloudinary (webp/kitchens/)\n');
  for (const { webpName, webpDest } of items) {
    const publicId = webpName.replace('.webp', '');
    try {
      const result = await cloudinary.uploader.upload(webpDest, {
        public_id: publicId,
        folder: 'webp/kitchens',
        overwrite: false,
        resource_type: 'image',
      });
      console.log(`  ✓ ${webpName} → ${result.secure_url}`);
    } catch (e) {
      if (e.http_code === 0 || (e.message && e.message.includes('already exists'))) {
        console.log(`  ↩ ${webpName} (already exists)`);
      } else {
        console.error(`  ✗ ${webpName}: ${e.message}`);
      }
    }
  }

  console.log('\n✅ Done! Run node regenerate-cloudinary-urls.js to update cloudinary-urls.json\n');
}

run().catch(console.error);
