const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, 'cloudinary-urls.json');

// Load the JSON
let urlMap = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

console.log(`Total entries before: ${Object.keys(urlMap).length}`);

// Remove the non-padded duplicates
const toRemove = ['coffee-shop-1', 'coffee-shop-2', 'coffee-shop-3'];

toRemove.forEach(key => {
  if (urlMap[key]) {
    console.log(`Removing duplicate: ${key}`);
    delete urlMap[key];
  }
});

// Save the cleaned file
fs.writeFileSync(outputFile, JSON.stringify(urlMap, null, 2));

console.log(`\nTotal entries after: ${Object.keys(urlMap).length}`);
console.log('✅ Duplicates removed!');

// Verify coffee shops
const coffeeShops = Object.keys(urlMap).filter(k => k.startsWith('coffee-shop')).sort();
console.log(`\nCoffee shop images remaining: ${coffeeShops.length}`);
console.log('Coffee shop keys:', coffeeShops);