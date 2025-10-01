// fix-heading-hierarchy.js
// Convert all H2s to H3s except add one H2 subtitle in hero section

const fs = require('fs');
const path = require('path');

function findAllPageFiles() {
  const files = [];
  
  function scanDirectory(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && 
            !['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name === 'page.js') {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip unreadable directories
    }
  }
  
  scanDirectory('./app');
  return files;
}

function fixHeadingHierarchy(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;
    const changes = [];
    
    // Count existing headings
    const h1Count = (content.match(/<h1[^>]*>/g) || []).length;
    const h2Count = (content.match(/<h2[^>]*>/g) || []).length;
    
    if (h1Count === 0) {
      changes.push('WARNING: No H1 found - this page needs an H1 title');
    }
    if (h1Count > 1) {
      changes.push(`WARNING: ${h1Count} H1s found - should only have 1`);
    }
    
    // Add H2 subtitle in hero section if it doesn't exist
    const hasH2InHero = content.includes('</h1>') && 
                       content.substring(content.indexOf('</h1>'), content.indexOf('</h1>') + 500).includes('<h2');
    
    if (!hasH2InHero && h1Count === 1) {
      // Find the H1 and add an H2 subtitle after it
      const h1Match = content.match(/(<h1[^>]*>.*?<\/h1>)(.*?)(<p[^>]*class="text-xl[^"]*"[^>]*>.*?<\/p>)/s);
      
      if (h1Match) {
        const [fullMatch, h1Part, middlePart, pPart] = h1Match;
        
        // Convert the description paragraph to an H2
        const newH2 = pPart.replace(/<p([^>]*class="text-xl[^"]*"[^>]*)>/, '<h2 class="text-xl text-gray-600 mb-8">');
        const newH2Final = newH2.replace(/<\/p>/, '</h2>');
        
        newContent = newContent.replace(fullMatch, h1Part + middlePart + newH2Final);
        changes.push('Added H2 subtitle in hero section');
      }
    }
    
    // Convert ALL H2s to H3s (except the one we just added in hero)
    let h2Index = 0;
    let inHeroSection = false;
    
    newContent = newContent.replace(/<h2([^>]*?)>(.*?)<\/h2>/g, (match, attributes, content, offset) => {
      h2Index++;
      
      // Check if this H2 is in the hero section (before first section tag or major div)
      const beforeMatch = newContent.substring(0, offset);
      const afterH1 = beforeMatch.lastIndexOf('</h1>');
      const firstSection = newContent.indexOf('<section', afterH1);
      const firstMajorDiv = newContent.indexOf('<div className="mb-12"', afterH1);
      
      const nextMajorElement = Math.min(
        firstSection === -1 ? Infinity : firstSection,
        firstMajorDiv === -1 ? Infinity : firstMajorDiv
      );
      
      // If this H2 is between H1 and first major section, keep it as H2
      if (afterH1 !== -1 && offset < nextMajorElement && h2Index === 1) {
        return match; // Keep as H2 (hero subtitle)
      }
      
      // Convert all other H2s to H3s
      let newAttributes = attributes;
      
      // Update text size classes appropriately
      newAttributes = newAttributes.replace(/text-3xl/g, 'text-2xl');
      newAttributes = newAttributes.replace(/text-2xl/g, 'text-xl');
      
      // If no text size class, add one appropriate for H3
      if (!newAttributes.includes('text-')) {
        newAttributes = ` class="text-2xl font-bold mb-6"` + newAttributes;
      }
      
      changes.push(`Converted H2 to H3: "${content.trim().substring(0, 50)}..."`);
      return `<h3${newAttributes}>${content}</h3>`;
    });
    
    if (changes.length > 0) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      
      // Verify the results
      const finalH1Count = (newContent.match(/<h1[^>]*>/g) || []).length;
      const finalH2Count = (newContent.match(/<h2[^>]*>/g) || []).length;
      const finalH3Count = (newContent.match(/<h3[^>]*>/g) || []).length;
      
      return {
        success: true,
        changes,
        before: { h1: h1Count, h2: h2Count, h3: (content.match(/<h3[^>]*>/g) || []).length },
        after: { h1: finalH1Count, h2: finalH2Count, h3: finalH3Count }
      };
    }
    
    return { success: false, reason: 'No changes needed' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔧 Fixing Heading Hierarchy Across All Pages');
  console.log('Target structure: H1 → H2 (subtitle) → H3s (sections)\n');
  
  const allFiles = findAllPageFiles();
  console.log(`Found ${allFiles.length} page files to process\n`);
  
  let processedCount = 0;
  let modifiedCount = 0;
  const results = [];
  
  for (const filePath of allFiles) {
    const relativePath = path.relative('./app', filePath);
    console.log(`Processing: ${relativePath}`);
    
    const result = fixHeadingHierarchy(filePath);
    
    if (result.success) {
      console.log(`  ✅ FIXED: H1:${result.after.h1} H2:${result.after.h2} H3:${result.after.h3} (was H1:${result.before.h1} H2:${result.before.h2} H3:${result.before.h3})`);
      result.changes.forEach(change => {
        console.log(`    • ${change}`);
      });
      modifiedCount++;
      results.push({ file: relativePath, ...result });
    } else if (result.error) {
      console.log(`  ❌ ERROR: ${result.error}`);
    } else {
      console.log(`  ⏭️  SKIPPED: ${result.reason}`);
    }
    
    processedCount++;
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🎯 HEADING HIERARCHY FIX RESULTS');
  console.log('='.repeat(70));
  console.log(`📁 Files processed: ${processedCount}`);
  console.log(`✅ Files modified: ${modifiedCount}`);
  console.log(`🔄 Total H2→H3 conversions: ${results.reduce((sum, r) => sum + (r.changes?.length || 0), 0)}`);
  
  if (results.length > 0) {
    console.log('\n📊 Final heading structure:');
    results.forEach(result => {
      console.log(`   ${result.file}: H1:${result.after.h1} H2:${result.after.h2} H3:${result.after.h3}`);
    });
    
    // Test build
    console.log('\n🧪 Testing build...');
    try {
      require('child_process').execSync('npm run build', { stdio: 'pipe' });
      console.log('✅ Build successful!\n');
    } catch (error) {
      console.log('❌ Build failed - check syntax\n');
      return;
    }
    
    console.log('🎯 Expected improvements:');
    console.log('• Clean H1 → H2 → H3 hierarchy');
    console.log('• Better SEO structure');
    console.log('• Improved accessibility');
    console.log('• No more "multiple H2" warnings');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Run SEO audit tools to verify improvements');
    console.log('2. Check pages in browser for visual consistency');
    console.log('3. Deploy when satisfied with results');
  } else {
    console.log('\n💡 No files needed heading hierarchy fixes.');
  }
  
  console.log('\n✨ Script completed successfully!');
}

// Run the script
main().catch(console.error);