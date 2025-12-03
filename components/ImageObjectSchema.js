export default function ImageObjectSchema({ images, category, categorySlug, baseUrl, scores = {} }) {
  // Sort images by score, take top 15
  const imagesWithScores = images.map(image => {
    const filename = image.filename || image;
    const baseName = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
    const score = scores[filename] || scores[`${baseName}.png`] || scores[`${baseName}.webp`] || 0;
    return { filename, score };
  });
  
  const topImages = imagesWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  const imageListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": topImages.map((image, index) => ({
      "@type": "ImageObject",
      "position": index + 1,
      "contentUrl": `${baseUrl}/images/${categorySlug}/${image.filename}`,
      "name": `${category} virtual background ${index + 1}`,
      "description": `Free ${category.toLowerCase()} virtual background for Zoom, Teams, and Google Meet`,
      "thumbnail": `${baseUrl}/images/${categorySlug}/${image.filename}`,
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