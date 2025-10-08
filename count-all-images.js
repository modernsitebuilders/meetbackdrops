const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public/images');

function countImages() {
  console.log('\n📊 IMAGE COUNT BY CATEGORY:\n');
  console.log('='.repeat(50));
  
  let totalImages = 0;
  const categoryCounts = {};
  
  // Get all category folders
  const folders = fs.readdirSync(imagesDir).filter(item => {
    const itemPath = path.join(imagesDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  // Sort folders alphabetically
  folders.sort();
  
  // Count images in each folder
  folders.forEach(folder => {
    const folderPath = path.join(imagesDir, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.webp'));
    const count = files.length;
    
    categoryCounts[folder] = count;
    totalImages += count;
    
    console.log(`${folder.padEnd(30)} ${count.toString().padStart(4)} images`);
  });
  
  console.log('='.repeat(50));
  console.log(`${'TOTAL'.padEnd(30)} ${totalImages.toString().padStart(4)} images`);
  console.log('='.repeat(50));
  
  // Category breakdown
  console.log('\n📈 CATEGORY SUMMARY:\n');
  console.log(`Total Categories: ${folders.length}`);
  console.log(`Total Images: ${totalImages}`);
  console.log(`Average per Category: ${Math.round(totalImages / folders.length)} images`);
  
  // Find largest and smallest categories
  const sortedByCount = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  console.log(`\nLargest Category: ${sortedByCount[0][0]} (${sortedByCount[0][1]} images)`);
  console.log(`Smallest Category: ${sortedByCount[sortedByCount.length - 1][0]} (${sortedByCount[sortedByCount.length - 1][1]} images)`);
  
  // Save to file
  const output = {
    totalImages,
    totalCategories: folders.length,
    categories: categoryCounts,
    generatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'image-count.json'),
    JSON.stringify(output, null, 2)
  );
  
  console.log('\n✅ Count saved to image-count.json\n');
}

countImages();