const fs = require('fs');

const filePath = 'pages/category/[slug].js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add bokeh-backgrounds to getStaticPaths
content = content.replace(
  `    'halloween-backgrounds'
  ].map((slug) => ({`,
  `    'halloween-backgrounds',
    'bokeh-backgrounds'
  ].map((slug) => ({`
);

// 2. Add to featuredImages object
content = content.replace(
  `    'libraries': 'library-1.webp'
  };`,
  `    'libraries': 'library-1.webp',
    'bokeh-backgrounds': 'bokeh-1.webp'
  };`
);

fs.writeFileSync(filePath, content);
console.log('✓ Updated pages/category/[slug].js');
