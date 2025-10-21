const fs = require('fs');

// Read existing metadata
const metadataFile = './public/data/image-metadata.json';
const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));

// Remove all old office-spaces entries
Object.keys(metadata).forEach(key => {
  if (key.startsWith('office-spaces-')) {
    delete metadata[key];
  }
});

// Add all 44 office-spaces entries in correct order
for (let i = 1; i <= 44; i++) {
  const num = String(i).padStart(2, '0');
  const key = `office-spaces-${num}`;
  
  metadata[key] = {
    filename: `office-spaces-${num}.webp`,
    downloadName: `office-spaces-${num}.png`,
    category: "office-spaces",
    title: `Office Space Background ${i}`,
    description: "Professional office background for business video conferences",
    alt: `office spaces background ${i}`,
    keywords: [
      "virtual background",
      "zoom background",
      "video call",
      "streaming",
      "professional",
      "business",
      "office",
      "workspace"
    ]
  };
}

// Write back
fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

console.log('✅ Updated image-metadata.json with all 44 reordered entries');
