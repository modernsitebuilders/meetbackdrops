import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import Analytics from '../components/Analytics';
import { useEffect } from 'react';
import { getOrCreateSession } from '../lib/sessionTracking';
import { WishlistProvider } from '../lib/WishlistContext';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    getOrCreateSession();
  }, []);

  return (
    <WishlistProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Author entity — ties this site to David Miles at the Modern Site Builders
            hub. The @id is identical across all properties so Google resolves one
            operator behind the network (EEAT). Profile: /author/david-miles */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              '@id': 'https://modernsitebuilders.com/#david-miles',
              name: 'David Miles',
              url: 'https://modernsitebuilders.com/author/david-miles',
              sameAs: ['https://www.linkedin.com/in/dave-miles-webdev/'],
            }),
          }}
        />
      </Head>
       <Analytics /> 
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-QMD6NEPFWR" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-QMD6NEPFWR');`}</Script>
      <Component {...pageProps} />
    </WishlistProvider>
  );
}