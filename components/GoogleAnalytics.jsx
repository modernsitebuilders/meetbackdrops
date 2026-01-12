export default function GoogleAnalytics({ measurementId }) {
  return (
    <>
      <script 
        async 
        src="https://www.googletagmanager.com/gtag/js?id=G-KZBWPC3X69"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KZBWPC3X69');
          `,
        }}
      />
    </>
  );
}