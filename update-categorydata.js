const fs = require('fs');

const filePath = 'data/categoryData.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add bokeh-backgrounds to categoryInfo (before the closing brace)
content = content.replace(
  `  'halloween-backgrounds': {
    name: 'Halloween Backgrounds',
    description: 'Festive Halloween backgrounds with pumpkins, fall decor, and seasonal atmosphere',
    seoDescription: 'Download free Halloween virtual backgrounds for video calls. Spooky seasonal backgrounds with pumpkins and autumn decor.',
    images: Array.from({length: CATEGORIES['halloween-backgrounds'].count}, (_, i) => ({
      filename: \`halloween-background-\${String(i + 1).padStart(2, '0')}.webp\`,
      title: \`Halloween Background \${i + 1}\`
    }))
  }
};`,
  `  'halloween-backgrounds': {
    name: 'Halloween Backgrounds',
    description: 'Festive Halloween backgrounds with pumpkins, fall decor, and seasonal atmosphere',
    seoDescription: 'Download free Halloween virtual backgrounds for video calls. Spooky seasonal backgrounds with pumpkins and autumn decor.',
    images: Array.from({length: CATEGORIES['halloween-backgrounds'].count}, (_, i) => ({
      filename: \`halloween-background-\${String(i + 1).padStart(2, '0')}.webp\`,
      title: \`Halloween Background \${i + 1}\`
    }))
  },
  
  'bokeh-backgrounds': {
    name: 'Bokeh Backgrounds',
    description: 'Beautiful bokeh light backgrounds with soft, artistic blur effects for elegant video calls',
    seoDescription: 'Download free bokeh virtual backgrounds for video calls. Soft-focus light effects and artistic blur backgrounds.',
    images: Array.from({length: CATEGORIES['bokeh-backgrounds'].count}, (_, i) => ({
      filename: \`bokeh-\${i + 1}.webp\`,
      title: \`Bokeh Background \${i + 1}\`
    }))
  }
};`
);

// 2. Add to folderMap (before the closing brace)
content = content.replace(
  `  'halloween-backgrounds': 'halloween-backgrounds'
};`,
  `  'halloween-backgrounds': 'halloween-backgrounds',
  'bokeh-backgrounds': 'bokeh-backgrounds'
};`
);

fs.writeFileSync(filePath, content);
console.log('✓ Updated data/categoryData.js');
