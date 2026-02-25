/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
  domains: ['streambackdrops.com'],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
},
  
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**', '**/.DS_Store']
      };
    }
    
    // Exclude Node.js-only packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
      
      // Exclude googleapis and google-auth-library from client bundle
      config.externals = config.externals || [];
      config.externals.push('googleapis', 'google-auth-library');
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

      // =================================
      // 410 REDIRECTS FOR OLD STREAMBACKDROPS URLS
      // =================================
      
      // Blog posts
      {
        source: '/blog-virtual-background-guide',
        destination: '/410',
        permanent: true,
      },
      {
        source: '/blog/best-virtual-background-sites-2025',
        destination: '/blog/best-virtual-background-sites-2026',
        permanent: true, 
      },
      {
        source: '/blog-background-mistakes',
        destination: '/410',
        permanent: true,
      },
      {
        source: '/blog-job-interview-backgrounds',
        destination: '/410',
        permanent: true,
      },
      
      // Old categories - ALL redirect to 410
      {
        source: '/category/lobbies',
        destination: '/410',
        permanent: true,
      },
    
      {
        source: '/category/lounges',
        destination: '/410',
        permanent: true,
      },
      {
        source: '/category/executive-offices',
        destination: '/410',
        permanent: true,
      },
      {
        source: '/category/minimalist',
        destination: '/410',
        permanent: true,
      },
      {
        source: '/category/home-lifestyle',
        destination: '/410',
        permanent: true,
      },
      {
        source: '/category/ambiant-lighting',
        destination: '/410',
        permanent: true,
      },
      {
        source: '/category/professional-shelves',
        destination: '/410',
        permanent: true,
      },
      {
        source: '/category/open-offices',
        destination: '/410',
        permanent: true,
      },
      {
        source: '/category/private-offices',
        destination: '/410',
        permanent: true,
      },
      {
        source: '/category/home-offices',
        destination: '/410',
        permanent: true,
      },
      
      // Search page
      {
        source: '/search',
        destination: '/410',
        permanent: true,
      },
      {
      source: '/bundles',
      destination: '/hd',
      permanent: true, // 301 redirect
    },
    {
      source: '/premium',
      destination: '/hd',
      permanent: true,
    },
    {
      source: '/collections/free-backgrounds',
      destination: '/',
      permanent: true,
    },
     {
        source: '/office/modern-meeting-room',
        destination: '/category/office-spaces',
        permanent: true,
      },
      {
        source: '/category/most-popular',
        destination: '/most-popular',
        permanent: true,
      }
    ];
  },
  
  // Content Security Policy for Turnstile
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com https://cdn-cookieyes.com; frame-src 'self' https://challenges.cloudflare.com;"
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;