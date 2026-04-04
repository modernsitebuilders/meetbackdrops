// components/VideoObjectSchema.js
// Adds VideoObject structured data so Google can surface video rich results
// (thumbnail, duration, upload date) directly in search results.
//
// Google's required fields: name, description, thumbnailUrl, uploadDate
// Recommended for video rich results: contentUrl or embedUrl (provide both)
// Docs: https://developers.google.com/search/docs/appearance/structured-data/video

export default function VideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
  duration // ISO 8601 – e.g. "PT1M30S" for 1 min 30 sec (optional but recommended)
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": name,
    "description": description,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": uploadDate,
    "contentUrl": contentUrl,
    "embedUrl": embedUrl,
    "publisher": {
      "@type": "Organization",
      "name": "StreamBackdrops",
      "logo": {
        "@type": "ImageObject",
        "url": "https://streambackdrops.com/logo.png"
      }
    }
  };

  if (duration) {
    schema.duration = duration;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
