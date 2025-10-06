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
  }
  // CSP removed temporarily to test tracking
};
module.exports = nextConfig;