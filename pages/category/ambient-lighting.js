// pages/category/ambient-lighting.js
export default function AmbientLightingRedirect() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/category/bookshelves-dark',
      permanent: true, // 308 redirect
    },
  };
}