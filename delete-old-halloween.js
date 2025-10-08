const fs = require('fs');
const path = require('path');

// Delete the old folder
const oldFolder = path.join(__dirname, 'public/images/halloween-porches');

if (fs.existsSync(oldFolder)) {
  fs.rmSync(oldFolder, { recursive: true, force: true });
  console.log('✅ Deleted old halloween-porches folder');
} else {
  console.log('⚠️  halloween-porches folder not found (maybe already deleted)');
}

console.log('\nNow run the rename scripts for your new-batch folder!');