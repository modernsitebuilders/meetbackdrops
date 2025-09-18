// pages/_app.js - DEPLOY THIS VERSION NOW
import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
    
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* CookieYes - Will work when banner shows */}
      <Script
        id="cookieyes"
        src="https://cdn-cookieyes.com/client_data/8eb30da506758a4631261b2a/script.js"
        strategy="beforeInteractive"
      />
      
      {/* Google Analytics - Enable after delay */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-QMD6NEPFWR"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // CookieYes will manage consent when banner appears
          setTimeout(() => {
            gtag('config', 'G-QMD6NEPFWR');
          }, 2000);
        `}
      </Script>
      
      <Component {...pageProps} />
{typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && <Analytics />}
    </>
  );
}