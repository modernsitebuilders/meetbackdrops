// STEP 1: CREATE FOLDERS
// Run this first to set up directory structure

const fs = require('fs');
const path = require('path');

console.log('\n🎄 Creating Christmas category folders...\n');

const folders = [
  'public/images/christmas-modern',
  'public/images/christmas-traditional',
  'public/images/christmas-rustic'
];

folders.forEach(folder => {
  const fullPath = path.join(process.cwd(), folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Created: ${folder}`);
  } else {
    console.log(`⚠ Already exists: ${folder}`);
  }
});

console.log('\n✅ Folder structure ready!\n');