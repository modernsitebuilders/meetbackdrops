const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(process.env.HOME, 'Desktop/new-batch');
const outputDir = path.join(inputDir, 'webp');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Get all image files
const files = fs.readdirSync(inputDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png'].includes(ext);
});

console.log(`Found ${files.length} images to convert...`);

// Convert each file
Promise.all(
  files.map(file => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, path.basename(file, path.extname(file)) + '.webp');
    
    return sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath)
      .then(() => console.log(`✓ Converted: ${file}`));
  })
).then(() => {
  console.log('\n🎉 All images converted successfully!');
}).catch(err => {
  console.error('Error:', err);
});