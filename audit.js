const cloudinaryUrls = require('./cloudinary-urls.json');

async function testUrls() {
  const testSamples = [
    'wall-shelves-bright-01',
    'wall-shelves-dark-25',
    'bookshelves-bright-01',
    'office-spaces-01'
  ];

  console.log('Testing sample URLs:\n');

  for (const key of testSamples) {
    const url = cloudinaryUrls[key];
    if (!url) {
      console.log(`✗ ${key}: Not in JSON`);
      continue;
    }

    try {
      const response = await fetch(url, { method: 'HEAD' });
      const status = response.ok ? '✓' : '✗';
      console.log(`${status} ${key}: ${response.status}`);
    } catch (err) {
      console.log(`✗ ${key}: Failed to fetch`);
    }
  }
}

testUrls();