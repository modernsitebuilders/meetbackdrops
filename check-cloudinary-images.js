require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dnhju6mhg',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const images = [
  { id: 'bookshelves-bright-16-hd', category: 'bookshelves-bright' },
  { id: 'office-spaces-12-hd',      category: 'office-spaces' },
  { id: 'office-spaces-14-hd',      category: 'office-spaces' },
  { id: 'office-spaces-15-hd',      category: 'office-spaces' },
  { id: 'office-spaces-25-hd',      category: 'office-spaces' },
  { id: 'coffee-shop-13-hd',        category: 'coffee-shops' },
  { id: 'office-spaces-11-hd',      category: 'office-spaces' },
  { id: 'office-spaces-18-hd',      category: 'office-spaces' },
  { id: 'office-spaces-38-hd',      category: 'office-spaces' },
];

async function checkImages() {
  const results = { exists: [], notFound: [] };

  for (const img of images) {
    const publicId = `streambackdrops/${img.category}/${img.id}`;
    try {
      await cloudinary.api.resource(publicId);
      results.exists.push(publicId);
    } catch (err) {
      if (err.error && err.error.http_code === 404) {
        results.notFound.push(publicId);
      } else {
        console.error(`ERROR checking ${publicId}:`, err.error || err);
        results.notFound.push(`${publicId} (unexpected error: ${err.error?.message || err.message})`);
      }
    }
  }

  console.log('\n=== EXIST ===');
  results.exists.length
    ? results.exists.forEach(p => console.log('  FOUND:     ', p))
    : console.log('  (none)');

  console.log('\n=== NOT FOUND ===');
  results.notFound.length
    ? results.notFound.forEach(p => console.log('  NOT FOUND: ', p))
    : console.log('  (none)');
}

checkImages();
