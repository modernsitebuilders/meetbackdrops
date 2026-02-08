const fs = require('fs');

const file = 'data/categoryData.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add to categoryInfo after libraries
const librariesEntry = `  'libraries': {
    name: 'Libraries',
    description: 'Classic library rooms with floor-to-ceiling books',
    seoDescription: 'Download free library virtual backgrounds for video calls. Perfect for academic presentations and professional settings.',
    images: Array.from({length: CATEGORIES['libraries'].count}, (_, i) => ({
      filename: \`library-\${i + 1}.webp\`,
      title: \`Library Background \${i + 1}\`
    }))
  },`;

const withConference = librariesEntry + `

  'conference-rooms': {
    name: 'Conference Rooms',
    description: 'Professional conference room backgrounds for team meetings and presentations',
    seoDescription: 'Download free conference room virtual backgrounds for video calls. Modern meeting spaces for collaborative calls.',
    images: Array.from({length: CATEGORIES['conference-rooms'].count}, (_, i) => ({
      filename: \`conference-room-\${String(i + 1).padStart(2, '0')}.webp\`,
      title: \`Conference Room Background \${i + 1}\`
    }))
  },`;

content = content.replace(librariesEntry, withConference);

// 2. Add to folderMap
content = content.replace(
  "'libraries': 'libraries',",
  "'libraries': 'libraries',\n  'conference-rooms': 'conference-rooms',"
);

fs.writeFileSync(file, content);
console.log('✓ Added conference-rooms to categoryData.js');
