const fs = require('fs');

const filePath = 'data/blogMetadata.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add bokeh-backgrounds after halloween-backgrounds
content = content.replace(
  `  "halloween-backgrounds": {
    headline: "Best Halloween Virtual Backgrounds for Video Calls 2025",
    description: "Download 25 free Halloween virtual backgrounds for Zoom, Teams, and Google Meet. Spooky seasonal backgrounds with pumpkins, fall decor, and autumn atmosphere for October video calls.",
    image: "/images/halloween-backgrounds/halloween-background-20.webp",
    datePublished: "2025-07-15",
    dateModified: "2025-10-09"
  },`,
  `  "halloween-backgrounds": {
    headline: "Best Halloween Virtual Backgrounds for Video Calls 2025",
    description: "Download 25 free Halloween virtual backgrounds for Zoom, Teams, and Google Meet. Spooky seasonal backgrounds with pumpkins, fall decor, and autumn atmosphere for October video calls.",
    image: "/images/halloween-backgrounds/halloween-background-20.webp",
    datePublished: "2025-07-15",
    dateModified: "2025-10-09"
  },
  "bokeh-backgrounds": {
    headline: "Free Bokeh Virtual Backgrounds for Video Calls 2025",
    description: "Download 66 free bokeh virtual backgrounds for Zoom, Teams, and Google Meet. Elegant soft-focus light effects and artistic blur backgrounds perfect for professional video calls.",
    image: "/images/bokeh-backgrounds/bokeh-1.webp",
    datePublished: "2025-11-06",
    dateModified: "2025-11-06"
  },`
);

fs.writeFileSync(filePath, content);
console.log('✓ Updated data/blogMetadata.js');
