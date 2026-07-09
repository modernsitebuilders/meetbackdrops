const fs = require('fs');

const filePath = 'pages/blog/[slug].js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import statement after halloweenBackgroundsContent
content = content.replace(
  `import { halloweenBackgroundsContent } from '../../data/blog-content/halloween-backgrounds';`,
  `import { halloweenBackgroundsContent } from '../../data/blog-content/halloween-backgrounds';
import { bokehBackgroundsContent } from '../../data/blog-content/bokeh-backgrounds';`
);

// 2. Add to blogPosts object after halloween-backgrounds
content = content.replace(
  `  'halloween-backgrounds': {
    content: halloweenBackgroundsContent,
    title: "Halloween Virtual Backgrounds - MeetBackdrops",
    description: "Spook up your video calls with Halloween virtual backgrounds. Fun, professional Halloween themes for Zoom, Teams and Google Meet.",
    keywords: "halloween backgrounds, spooky backgrounds, holiday backgrounds, themed backgrounds, halloween zoom backgrounds",
    canonical: "https://meetbackdrops.com/blog/halloween-backgrounds",
    headline: "Halloween Virtual Backgrounds",
    image: "/images/holiday/halloween-01.webp",
    datePublished: "2025-10-01",
    dateModified: "2025-10-09",
    faqKey: 'halloween-backgrounds'
  },`,
  `  'halloween-backgrounds': {
    content: halloweenBackgroundsContent,
    title: "Halloween Virtual Backgrounds - MeetBackdrops",
    description: "Spook up your video calls with Halloween virtual backgrounds. Fun, professional Halloween themes for Zoom, Teams and Google Meet.",
    keywords: "halloween backgrounds, spooky backgrounds, holiday backgrounds, themed backgrounds, halloween zoom backgrounds",
    canonical: "https://meetbackdrops.com/blog/halloween-backgrounds",
    headline: "Halloween Virtual Backgrounds",
    image: "/images/holiday/halloween-01.webp",
    datePublished: "2025-10-01",
    dateModified: "2025-10-09",
    faqKey: 'halloween-backgrounds'
  },
  'bokeh-backgrounds': {
    content: bokehBackgroundsContent,
    title: "Free Bokeh Virtual Backgrounds for Video Calls 2025 - MeetBackdrops",
    description: "Download 66 free bokeh virtual backgrounds for Zoom, Teams, and Google Meet. Elegant soft-focus light effects and artistic blur backgrounds for professional video calls.",
    keywords: "bokeh backgrounds, bokeh lights, soft focus backgrounds, artistic blur, light effects, elegant backgrounds, professional bokeh",
    canonical: "https://meetbackdrops.com/blog/bokeh-backgrounds",
    headline: "Free Bokeh Virtual Backgrounds for Video Calls 2025",
    image: "/images/bokeh-backgrounds/bokeh-1.webp",
    datePublished: "2025-11-06",
    dateModified: "2025-11-06",
    faqKey: 'bokeh-backgrounds'
  },`
);

fs.writeFileSync(filePath, content);
console.log('✓ Updated pages/blog/[slug].js');
