const fs = require('fs');

const filePath = 'components/Header.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add to dropdownCategories (right after halloween)
content = content.replace(
  `    { name: 'Halloween 🎃', path: '/category/halloween-backgrounds' }
  ];`,
  `    { name: 'Halloween 🎃', path: '/category/halloween-backgrounds' },
    { name: 'Bokeh Backgrounds', path: '/category/bokeh-backgrounds' }
  ];`
);

// 2. Add to allCategories (right after halloween)
content = content.replace(
  `  { name: 'Halloween 🎃', path: '/category/halloween-backgrounds', key: 'halloween-backgrounds' }
  ];`,
  `  { name: 'Halloween 🎃', path: '/category/halloween-backgrounds', key: 'halloween-backgrounds' },
  { name: 'Bokeh Backgrounds', path: '/category/bokeh-backgrounds', key: 'bokeh-backgrounds' }
  ];`
);

fs.writeFileSync(filePath, content);
console.log('✓ Updated components/Header.js');
