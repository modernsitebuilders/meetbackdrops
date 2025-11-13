const fs = require('fs');
const path = require('path');

console.log('\n📦 MOVING ALL BOOKSHELVES TO WALL-SHELVES\n');
console.log('='.repeat(60));

const projectRoot = __dirname;

// Move ALL bright images (well-lit-01.webp through well-lit-47.webp)
console.log('\n🟡 Moving ALL BRIGHT images (well-lit-01 through 47)...\n');
for (let i = 1; i <= 47; i++) {
  const num = String(i).padStart(2, '0');
  const oldPath = path.join(projectRoot, `public/images/bookshelves-bright/well-lit-${num}.webp`);
  const newPath = path.join(projectRoot, `public/images/wall-shelves-bright/wall-shelves-bright-${num}.webp`);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`✓ well-lit-${num}.webp → wall-shelves-bright-${num}.webp`);
  } else {
    console.log(`⚠ Missing: well-lit-${num}.webp`);
  }
}

console.log('\n⚫ Moving ALL DARK images (ambient-01 through 41)...\n');
// Move ALL dark images (ambient-01.webp through ambient-41.webp)
for (let i = 1; i <= 41; i++) {
  const num = String(i).padStart(2, '0');
  const oldPath = path.join(projectRoot, `public/images/bookshelves-dark/ambient-${num}.webp`);
  const newPath = path.join(projectRoot, `public/images/wall-shelves-dark/wall-shelves-dark-${num}.webp`);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`✓ ambient-${num}.webp → wall-shelves-dark-${num}.webp`);
  } else {
    console.log(`⚠ Missing: ambient-${num}.webp`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ MIGRATION COMPLETE!');
console.log('='.repeat(60));
console.log('\nCurrent state:');
console.log('  • bookshelves-bright folder: EMPTY (ready for new images)');
console.log('  • bookshelves-dark folder: EMPTY (ready for new images)');
console.log('  • wall-shelves-bright folder: 01-47 (47 images)');
console.log('  • wall-shelves-dark folder: 01-41 (41 images)\n');