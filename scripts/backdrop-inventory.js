// scripts/backdrop-inventory.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load metadata
const metadataPath = path.join(__dirname, '../public/data/image-metadata-complete.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Load categories config
const categoriesPath = path.join(__dirname, '../categories-config.js');
import('file://' + categoriesPath).then(({ CATEGORIES }) => {
  
  console.log('\n🖼️  STREAMBACKDROPS INVENTORY\n');
  
  // Total images
  const totalImages = Object.keys(metadata).length;
  console.log(`📊 TOTAL IMAGES: ${totalImages}\n`);
  
  // Count by category (from actual metadata)
  const categoryCounts = {};
  Object.values(metadata).forEach(img => {
    const cat = img.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  
  console.log('📁 IMAGES BY CATEGORY:\n');
  
  // Sort by count descending
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);
  
  sortedCategories.forEach(([slug, count]) => {
    const config = CATEGORIES[slug];
    const name = config?.name || slug;
    const formatted = count >= 100 ? `${Math.floor(count / 100) * 100}+` : `${count}`;
    const configured = config ? count : '(NOT IN CONFIG)';
    
    console.log(`  ${slug.padEnd(25)} ${count.toString().padEnd(6)} ${formatted.padEnd(8)} ${name}`);
  });
  
  // Check for categories in config not in metadata
  console.log('\n⚠️  CONFIGURED CATEGORIES WITH NO IMAGES:\n');
  let hasMissing = false;
  Object.keys(CATEGORIES).forEach(slug => {
    if (!categoryCounts[slug]) {
      console.log(`  ❌ ${slug.padEnd(25)} ${CATEGORIES[slug].name}`);
      hasMissing = true;
    }
  });
  
  if (!hasMissing) {
    console.log('  ✅ All configured categories have images');
  }
  
  // Keywords stats
  console.log('\n🔑 KEYWORD STATISTICS:\n');
  
  const allKeywords = [];
  Object.values(metadata).forEach(img => {
    if (img.keywords && Array.isArray(img.keywords)) {
      allKeywords.push(...img.keywords);
    }
  });
  
  const uniqueKeywords = [...new Set(allKeywords)];
  console.log(`  Total keywords: ${allKeywords.length}`);
  console.log(`  Unique keywords: ${uniqueKeywords.length}`);
  console.log(`  Avg keywords per image: ${(allKeywords.length / totalImages).toFixed(1)}`);
  
  // Alt text stats
  console.log('\n📝 ALT TEXT:\n');
  const withAlt = Object.values(metadata).filter(img => img.alt && img.alt.length > 10).length;
  console.log(`  Images with descriptive alt text: ${withAlt}/${totalImages} (${Math.round(withAlt/totalImages*100)}%)`);
  
  // Most common keywords
  console.log('\n🔥 TOP 20 KEYWORDS:\n');
  
  const keywordCounts = {};
  allKeywords.forEach(kw => {
    keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
  });
  
  Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([kw, count], i) => {
      console.log(`  ${(i+1).toString().padEnd(3)} ${kw.padEnd(30)} ${count} images`);
    });
  
  console.log('\n📊 SUMMARY:');
  console.log(`  Total images: ${totalImages}`);
  console.log(`  Categories with images: ${Object.keys(categoryCounts).length}`);
  console.log(`  Configured categories: ${Object.keys(CATEGORIES).length}`);
  console.log(`  Completion: ${Math.round(Object.keys(categoryCounts).length / Object.keys(CATEGORIES).length * 100)}%`);
});