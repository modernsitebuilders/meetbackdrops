// pages/category/ambient-lighting.js

export default function AmbientLightingRedirect() {
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