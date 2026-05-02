import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Premium4KRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        router.replace('/premium');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Premium 4K Backgrounds - MeetBackdrops</title>
        <meta httpEquiv="refresh" content="2; url=/premium" />
      </Head>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        color: 'white'
      }}>
        <div>
          <div style={{fontSize: '3rem', marginBottom: '1rem'}}>✨</div>
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'}}>
            Redirecting to Premium Collection...
          </h1>
          <p style={{marginBottom: '2rem', opacity: 0.9}}>
            Taking you to our premium 4K backgrounds
          </p>
          <Link href="/premium" style={{
            color: 'white',
            textDecoration: 'underline',
            fontSize: '1.1rem'
          }}>
            Click here if you're not redirected automatically
          </Link>
        </div>
      </div>
    </>
  );
}

// Add server-side rendering to prevent static generation issues
export async function getServerSideProps(context) {
  return {
    props: {}
  };
}