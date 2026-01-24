// cloudinary-rename.js
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function renameNatureFiles() {
  // Get all resources with 'nature-landscapes-' in name
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: '',
    max_results: 500
  });

  const toRename = result.resources.filter(r => 
    r.public_id.includes('nature-landscapes-')
  );

  console.log(`Found ${toRename.length} files to rename`);

  for (const file of toRename) {
    const oldId = file.public_id;
    const newId = oldId.replace('nature-landscapes-', 'nature-landscape-');
    
    console.log(`${oldId} → ${newId}`);
    
    try {
      await cloudinary.uploader.rename(oldId, newId);
      console.log('✓');
    } catch (err) {
      console.error('✗', err.message);
    }
  }
}

renameNatureFiles();