const fs = require('fs');
const path = require('path');

console.log('\n📦 MIGRATING OLD BOOKSHELVES TO WALL-SHELVES\n');
console.log('='.repeat(60));

const projectRoot = __dirname;

// Move bright images 19-47 to wall-shelves-bright 01-29
console.log('\n🟡 Moving BRIGHT images...\n');
for (let i = 19; i <= 47; i++) {
  const oldNum = String(i).padStart(2, '0');
  const newNum = String(i - 18).padStart(2, '0');
  const oldPath = path.join(projectRoot, `public/images/bookshelves-bright/bookshelves-bright-${oldNum}.webp`);
  const newPath = path.join(projectRoot, `public/images/wall-shelves-bright/wall-shelves-bright-${newNum}.webp`);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`✓ bookshelves-bright-${oldNum}.webp → wall-shelves-bright-${newNum}.webp`);
  } else {
    console.log(`⚠ Missing: bookshelves-bright-${oldNum}.webp`);
  }
}

console.log('\n⚫ Moving DARK images...\n');
// Move dark images 25-41 to wall-shelves-dark 01-17
for (let i = 25; i <= 41; i++) {
  const oldNum = String(i).padStart(2, '0');
  const newNum = String(i - 24).padStart(2, '0');
  const oldPath = path.join(projectRoot, `public/images/bookshelves-dark/bookshelves-dark-${oldNum}.webp`);
  const newPath = path.join(projectRoot, `public/images/wall-shelves-dark/wall-shelves-dark-${newNum}.webp`);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`✓ bookshelves-dark-${oldNum}.webp → wall-shelves-dark-${newNum}.webp`);
  } else {
    console.log(`⚠ Missing: bookshelves-dark-${oldNum}.webp`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ MIGRATION COMPLETE!');
console.log('='.repeat(60));
console.log('\nCurrent state:');
console.log('  • bookshelves-bright: 01-18 (EMPTY - ready for new images)');
console.log('  • bookshelves-dark: 01-24 (EMPTY - ready for new images)');
console.log('  • wall-shelves-bright: 01-29 (migrated)');
console.log('  • wall-shelves-dark: 01-17 (migrated)\n');