const fs = require('fs');
const path = require('path');

const metadataPath = './public/data/image-metadata-complete.json';
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Mapping: old christmas-background number → new category + number
const redistribution = {
  modern: [4, 5, 10, 11, 13, 14, 15, 16, 18, 20, 24, 25, 28, 32, 33, 34, 43, 44],
  traditional: [1, 7, 8, 9, 19, 21, 26, 29, 35, 41],
  rustic: [2, 3, 12, 17, 22, 23, 27, 30, 31, 36, 37, 38, 39, 40, 42]
};

// Store original data before deleting
const origMeta = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Remove all old christmas-backgrounds entries
Object.keys(metadata).forEach(key => {
  if (key.startsWith('christmas-backgrounds-')) {
    delete metadata[key];
  }
});

// Add redistributed entries
['modern', 'traditional', 'rustic'].forEach(category => {
  const oldNums = redistribution[category];
  oldNums.forEach((oldNum, idx) => {
    const newNum = String(idx + 1).padStart(2, '0');
    const oldKey = `christmas-backgrounds-${String(oldNum).padStart(2, '0')}`;
    const oldData = origMeta[oldKey];
    
    if (oldData) {
      metadata[`christmas-${category}-${newNum}`] = {
        filename: `christmas-${category}-${newNum}.webp`,
        downloadName: `christmas-${category}-${newNum}.png`,
        category: `christmas-${category}`,
        title: `Christmas ${category.charAt(0).toUpperCase() + category.slice(1)} Background ${parseInt(newNum)}`,
        description: oldData.description,
        alt: oldData.alt,
        keywords: [
          "virtual background",
          "zoom background",
          "video call",
          "streaming",
          `christmas ${category}`,
          "holiday backgrounds"
        ]
      };
    }
  });
});

// Add new images
const newImages = {
  modern: { start: 19, end: 54 },
  traditional: { start: 11, end: 35 },
  rustic: { start: 16, end: 38 }
};

Object.entries(newImages).forEach(([category, range]) => {
  for (let i = range.start; i <= range.end; i++) {
    const num = String(i).padStart(2, '0');
    metadata[`christmas-${category}-${num}`] = {
      filename: `christmas-${category}-${num}.webp`,
      downloadName: `christmas-${category}-${num}.png`,
      category: `christmas-${category}`,
      title: `Christmas ${category.charAt(0).toUpperCase() + category.slice(1)} Background ${i}`,
      description: `Professional Christmas ${category} virtual background for video calls`,
      alt: `Christmas ${category} background ${i}`,
      keywords: [
        "virtual background",
        "zoom background",
        "video call",
        "streaming",
        `christmas ${category}`,
        "holiday backgrounds"
      ]
    };
  }
});

fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
console.log('✓ Metadata updated!');
