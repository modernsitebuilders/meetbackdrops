// pages/category/ambient-lighting.js

// This will run at build time
export async function getStaticProps() {
  return {
    redirect: {
      destination: '/category/bookshelves-dark',
      permanent: true,
    },
  };
}

// Component never renders because of redirect
export default function AmbientLightingRedirect() {
  return null;
}