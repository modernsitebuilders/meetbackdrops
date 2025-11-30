const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = './public/images/christmas-backgrounds';

(async () => {
  for (let i = 47; i <= 127; i++) {
    const num = String(i).padStart(2, '0');
    const png = path.join(dir, `christmas-background-${num}.png`);
    const webp = path.join(dir, `christmas-background-${num}.webp`);
    
    if (fs.existsSync(png)) {
      await sharp(png).webp({ quality: 85 }).toFile(webp);
      console.log(`✓ ${num}`);
    }
  }
  console.log('\n✅ Done');
})();
