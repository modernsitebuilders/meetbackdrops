require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const urls = JSON.parse(fs.readFileSync('./cloudinary-urls.json', 'utf8'));

(async () => {
  for (let i = 47; i <= 127; i++) {
    const num = String(i).padStart(2, '0');
    const file = `./public/images/christmas-backgrounds/christmas-background-${num}.png`;
    
    if (fs.existsSync(file)) {
      console.log(`Uploading ${num}...`);
      const result = await cloudinary.uploader.upload(file, {
        public_id: `christmas-background-${num}`,
        resource_type: 'image'
      });
      urls[`christmas-background-${num}`] = result.secure_url;
    }
  }
  
  fs.writeFileSync('./cloudinary-urls.json', JSON.stringify(urls, null, 2));
  console.log('\n✅ Uploaded 81 images');
})();
