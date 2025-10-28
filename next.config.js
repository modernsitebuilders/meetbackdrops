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
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.streambackdrops.com',
          },
        ],
        destination: 'https://streambackdrops.com/:path*',
        permanent: true,
      },
      // Redirect http to https
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'streambackdrops.com',
          },
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://streambackdrops.com/:path*',
        permanent: true,
      },
      // Old category redirects
      
      {
        source: '/category/conference-rooms',
        destination: '/category/office-spaces',
        permanent: true,
      },
      {
        source: '/category/minimalist',
        destination: '/category/bookshelves-bright',
        permanent: true,
      },
      {
        source: '/category/home-lifestyle',
        destination: '/category/living-rooms',
        permanent: true,
      },
      {
        source: '/category/professional-shelves',
        destination: '/category/office-spaces',
        permanent: true,
      },
      {
        source: '/category/open-offices',
        destination: '/category/office-spaces',
        permanent: true,
      },
      {
        source: '/category/executive-offices',
        destination: '/category/office-spaces',
        permanent: true,
      },
      {
        source: '/category/home-offices',
        destination: '/category/office-spaces',
        permanent: true,
      },
      {
        source: '/category/premium-4k',
        destination: '/',
        permanent: true,
      },
      {
        source: '/category/lobbies',
        destination: '/category/office-spaces',
        permanent: true,
      },
      {
        source: '/category/lounges',
        destination: '/category/living-rooms',
        permanent: true,
      },
      {
        source: '/category/private-offices',
        destination: '/category/office-spaces',
        permanent: true,
      },
      // New redirects for renamed categories
      {
        source: '/category/well-lit',
        destination: '/category/bookshelves-bright',
        permanent: true,
      },
      {
        source: '/category/ambient-lighting',
        destination: '/category/bookshelves-dark',
        permanent: true,
      },
      {
        source: '/category/ambient',
        destination: '/category/bookshelves-dark',
        permanent: true,
      },
      {
        source: '/category/living-room',
        destination: '/category/living-rooms',
        permanent: true,
      },
      {
        source: '/category/kitchen',
        destination: '/category/kitchens',
        permanent: true,
      },
      // 🔥 BLOG REDIRECTS - Add these for your old blog URLs
      {
        source: '/blog-background-mistakes',
        destination: '/blog/background-mistakes',
        permanent: true,
      },
      {
        source: '/blog-job-interview-backgrounds',
        destination: '/blog/job-interview-backgrounds',
        permanent: true,
      },
      {
        source: '/blog-halloween-backgrounds',
        destination: '/blog/halloween-backgrounds',
        permanent: true,
      },
      {
        source: '/blog-best-virtual-background-sites-2025',
        destination: '/blog/best-virtual-background-sites-2025',
        permanent: true,
      },
      {
        source: '/blog-video-call-etiquette',
        destination: '/blog/video-call-etiquette',
        permanent: true,
      },
      {
        source: '/blog-professional-video-calls',
        destination: '/blog/professional-video-calls',
        permanent: true,
      },
      {
        source: '/blog-backgrounds-by-industry',
        destination: '/blog/backgrounds-by-industry',
        permanent: true,
      },
      {
        source: '/blog-lighting-tips',
        destination: '/blog/lighting-tips',
        permanent: true,
      },
      {
        source: '/blog-virtual-background-guide',
        destination: '/blog/virtual-background-guide',
        permanent: true,
      },
      {
        source: '/blog-zoom-teams-google',
        destination: '/blog/zoom-teams-google',
        permanent: true,
      },
      {
        source: '/blog-remote-work-productivity',
        destination: '/blog/remote-work-productivity',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;