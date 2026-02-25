import '../styles/globals.css';
import Head from 'next/head';
// import Script from 'next/script';
// import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
// import Analytics from '../components/Analytics';
// import CookieBanner from '../components/CookieBanner';
import { useEffect } from 'react';
// import { getOrCreateSession } from '../lib/sessionTracking';

import { getOrCreateSession } from '../lib/sessionTracking';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    getOrCreateSession();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* <Analytics /> */}
      {/* <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" /> */}
      {/* <Script src="https://www.googletagmanager.com/gtag/js?id=G-QMD6NEPFWR" strategy="lazyOnload" /> */}
      {/* <Script id="google-analytics" strategy="lazyOnload">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-QMD6NEPFWR');`}</Script> */}
      {/* <CookieBanner /> */}
      
      <Component {...pageProps} />
      {/* <VercelAnalytics /> */}
    </>
  );
}