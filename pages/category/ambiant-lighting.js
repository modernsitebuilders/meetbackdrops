// pages/category/ambiant-lighting.js
export default function AmbiantLightingRedirect() {
  return null;
}

export async function getServerSideProps(context) {
  // Add cache-control headers to prevent ANY caching
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  context.res.setHeader('X-Robots-Tag', 'noindex'); // Tell Google not to index this URL
  
  return {
    redirect: {
      destination: '/category/bookshelves-dark',
      permanent: true, // 308 redirect
    },
  };
}