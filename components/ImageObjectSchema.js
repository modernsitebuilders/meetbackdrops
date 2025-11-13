// components/ImageObjectSchema.js
export default function ImageObjectSchema({ images, category, baseUrl }) {
  const imageListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": images.slice(0, 10).map((image, index) => ({
      "@type": "ImageObject",
      "position": index + 1,
      "contentUrl": `${baseUrl}${image.url}`,
      "name": `${category} virtual background ${index + 1}`,
      "description": `Free ${category.toLowerCase()} virtual background for Zoom, Teams, and Google Meet`,
      "thumbnail": `${baseUrl}${image.url}`,
      "encodingFormat": "image/webp"
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(imageListData)
      }}
    />
  );
}