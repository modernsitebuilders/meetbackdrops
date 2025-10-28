// pages/category/ambiant-lighting.js

export default function AmbiantLightingRedirect() {
  return null;
}

// Use getServerSideProps instead of getStaticProps
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/category/bookshelves-dark',
      permanent: true,
    },
  };
}