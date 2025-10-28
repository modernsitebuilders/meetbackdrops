// pages/category/ambient-lighting.js

// CRITICAL: This tells Next.js to NEVER pre-render this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Component that returns nothing (will never be seen)
export default function AmbientLightingRedirect() {
  return null;
}

// This runs on EVERY request - no caching
export async function getServerSideProps(context) {
  // Force no-cache headers
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  context.res.setHeader('Pragma', 'no-cache');
  context.res.setHeader('Expires', '0');
  context.res.setHeader('Surrogate-Control', 'no-store');
  
  // Return the redirect
  return {
    redirect: {
      destination: '/category/bookshelves-dark',
      permanent: true, // This sends a 308 redirect
    },
  };
}