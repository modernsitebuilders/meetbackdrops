/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**', '**/.DS_Store']
      };
    }
    return config;
  },
  
  // Redirects for old URLs
  async redirects() {
    return [
      // www and https redirects
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.streambackdrops.com' }],
        destination: 'https://streambackdrops.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'streambackdrops.com' },
          { type: 'header', key: 'x-forwarded-proto', value: 'http' }
        ],
        destination: 'https://streambackdrops.com/:path*',
        permanent: true,
      },
      
      // Old blog posts (list each one)
      { source: '/blog-job-interview-backgrounds', destination: '/410', permanent: true },
      { source: '/blog-best-virtual-background-sites-2025', destination: '/410', permanent: true },
      { source: '/blog-backgrounds-by-industry', destination: '/410', permanent: true },
      { source: '/blog-background-mistakes', destination: '/410', permanent: true },
      { source: '/blog-lighting-tips', destination: '/410', permanent: true },
      { source: '/blog-virtual-background-guide', destination: '/410', permanent: true },
      { source: '/blog-zoom-teams-google', destination: '/410', permanent: true },
      { source: '/blog-video-call-etiquette', destination: '/410', permanent: true },
      { source: '/blog-remote-work-productivity', destination: '/410', permanent: true },
      { source: '/blog-professional-video-calls', destination: '/410', permanent: true },
      { source: '/blog-christmas-backgrounds', destination: '/410', permanent: true },
      { source: '/blog-halloween-backgrounds', destination: '/410', permanent: true },
      
      // Old categories
      { source: '/category/ambient-lighting', destination: '/410', permanent: true },
      { source: '/category/kitchen', destination: '/410', permanent: true },
      { source: '/category/living-room', destination: '/410', permanent: true },
      { source: '/category/well-lit', destination: '/410', permanent: true },
      
      // Old search page
      { source: '/search', destination: '/410', permanent: true },
    ];
  }
};

module.exports = nextConfig;