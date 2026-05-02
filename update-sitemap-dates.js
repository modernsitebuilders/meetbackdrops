// Run: node update-sitemap-dates.js
// Updates active page lastmod dates to the 1st of the current month.
// Static/seasonal pages are left unchanged.

const fs = require('fs');

const d = new Date();
const firstOfMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Active pages that should reflect the current month
const activePages = [
  'https://meetbackdrops.com</loc>',
  'https://meetbackdrops.com/blog</loc>',
  'https://meetbackdrops.com/hd</loc>',
  'https://meetbackdrops.com/browse</loc>',
  'https://meetbackdrops.com/category/bookshelves-bright</loc>',
  'https://meetbackdrops.com/category/bookshelves-dark</loc>',
  'https://meetbackdrops.com/category/wall-shelves-bright</loc>',
  'https://meetbackdrops.com/category/wall-shelves-dark</loc>',
];

let pages = fs.readFileSync('public/sitemap-pages.xml', 'utf8');

for (const page of activePages) {
  // Replace the lastmod on the line immediately after this page's <loc>
  pages = pages.replace(
    new RegExp(`(${page.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</url>|${page.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<lastmod>)[^<]*(</lastmod>)`),
    (match, pre, post) => pre.includes('<lastmod>') ? `${pre}${firstOfMonth}${post}` : match
  );
}

// Simpler approach: line-by-line replacement
const lines = pages.split('\n');
let lastLoc = '';
const updated = lines.map(line => {
  const locMatch = line.match(/<loc>(.*?)<\/loc>/);
  if (locMatch) lastLoc = locMatch[1];
  if (line.includes('<lastmod>') && activePages.some(p => lastLoc === p.replace('</loc>', ''))) {
    return line.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${firstOfMonth}</lastmod>`);
  }
  return line;
});

fs.writeFileSync('public/sitemap-pages.xml', updated.join('\n'));

// Update the index sitemap to today
let index = fs.readFileSync('public/sitemap.xml', 'utf8');
index = index.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
fs.writeFileSync('public/sitemap.xml', index);

console.log(`✓ sitemap.xml index → ${today}`);
console.log(`✓ sitemap-pages.xml active pages → ${firstOfMonth}`);
