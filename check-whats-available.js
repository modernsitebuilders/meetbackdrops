// check-whats-available.js
const fs = require('fs');
const path = require('path');
const missing = require('./missing-pngs.json');

const newPngsDir = '/Users/davidmiles/Desktop/new-pngs';

let found = [];
let stillMissing = [];

missing.forEach(item => {
  // Try with original name first
  let possiblePath = path.join(newPngsDir, item.category, `${item.baseName}.png`);
  
  // If not found, try singular version for nature-landscapes
  if (!fs.existsSync(possiblePath) && item.category === 'nature-landscapes') {
    const singularName = item.baseName.replace('nature-landscapes', 'nature-landscape');
    possiblePath = path.join(newPngsDir, item.category, `${singularName}.png`);
  }
  
  if (fs.existsSync(possiblePath)) {
    found.push({...item, actualPath: possiblePath});
  } else {
    stillMissing.push(item);
  }
});

console.log(`✓ Found ${found.length} PNGs in new-pngs folder`);
console.log(`✗ Still missing ${stillMissing.length} PNGs\n`);

console.log('STILL MISSING:');
stillMissing.forEach(m => console.log(`  ${m.category}/${m.baseName}`));

fs.writeFileSync('found-pngs.json', JSON.stringify(found, null, 2));
fs.writeFileSync('still-missing-pngs.json', JSON.stringify(stillMissing, null, 2));

console.log('\n✓ Saved found-pngs.json and still-missing-pngs.json');