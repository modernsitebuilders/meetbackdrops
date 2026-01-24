// cloudinary-delete-old.js
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function deleteOldPlurals() {
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: '',
    max_results: 500
  });

  const toDelete = result.resources.filter(r => 
    r.public_id.includes('nature-landscapes-') && !r.public_id.includes('-hd')
  );

  console.log(`Deleting ${toDelete.length} old plural files`);

  for (const file of toDelete) {
    console.log(`Deleting ${file.public_id}`);
    try {
      await cloudinary.uploader.destroy(file.public_id);
      console.log('✓');
    } catch (err) {
      console.error('✗', err.message);
    }
  }
}

deleteOldPlurals();