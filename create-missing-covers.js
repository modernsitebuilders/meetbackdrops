// create-missing-covers.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const existingCovers = [
  'bookshelves-bright-01', 'bookshelves-bright-04', 'bookshelves-bright-07', 'bookshelves-bright-10',
  'bookshelves-dark-02', 'bookshelves-dark-07', 'bookshelves-dark-09',
  'nature-landscapes-11', 'nature-landscapes-20', 'nature-landscapes-21', 'nature-landscapes-30', 'nature-landscapes-46',
  'office-spaces-02', 'office-spaces-17', 'office-spaces-19', 'office-spaces-24', 'office-spaces-33', 'office-spaces-36', 'office-spaces-43', 'office-spaces-77',
  'wall-shelves-bright-28',
  'wall-shelves-dark-01', 'wall-shelves-dark-28'
];

const needCovers = [
  { id: 'bookshelves-bright-06', category: 'bookshelves-bright' },
  { id: 'bookshelves-bright-23', category: 'bookshelves-bright' },
  { id: 'coffee-shop-03', category: 'coffee-shops' },
  { id: 'coffee-shop-13', category: 'coffee-shops' },
  { id: 'library-17', category: 'libraries' },
  { id: 'office-spaces-01', category: 'office-spaces' },
  { id: 'office-spaces-03', category: 'office-spaces' },
  { id: 'office-spaces-05', category: 'office-spaces' },
  { id: 'office-spaces-06', category: 'office-spaces' },
  { id: 'office-spaces-07', category: 'office-spaces' },
  { id: 'office-spaces-08', category: 'office-spaces' },
  { id: 'office-spaces-10', category: 'office-spaces' },
  { id: 'office-spaces-11', category: 'office-spaces' },
  { id: 'office-spaces-16', category: 'office-spaces' },
  { id: 'office-spaces-18', category: 'office-spaces' },
  { id: 'office-spaces-28', category: 'office-spaces' },
  { id: 'office-spaces-35', category: 'office-spaces' },
  { id: 'office-spaces-38', category: 'office-spaces' },
  { id: 'office-spaces-69', category: 'office-spaces' }
];

async function createCovers() {
  const outputDir = path.join(process.env.HOME, 'Desktop/gumroad-covers');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  console.log(`Creating ${needCovers.length} cover images...\n`);
  
  for (const {id, category} of needCovers) {
    const inputPath = path.join(__dirname, 'public/images', category, `${id}.webp`);
    const outputPath = path.join(outputDir, `${id}-cover.jpg`);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  ${id} - webp not found`);
      continue;
    }
    
    try {
      await sharp(inputPath)
        .jpeg({ quality: 90 })
        .toFile(outputPath);
      console.log(`✓ ${id}`);
    } catch (error) {
      console.error(`✗ ${id}:`, error.message);
    }
  }
  
  console.log(`\n✅ Covers saved to ${outputDir}`);
}

createCovers();