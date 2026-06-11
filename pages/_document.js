import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'granted',
              functionality_storage: 'granted',
              security_storage: 'granted'
            });
          `
        }} />
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `
            function loadGTM() {
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-MZT8B48G');
            }
            window.addEventListener('load', function() {
              setTimeout(loadGTM, 3000);
            });
          `
        }} />
        
        <style dangerouslySetInnerHTML={{
          __html: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              line-height: 1.6;
            }
            * { box-sizing: border-box; }
            .hero { min-height: 50vh; }
            .loading { opacity: 0.6; }
          `
        }} />
        
        {/* Critical path: R2 CDN, fonts (for hero), GTM. DNS prefetch for analytics. */}
        <link rel="preconnect" href="https://assets.streambackdrops.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Preload critical Fraunces font weights to reduce rendering delay */}
        <link
          rel="preload"
          as="font"
          href="https://fonts.gstatic.com/s/fraunces/v48/KFO7CnqEu92mj-oCHxksbO9H5JchU6Hc.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap"
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "MeetBackdrops",
              "url": "https://meetbackdrops.com"
            })
          }}
        />
        
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="referrer" content="origin-when-cross-origin" />
        <meta name="color-scheme" content="light" />
<meta name="p:domain_verify" content="46bcaae45119c33542c11b465d99d116"/>
      </Head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-MZT8B48G"
            height="0" 
            width="0" 
            style={{display:'none',visibility:'hidden'}}
          />
        </noscript>
        
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}