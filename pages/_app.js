import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import Analytics from '../components/Analytics';
import { useEffect } from 'react';
import { getOrCreateSession } from '../lib/sessionTracking';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize session on app load
    getOrCreateSession();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Analytics />
      
      <Script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  strategy="afterInteractive"
/>
      <Script
        id="cookieyes"
        src="https://cdn-cookieyes.com/client_data/8eb30da506758a4631261b2a/script.js"
        strategy="beforeInteractive"
      />
      
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-QMD6NEPFWR"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-QMD6NEPFWR');
        `}
      </Script>
      
      <Component {...pageProps} />
      <VercelAnalytics />
    </>
  );
}