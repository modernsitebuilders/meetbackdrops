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

export const homepageStructuredData = {
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
        "description": "Provider of free HD virtual backgrounds for professional video calls",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Norristown",
          "addressRegion": "PA",
          "addressCountry": "US"
        }
      },
      {
        "@type": "CollectionPage",
        "name": "Virtual Background Collections",
        "description": `Browse our collection of ${TOTAL_IMAGES_FORMATTED} free HD virtual backgrounds`,
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
        "telephone": "",
        "priceRange": "Free",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "",
          "addressLocality": "Norristown",
          "addressRegion": "PA",
          "postalCode": "",
          "addressCountry": "US"
        }
      }
    ]
  };