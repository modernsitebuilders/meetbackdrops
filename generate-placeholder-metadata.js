// generate-placeholder-metadata.js
const fs = require('fs');
const path = require('path');

const newImages = [
  // Libraries (33-38)
  ...Array.from({length: 6}, (_, i) => ({
    filename: `library-${33 + i}.webp`,
    category: 'libraries',
    alt: `Professional library background with floor-to-ceiling bookshelves for video calls`
  })),
  
  // Wall Shelves Dark (42-61)
  ...Array.from({length: 20}, (_, i) => ({
    filename: `wall-shelves-dark-${42 + i}.webp`,
    category: 'wall-shelves-dark',
    alt: `Dark wall shelf background with ambient lighting for video calls`
  })),
  
  // Bookshelves Dark (25-46)
  ...Array.from({length: 22}, (_, i) => ({
    filename: `bookshelves-dark-${25 + i}.webp`,
    category: 'bookshelves-dark',
    alt: `Dark bookshelf background with warm lighting for video calls`
  }))
];

const metadataPath = path.join(__dirname, 'public/data/image-metadata-complete.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

newImages.forEach(img => {
  metadata[`${img.category}/${img.filename}`] = { alt: img.alt };
});

fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

console.log(`✅ Added ${newImages.length} placeholder metadata entries`);