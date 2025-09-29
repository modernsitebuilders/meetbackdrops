// pages/api/sitemap.js
// Generates XML sitemap for search engines

export default function handler(req, res) {
  // Force HTTPS and consistent domain
  const baseUrl = 'https://streambackdrops.com';

  // CURRENT ACTIVE CATEGORIES ONLY
  const categories = [
    'well-lit',
    'ambient-lighting', 
    'office-spaces',
    'living-room',
    'kitchen'
  ];
  
  // Static pages with priority and update frequency
  const staticPages = [
    {
      url: baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      url: `${baseUrl}/about`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: `${baseUrl}/contact`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      url: `${baseUrl}/blog`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/license`,
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: '0.4'
    },
    {
      url: `${baseUrl}/privacy`,
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      url: `${baseUrl}/terms`,
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: '0.3'
    }
  ];

  // Category pages - only current active ones
  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/category/${category}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: '0.8'
  }));

  // ALL Blog posts
  const blogPosts = [
    {
      url: `${baseUrl}/blog-background-mistakes`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/blog-backgrounds-by-industry`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/blog-best-virtual-background-sites-2025`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/blog-lighting-tips`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/blog-professional-video-calls`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/blog-remote-work-productivity`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/blog-virtual-background-guide`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/blog-zoom-teams-google`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    }
  ];

  // Combine all pages
  const allPages = [...staticPages, ...categoryPages, ...blogPosts];

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Set proper headers for XML response
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(sitemap);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};