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
        "image": `https://res.cloudinary.com/dnhju6mhg/image/upload/webp/${product.category}/${product.id.replace('-hd', '')}.webp`,
        ...(reviewsData && reviewsData.totalReviews > 0 && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": reviewsData.averageRating.toString(),
            "reviewCount": reviewsData.totalReviews.toString(),
            "bestRating": "5",
            "worstRating": "1"
          }
        }),
        ...(reviewsData && reviewsData.reviewsWithComments && reviewsData.reviewsWithComments.length > 0 && {
          "review": reviewsData.reviewsWithComments.map(review => ({
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": review.rating.toString(),
              "bestRating": "5",
              "worstRating": "1"
            },
            "author": {
              "@type": "Person",
              "name": review.name
            },
            "datePublished": review.date,
            "reviewBody": review.comment
          }))
        }),
        "offers": {
          "@type": "Offer",
          "price": "4.99",
          "priceCurrency": "USD",
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/InStock",
          "url": "https://streambackdrops.com/hd",
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "USD"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 0,
                "unitCode": "DAY"
              }
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
          }
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