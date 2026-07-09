const fs = require('fs');

const filePath = 'public/sitemap.xml';
let content = fs.readFileSync(filePath, 'utf8');

// Add bokeh-backgrounds category (after halloween-backgrounds)
content = content.replace(
  `  <url>
    <loc>https://meetbackdrops.com/category/halloween-backgrounds</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`,
  `  <url>
    <loc>https://meetbackdrops.com/category/halloween-backgrounds</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://meetbackdrops.com/category/bokeh-backgrounds</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Blog Posts -->
  <url>
    <loc>https://meetbackdrops.com/blog/bokeh-backgrounds</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`
);

fs.writeFileSync(filePath, content);
console.log('✓ Updated public/sitemap.xml');
