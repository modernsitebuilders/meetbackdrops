const fs = require('fs');
const path = require('path');

const urlsPath = path.join(__dirname, 'cloudinary-urls.json');
const urls = JSON.parse(fs.readFileSync(urlsPath, 'utf8'));

console.log('\n📝 ADDING WALL-SHELVES URL ALIASES\n');
console.log('='.repeat(60));

let added = 0;

// Map wall-shelves-bright to well-lit URLs
for (let i = 1; i <= 47; i++) {
  const num = String(i).padStart(2, '0');
  const oldKey = `well-lit-${num}`;
  const newKey = `wall-shelves-bright-${num}`;
  
  if (urls[oldKey] && !urls[newKey]) {
    urls[newKey] = urls[oldKey];
    console.log(`✓ ${newKey} → ${urls[oldKey]}`);
    added++;
  }
}

// Map wall-shelves-dark to ambient URLs
for (let i = 1; i <= 41; i++) {
  const num = String(i).padStart(2, '0');
  const oldKey = `ambient-${num}`;
  const newKey = `wall-shelves-dark-${num}`;
  
  if (urls[oldKey] && !urls[newKey]) {
    urls[newKey] = urls[oldKey];
    console.log(`✓ ${newKey} → ${urls[oldKey]}`);
    added++;
  }
}

fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 2));

console.log('\n' + '='.repeat(60));
console.log(`✅ ADDED ${added} WALL-SHELVES URL ALIASES!`);
console.log('='.repeat(60));
console.log('\nWall-shelves downloads will now work correctly\n');