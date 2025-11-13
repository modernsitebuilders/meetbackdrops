const fs = require('fs');
const path = require('path');

const categoryDataPath = path.join(__dirname, 'data/categoryData.js');
let content = fs.readFileSync(categoryDataPath, 'utf8');

console.log('\n📝 UPDATING CATEGORYDATA.JS\n');
console.log('='.repeat(60));

// Find and update bookshelves-bright section
const brightOld = `  'bookshelves-bright': {
    name: 'Bookshelves - Bright',
    description: 'Bright bookshelf backgrounds for professional video calls',
    seoDescription: 'Download free well-lit bookshelf virtual backgrounds for video calls. Bright, professional backgrounds.',
    images: Array.from({length: CATEGORIES['bookshelves-bright'].count}, (_, i) => ({
      filename: \`well-lit-\${String(i + 1).padStart(2, '0')}.webp\`,
      title: \`Bright Bookshelf Background \${i + 1}\`
    }))
  },`;

const brightNew = `  'bookshelves-bright': {
    name: 'Bookshelves - Bright',
    description: 'Bright bookshelf backgrounds for professional video calls',
    seoDescription: 'Download free well-lit bookshelf virtual backgrounds for video calls. Bright, professional backgrounds.',
    images: Array.from({length: CATEGORIES['bookshelves-bright'].count}, (_, i) => ({
      filename: \`bookshelves-bright-\${String(i + 1).padStart(2, '0')}.webp\`,
      title: \`Bright Bookshelf Background \${i + 1}\`
    }))
  },
  
  'wall-shelves-bright': {
    name: 'Wall Shelves - Bright',
    description: 'Clean, minimalist wall shelf backgrounds with bright lighting',
    seoDescription: 'Download free bright wall shelf virtual backgrounds for video calls. Minimalist floating shelf backgrounds.',
    images: Array.from({length: CATEGORIES['wall-shelves-bright'].count}, (_, i) => ({
      filename: \`wall-shelves-bright-\${String(i + 1).padStart(2, '0')}.webp\`,
      title: \`Bright Wall Shelf Background \${i + 1}\`
    }))
  },`;

content = content.replace(brightOld, brightNew);
console.log('✓ Updated bookshelves-bright to use new filenames');
console.log('✓ Added wall-shelves-bright category');

// Find and update bookshelves-dark section
const darkOld = `  'bookshelves-dark': {
    name: 'Bookshelves - Dark',
    description: 'Warm bookshelf backgrounds with ambient lighting for professional video calls',
    seoDescription: 'Download free ambient bookshelf virtual backgrounds for video calls. Atmospheric, sophisticated backgrounds.',
    images: Array.from({length: CATEGORIES['bookshelves-dark'].count}, (_, i) => ({
      filename: \`ambient-\${String(i + 1).padStart(2, '0')}.webp\`,
      title: \`Dark Bookshelf Background \${i + 1}\`
    }))
  },`;

const darkNew = `  'bookshelves-dark': {
    name: 'Bookshelves - Dark',
    description: 'Warm bookshelf backgrounds with ambient lighting for professional video calls',
    seoDescription: 'Download free ambient bookshelf virtual backgrounds for video calls. Atmospheric, sophisticated backgrounds.',
    images: Array.from({length: CATEGORIES['bookshelves-dark'].count}, (_, i) => ({
      filename: \`bookshelves-dark-\${String(i + 1).padStart(2, '0')}.webp\`,
      title: \`Dark Bookshelf Background \${i + 1}\`
    }))
  },
  
  'wall-shelves-dark': {
    name: 'Wall Shelves - Dark',
    description: 'Sleek wall shelf backgrounds with warm ambient lighting',
    seoDescription: 'Download free dark wall shelf virtual backgrounds for video calls. Warm ambient floating shelf backgrounds.',
    images: Array.from({length: CATEGORIES['wall-shelves-dark'].count}, (_, i) => ({
      filename: \`wall-shelves-dark-\${String(i + 1).padStart(2, '0')}.webp\`,
      title: \`Dark Wall Shelf Background \${i + 1}\`
    }))
  },`;

content = content.replace(darkOld, darkNew);
console.log('✓ Updated bookshelves-dark to use new filenames');
console.log('✓ Added wall-shelves-dark category');

fs.writeFileSync(categoryDataPath, content);

console.log('\n' + '='.repeat(60));
console.log('✅ CATEGORYDATA.JS UPDATED!');
console.log('='.repeat(60));
console.log('\nAll categories now have correct filenames\n');