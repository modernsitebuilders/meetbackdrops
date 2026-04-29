import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head>
        <meta charSet="utf-8" />
        {/* Google Consent Mode v2 — MUST run before any gtag/GTM script loads.
            Defaults all cookie-setting categories to 'denied' until the user
            accepts in the CookieYes banner. CookieYes (with its "Google Consent
            Mode v2" toggle enabled in the CY dashboard) then calls
            gtag('consent', 'update', {...}) based on the user's choice. */}
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
              security_storage: 'granted',
              wait_for_update: 500
            });
          `
        }} />
        {/* CookieYes consent banner — loads async so it doesn't block render.
            Must come after the consent-default script above so the dataLayer
            is initialised when CookieYes posts its update. */}
        <script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/8eb30da506758a4631261b2a/script.js"
          async
        />
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
        
        <link rel="preconnect" href="https://assets.streambackdrops.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://assets.streambackdrops.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />

        {/* Editorial heading face. Body remains system-stack for performance. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
              "name": "StreamBackdrops",
              "url": "https://streambackdrops.com"
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