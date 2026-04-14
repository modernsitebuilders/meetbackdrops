export default function ImageObjectSchema({ images, category, categorySlug, baseUrl, scores = {}, metadata = {} }) {
  const imagesWithScores = images.map(image => {
    const filename = image.filename || image;
    const baseName = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
    const score = scores[filename] || scores[`${baseName}.png`] || scores[`${baseName}.webp`] || 0;
    
    // Try multiple key formats
const metaKey = baseName;
let imageMeta = metadata[metaKey];

if (!imageMeta) {
  // Try finding by filename
  const matchingKey = Object.keys(metadata).find(key => 
    metadata[key].filename === filename
  );
  imageMeta = matchingKey ? metadata[matchingKey] : {};
}
    
    return { filename, score, meta: imageMeta };
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
      "contentUrl": `https://assets.streambackdrops.com/webp/${categorySlug}/${image.filename}`,
      "name": image.meta?.title || `${category} virtual background ${index + 1}`,
      "description": image.meta?.alt || image.meta?.description || `Free ${category.toLowerCase()} virtual background`,
      "thumbnail": `https://assets.streambackdrops.com/webp/${categorySlug}/${image.filename}`,
      "encodingFormat": "image/webp",
      "width": image.meta?.width || 1920,
      "height": image.meta?.height || 1080,
      "license": `${baseUrl}/license`,
      "acquireLicensePage": `${baseUrl}/license`,
      "creditText": "StreamBackdrops",
      "copyrightNotice": "© StreamBackdrops. Free for personal use only.",
      "creator": {
        "@type": "Organization",
        "name": "StreamBackdrops",
        "url": baseUrl
      }
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