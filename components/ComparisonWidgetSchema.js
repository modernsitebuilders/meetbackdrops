export default function ComparisonWidgetSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "HD vs Standard Quality Comparison - Virtual Backgrounds",
    "description": "Interactive comparison showing the difference between standard (1456×816) and premium HD (2912×1632) virtual backgrounds. Drag the slider to see 2x the resolution and detail.",
    "thumbnailUrl": "https://streambackdrops.com/images/bookshelves-dark/bookshelves-dark-09.webp",
    "contentUrl": "https://streambackdrops.com/hd",
    "embedUrl": "https://streambackdrops.com/hd",
    "uploadDate": "2026-01-15",
    "duration": "PT0M30S",
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/WatchAction",
      "userInteractionCount": 0
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}