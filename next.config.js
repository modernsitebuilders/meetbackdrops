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
  
  // Content Security Policy
 async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://cdn-cookieyes.com https://cookieyes.com",
            "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.cookieyes.com https://cookieyes.com",
            "img-src 'self' data: https: blob:",
            "style-src 'self' 'unsafe-inline' https://cdn-cookieyes.com",
            "font-src 'self' data: https://cdn-cookieyes.com",
            "frame-src 'self' https://www.google.com https://cookieyes.com",
          ].join('; ')
        }
      ]
    }
  ];
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
        source: '/category/ambiant-lighting',
        destination: '/category/bookshelves-dark',
        permanent: true,
      },
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
    ];
  },
};

module.exports = nextConfig;