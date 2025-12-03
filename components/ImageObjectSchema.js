export default function ImageObjectSchema({ images, category, categorySlug, baseUrl }) {
  const imageListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": images.slice(0, 10).map((image, index) => ({
      "@type": "ImageObject",
      "position": index + 1,
"contentUrl": `${baseUrl}/images/${categorySlug}/${image}`,
      "name": image.title,
      "description": `Free ${category.toLowerCase()} virtual background for Zoom, Teams, and Google Meet`,
"thumbnail": `${baseUrl}/images/${categorySlug}/${image}`,      "encodingFormat": "image/webp"
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