// find-missing-pngs.js
const fs = require('fs');
const path = require('path');

const missing = [
  // bookshelves-bright 01-09
  ...Array.from({length: 9}, (_, i) => ({cat: 'bookshelves-bright', num: String(i+1).padStart(2, '0')})),
  // nature-landscape 01-09  
  ...Array.from({length: 9}, (_, i) => ({cat: 'nature-landscape', num: String(i+1).padStart(2, '0')})),
  // wall-shelves-bright 01-47
  ...Array.from({length: 47}, (_, i) => ({cat: 'wall-shelves-bright', num: String(i+1).padStart(2, '0')})),
  // wall-shelves-dark 01-41
  ...Array.from({length: 41}, (_, i) => ({cat: 'wall-shelves-dark', num: String(i+1).padStart(2, '0')})),
  // living-room 01-47
  ...Array.from({length: 47}, (_, i) => ({cat: 'living-room', num: String(i+1).padStart(2, '0')}))
];

const searchDirs = [
  '/Users/davidmiles/Desktop/new-pngs/bookshelves-bright',
  '/Users/davidmiles/Desktop/new-pngs/nature-landscapes',
  '/Users/davidmiles/Desktop/new-pngs/nature',
  '/Users/davidmiles/Desktop/new-pngs/wall-shelves-bright',
  '/Users/davidmiles/Desktop/new-pngs/wall-shelves-dark',
  '/Users/davidmiles/Desktop/new-pngs/urban-lofts'
];

const found = [];
const notFound = [];

missing.forEach(m => {
  const filename = `${m.cat}-${m.num}.png`;
  let foundPath = null;
  
  for (const dir of searchDirs) {
    const fullPath = path.join(dir, filename);
    if (fs.existsSync(fullPath)) {
      foundPath = fullPath;
      break;
    }
  }
  
  if (foundPath) {
    found.push({filename, path: foundPath});
  } else {
    notFound.push(filename);
  }
});

console.log(`Found: ${found.length}`);
console.log(`Not found: ${notFound.length}\n`);

if (found.length > 0) {
  fs.writeFileSync('found-for-upload.json', JSON.stringify(found, null, 2));
  console.log('✓ Saved to found-for-upload.json');
}

if (notFound.length > 0) {
  console.log('\nStill missing:', notFound.slice(0, 20).join(', '));
  if (notFound.length > 20) console.log(`...and ${notFound.length - 20} more`);
}