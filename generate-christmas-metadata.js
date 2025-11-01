const fs = require('fs');

const metadata = {};

for (let i = 1; i <= 46; i++) {
  const paddedNum = String(i).padStart(2, '0');
  const key = `christmas-backgrounds-${paddedNum}`;
  
  metadata[key] = {
    "filename": `christmas-background-${paddedNum}.webp`,
    "downloadName": `christmas-background-${paddedNum}.png`,
    "category": "christmas-backgrounds",
    "title": `Christmas Background ${i}`,
    "description": "Professional Christmas virtual background for video calls",
    "alt": `christmas background ${i}`,
    "keywords": [
      "virtual background",
      "zoom background",
      "video call",
      "streaming",
      "christmas backgrounds",
      "holiday backgrounds"
    ]
  };
}

console.log(JSON.stringify(metadata, null, 2));
