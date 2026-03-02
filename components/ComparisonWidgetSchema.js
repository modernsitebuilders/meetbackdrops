export default function ComparisonWidgetSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "HD vs Standard Background Comparison Tool",
    "description": "Interactive side-by-side comparison tool showing the difference between standard (1456×816) and premium HD (2912×1632) virtual backgrounds. Drag the slider to see 2x the resolution and detail.",
    "url": "https://streambackdrops.com/hd",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "StreamBackdrops",
      "url": "https://streambackdrops.com"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
