export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const robotsTxt = `User-agent: *
Allow: /

Disallow: /api/track-page-view
Disallow: /api/track-download

Sitemap: https://streambackdrops.com/sitemap.xml

Crawl-delay: 1`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(robotsTxt);
  } catch (error) {
    res.status(500).send('User-agent: *\nAllow: /');
  }
}