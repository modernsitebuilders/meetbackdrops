const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const basePath = path.join(process.env.HOME, 'Desktop', 'new-pngs');

async function convertFolder(folderName) {
  const folderPath = path.join(basePath, folderName);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`Folder ${folderName} not found, skipping...`);
    return;
  }

  const files = fs.readdirSync(folderPath).filter(f => 
    f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
  );
  
  console.log(`\nConverting ${files.length} images in ${folderName}...`);
  
  for (const file of files) {
    const inputPath = path.join(folderPath, file);
    const outputPath = path.join(folderPath, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
    
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✓ ${file} → ${path.basename(outputPath)}`);
  }
}

async function convertAll() {
  const folders = fs.readdirSync(basePath).filter(f => 
    fs.statSync(path.join(basePath, f)).isDirectory()
  );
  
  console.log(`Found ${folders.length} folders to convert:\n${folders.join(', ')}\n`);
  
  for (const folder of folders) {
    await convertFolder(folder);
  }
  
  console.log('\n✅ All conversions complete!');
}

convertAll();