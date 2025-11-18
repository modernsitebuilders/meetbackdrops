// data/homepageSchema.js
import { TOTAL_IMAGES_FORMATTED, CATEGORIES } from '../lib/categories-config';

// Generate collection items dynamically from CATEGORIES
const generateCollections = () => {
  return Object.entries(CATEGORIES).map(([slug, data]) => ({
    "@type": "Collection",
    "name": data.name,
    "url": `https://streambackdrops.com/category/${slug}`,
    "description": `${data.count} ${data.description.toLowerCase()}`
  }));
};

// NEW: Function to generate schema with review data
export const generateHomepageSchema = (reviewData) => {
  const baseSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "StreamBackdrops",
        "description": "Free professional virtual backgrounds for video calls",
        "url": "https://streambackdrops.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://streambackdrops.com/?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "StreamBackdrops",
        "url": "https://streambackdrops.com",
        "logo": "https://streambackdrops.com/logo.png",
        "description": "Provider of free high quality virtual backgrounds for professional video calls",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "614 Jefferson St",
          "addressLocality": "Bridgeport",
          "addressRegion": "PA",
          "postalCode": "19405",
          "addressCountry": "US"
        }
      },
      {
        "@type": "CollectionPage",
        "name": "Virtual Background Collections",
        "description": `Browse our collection of ${TOTAL_IMAGES_FORMATTED} free high quality virtual backgrounds`,
        "url": "https://streambackdrops.com",
        "hasPart": generateCollections()
      },
      {
        "@type": "SoftwareApplication",
        "name": "StreamBackdrops Virtual Background Library",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web Browser",
        "url": "https://streambackdrops.com",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "LocalBusiness",
        "name": "StreamBackdrops",
        "image": "https://streambackdrops.com/logo.png",
        "url": "https://streambackdrops.com",
        "telephone": "+1-555-123-4567",
        "priceRange": "Free",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "614 Jefferson St",
          "addressLocality": "Bridgeport",
          "addressRegion": "PA",
          "postalCode": "19405",
          "addressCountry": "US"
        }
      }
    ]
  };

  // Add review data if available
  if (reviewData && reviewData.totalReviews > 0) {
    const localBusiness = baseSchema["@graph"].find(item => item["@type"] === "LocalBusiness");
    const softwareApp = baseSchema["@graph"].find(item => item["@type"] === "SoftwareApplication");
    
    // Add aggregate rating
    localBusiness.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": reviewData.averageRating.toString(),
      "reviewCount": reviewData.totalReviews.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };

    // Add aggregate rating to SoftwareApplication too
    softwareApp.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": reviewData.averageRating.toString(),
      "reviewCount": reviewData.totalReviews.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
    
    // Add individual reviews with comments
    if (reviewData.reviewsWithComments.length > 0) {
      localBusiness.review = reviewData.reviewsWithComments.map(review => {
        // Format name to first name + last initial if full name provided
        const nameParts = review.name.split(' ');
        const displayName = nameParts.length > 1 
          ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
          : review.name;

        // Parse date to ISO format
        const dateObj = new Date(review.date);
        const isoDate = dateObj.toISOString().split('T')[0];

        return {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": displayName
          },
          "datePublished": isoDate,
          "reviewBody": review.comment,
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": review.rating.toString(),
            "bestRating": "5",
            "worstRating": "1"
          }
        };
      });
    }
  }

  return baseSchema;
};

// Keep the old export for backward compatibility (without reviews)
export const homepageStructuredData = generateHomepageSchema(null);