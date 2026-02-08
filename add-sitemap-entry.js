const fs = require('fs');

const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');

const newEntry = `  <url>
    <loc>https://streambackdrops.com/category/libraries</loc>
    <lastmod>2025-10-09T00:00:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://streambackdrops.com/category/conference-rooms</loc>
    <lastmod>2026-02-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

const oldEntry = `  <url>
    <loc>https://streambackdrops.com/category/libraries</loc>
    <lastmod>2025-10-09T00:00:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

const updated = sitemap.replace(oldEntry, newEntry);
fs.writeFileSync('public/sitemap.xml', updated);
console.log('✓ Added conference-rooms to sitemap');
