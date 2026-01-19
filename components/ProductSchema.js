export default function ProductSchema({ products, reviewsData }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "description": `Premium HD virtual background in 2912×1632 resolution. ${product.name} for Zoom, Teams, and Google Meet.`,
        "image": `https://streambackdrops.com/images/${product.category}/${product.id.replace('-hd', '')}.webp`,
        ...(reviewsData && reviewsData.totalReviews > 0 && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": reviewsData.averageRating.toString(),
            "reviewCount": reviewsData.totalReviews.toString(),
            "bestRating": "5",
            "worstRating": "1"
          }
        }),
        "offers": {
          "@type": "Offer",
          "price": "4.99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://streambackdrops.com/hd"
        },
        "brand": {
          "@type": "Brand",
          "name": "StreamBackdrops"
        }
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}