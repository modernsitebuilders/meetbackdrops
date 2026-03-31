// add-metadata-placeholders.js
// Appends placeholder metadata entries for new images

const fs = require('fs');
const path = require('path');

const metaPath = path.join(__dirname, 'public/data/image-metadata-complete.json');
const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

const newEntries = [
  // bookshelves-bright 43–75
  ...Array.from({ length: 33 }, (_, i) => {
    const num = 43 + i;
    const pad = num < 10 ? `0${num}` : `${num}`;
    const key = `bookshelves-bright-${pad}`;
    return [key, {
      filename: `${key}.webp`,
      downloadName: `${key}.png`,
      category: 'bookshelves-bright',
      title: `Bookshelves Bright Background ${num}`,
      description: 'Bright bookshelf virtual background for professional video calls',
      alt: 'bright bookshelf room professional background',
      keywords: ['virtual background', 'zoom background', 'video call', 'streaming', 'bookshelf', 'bright'],
      width: 1920,
      height: 1080,
    }];
  }),

  // office-spaces 105–124
  ...Array.from({ length: 20 }, (_, i) => {
    const num = 105 + i;
    const key = `office-spaces-${num}`;
    return [key, {
      filename: `${key}.webp`,
      downloadName: `${key}.png`,
      category: 'office-spaces',
      title: `Office Spaces Background ${num}`,
      description: 'Professional office virtual background for business video conferencing',
      alt: 'professional office space virtual background',
      keywords: ['virtual background', 'zoom background', 'video call', 'streaming', 'office', 'professional'],
      width: 1920,
      height: 1080,
    }];
  }),
];

let added = 0;
for (const [key, value] of newEntries) {
  if (metadata[key]) {
    console.log(`  skipping ${key} (already exists)`);
  } else {
    metadata[key] = value;
    added++;
  }
}

fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
console.log(`✅ Added ${added} placeholder entries to image-metadata-complete.json`);
