const fs = require('fs');

const file = "pages/category/[slug].js";
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "'libraries',",
  "'libraries',\n    'conference-rooms',"
);

fs.writeFileSync(file, content);
console.log('✓ Added conference-rooms to getStaticPaths');
