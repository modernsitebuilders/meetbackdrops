const https = require('https');
const fs = require('fs');
const path = require('path');

const cloudinaryUrls = require('./cloudinary-urls.json');
const downloadDir = path.join(process.env.HOME, 'Desktop', 'old-office-spaces');

// Create download directory
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

async function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(downloadDir, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Downloading old office-spaces PNGs from Cloudinary...\n');
  
  for (let i = 1; i <= 19; i++) {
    const key = `office-spaces-${String(i).padStart(2, '0')}`;
    const url = cloudinaryUrls[key];
    
    if (url) {
      await downloadFile(url, `${key}.png`);
    }
  }
  
  console.log('\n✅ All downloads complete! Files saved to ~/Desktop/old-office-spaces/');
}

downloadAll();
