// pages/category/ambiant-lighting.js
export default function AmbiantLightingRedirect() {
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