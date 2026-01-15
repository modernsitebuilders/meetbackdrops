// create-gumroad-products-no-files.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const products = [
  { id: 'bookshelves-bright-01', name: 'Bright Bookshelf Background #1' },
  { id: 'bookshelves-bright-04', name: 'Bright Bookshelf Background #4' },
  { id: 'bookshelves-bright-07', name: 'Bright Bookshelf Background #7' },
  { id: 'bookshelves-bright-10', name: 'Bright Bookshelf Background #10' },
  { id: 'bookshelves-dark-02', name: 'Dark Bookshelf Background #2' },
  { id: 'bookshelves-dark-07', name: 'Dark Bookshelf Background #7' },
  { id: 'bookshelves-dark-09', name: 'Dark Bookshelf Background #9' },
  { id: 'nature-landscapes-11', name: 'Nature Landscape Background #11' },
  { id: 'nature-landscapes-20', name: 'Nature Landscape Background #20' },
  { id: 'nature-landscapes-21', name: 'Nature Landscape Background #21' },
  { id: 'nature-landscapes-30', name: 'Nature Landscape Background #30' },
  { id: 'nature-landscapes-46', name: 'Nature Landscape Background #46' },
  { id: 'office-spaces-02', name: 'Office Space Background #2' },
  { id: 'office-spaces-17', name: 'Office Space Background #17' },
  { id: 'office-spaces-19', name: 'Office Space Background #19' },
  { id: 'office-spaces-24', name: 'Office Space Background #24' },
  { id: 'office-spaces-33', name: 'Office Space Background #33' },
  { id: 'office-spaces-36', name: 'Office Space Background #36' },
  { id: 'office-spaces-43', name: 'Office Space Background #43' },
  { id: 'office-spaces-77', name: 'Office Space Background #77' },
  { id: 'wall-shelves-bright-28', name: 'Bright Wall Shelf Background #28' },
  { id: 'wall-shelves-dark-01', name: 'Dark Wall Shelf Background #1' },
  { id: 'wall-shelves-dark-28', name: 'Dark Wall Shelf Background #28' },
];

const description = `Premium HD virtual background - professionally designed backdrop perfect for Zoom, Teams, and streaming. High-resolution 2912×1632 PNG with enhanced detail and clarity.

Instant digital download. Compatible with all video conferencing platforms.`;

async function createProduct(product) {
  const body = new URLSearchParams({
    name: product.name,
    description: description,
    price: '499'
  });

  try {
    const response = await fetch('https://api.gumroad.com/v2/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GUMROAD_ACCESS_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✓ ${product.name} - https://gumroad.com/l/${data.product.short_url}`);
      return { id: product.id, url: `https://gumroad.com/l/${data.product.short_url}`, editUrl: `https://gumroad.com/products/${data.product.id}/edit` };
    } else {
      console.error(`✗ ${product.name}:`, data.message);
      return null;
    }
  } catch (error) {
    console.error(`✗ ${product.name}:`, error.message);
    return null;
  }
}

async function run() {
  console.log('Creating products (files must be uploaded manually)...\n');
  
  const results = [];
  for (const product of products) {
    const result = await createProduct(product);
    if (result) results.push(result);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  require('fs').writeFileSync('./gumroad-products.json', JSON.stringify(results, null, 2));
  console.log(`\n✅ Created ${results.length} products. Now upload files manually via the edit URLs.`);
}

run();