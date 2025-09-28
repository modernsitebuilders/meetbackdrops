// process-all-images.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceBaseDir = './public/images/downloads';
const webpOutputDir = './public/images';

// Categories and their source folders
const categories = ['living-room', 'kitchen', 'office-spaces', 'well-lit', 'ambient'];

async function processAllImages() {
  let allMetadata = {};
  
  // Process each category
  for (const category of categories) {
    const sourceCategoryDir = path.join(sourceBaseDir, category);
    const targetCategoryDir = path.join(webpOutputDir, category);
    
    // Create category directory for WebPs
    if (!fs.existsSync(targetCategoryDir)) {
      fs.mkdirSync(targetCategoryDir, { recursive: true });
    }
    
    // Get all PNGs in this category
    const files = fs.readdirSync(sourceCategoryDir)
      .filter(f => f.toLowerCase().endsWith('.png'))
      .sort(); // Sort for consistent ordering
    
    console.log(`\nProcessing ${category}: ${files.length} images`);
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const oldFilename = files[i];
      const number = (i + 1).toString().padStart(2, '0');
      const newBaseName = `${category}-${number}`;
      
      const sourcePath = path.join(sourceCategoryDir, oldFilename);
      const newPngName = `${newBaseName}.png`;
      const newWebpName = `${newBaseName}.webp`;
      
      // Rename PNG in downloads folder
      const newPngPath = path.join(sourceCategoryDir, newPngName);
      fs.renameSync(sourcePath, newPngPath);
      
      // Create WebP for display
      await sharp(newPngPath)
        .webp({ quality: 90, effort: 6 })
        .toFile(path.join(targetCategoryDir, newWebpName));
      
      // Generate metadata
      allMetadata[newBaseName] = {
        filename: newWebpName,
        downloadName: newPngName,
        category: category,
        title: generateTitle(category, i + 1),
        description: generateDescription(category, i + 1),
        alt: `${category.replace('-', ' ')} background ${i + 1}`,
        keywords: generateKeywords(category)
      };
      
      console.log(`✓ Processed: ${oldFilename} → ${newBaseName}`);
    }
  }
  
  // Create data directory if it doesn't exist
  const dataDir = './public/data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Save metadata
  fs.writeFileSync(
    path.join(dataDir, 'image-metadata.json'),
    JSON.stringify(allMetadata, null, 2)
  );
  
  console.log('\n✅ Processing complete!');
  console.log(`📊 Total images processed: ${Object.keys(allMetadata).length}`);
  
  // Show summary
  console.log('\n📁 Summary by category:');
  categories.forEach(cat => {
    const count = Object.values(allMetadata).filter(m => m.category === cat).length;
    console.log(`   ${cat}: ${count} images`);
  });
}

// Helper functions for metadata
function generateTitle(category, index) {
  const titles = {
    'living-room': `Living Room Background ${index}`,
    'kitchen': `Kitchen Background ${index}`,
    'office-spaces': `Office Space Background ${index}`,
    'well-lit': `Well-Lit Professional Background ${index}`,
    'ambient': `Ambient Lighting Background ${index}`
  };
  return titles[category] || `${category} ${index}`;
}

function generateDescription(category, index) {
  const descriptions = {
    'living-room': `Cozy living room virtual background perfect for casual video calls`,
    'kitchen': `Modern kitchen background ideal for cooking shows or casual meetings`,
    'office-spaces': `Professional office background for business video conferences`,
    'well-lit': `Bright, well-lit professional setting for important video calls`,
    'ambient': `Soft ambient lighting creates a warm, inviting atmosphere`
  };
  return descriptions[category] || `Virtual background from ${category} collection`;
}

function generateKeywords(category) {
  const baseKeywords = ['virtual background', 'zoom background', 'video call', 'streaming'];
  const categoryKeywords = {
    'living-room': ['home', 'cozy', 'casual', 'living room'],
    'kitchen': ['cooking', 'culinary', 'home', 'kitchen'],
    'office-spaces': ['professional', 'business', 'office', 'workspace'],
    'well-lit': ['bright', 'professional', 'clear', 'well-lit'],
    'ambient': ['mood', 'soft lighting', 'ambient', 'warm']
  };
  return [...baseKeywords, ...(categoryKeywords[category] || [])];
}

// Run it!
processAllImages().catch(console.error);