import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';

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
        "description": "Browse our collection of ${TOTAL_IMAGES_FORMATTED} free HD virtual backgrounds",
        "url": "https://streambackdrops.com",
        "hasPart": [
          {
            "@type": "Collection",
            "name": "Bookshelves - Bright",
            "url": "https://streambackdrops.com/category/bookshelves-bright",
            "description": "47 bright bookshelf backgrounds for professional video calls"
          },
          {
            "@type": "Collection",
            "name": "Bookshelves - Dark",
            "url": "https://streambackdrops.com/category/bookshelves-dark",
            "description": "41 warm bookshelf backgrounds with ambient lighting"
          },
          {
            "@type": "Collection",
            "name": "Office Spaces",
            "url": "https://streambackdrops.com/category/office-spaces",
            "description": "19 professional office backgrounds for business calls"
          },
          {
            "@type": "Collection",
            "name": "Living Rooms",
            "url": "https://streambackdrops.com/category/living-rooms",
            "description": "47 comfortable home backgrounds for casual video calls"
          },
          {
            "@type": "Collection",
            "name": "Kitchens",
            "url": "https://streambackdrops.com/category/kitchens",
            "description": "18 kitchen backgrounds for cooking shows and casual calls"
          },
          {
            "@type": "Collection",
            "name": "Coffee Shops",
            "url": "https://streambackdrops.com/category/coffee-shops",
            "description": "19 cozy coffee shop backgrounds for casual meetings"
          },
          {
            "@type": "Collection",
            "name": "Art Galleries",
            "url": "https://streambackdrops.com/category/art-galleries",
            "description": "17 sophisticated art gallery spaces with clean walls"
          },
          {
            "@type": "Collection",
            "name": "Urban Lofts",
            "url": "https://streambackdrops.com/category/urban-lofts",
            "description": "17 modern industrial loft spaces with contemporary design"
          },
          {
            "@type": "Collection",
            "name": "Gardens & Patios",
            "url": "https://streambackdrops.com/category/gardens-patios",
            "description": "13 beautiful outdoor garden and patio backgrounds"
          },
          {
            "@type": "Collection",
            "name": "Historic Spaces",
            "url": "https://streambackdrops.com/category/historic-spaces",
            "description": "7 elegant historic interiors and architectural spaces"
          },
          {
            "@type": "Collection",
            "name": "Nature & Landscapes",
            "url": "https://streambackdrops.com/category/nature-landscapes",
            "description": "49 stunning natural landscapes and scenic outdoor views"
          },
          {
            "@type": "Collection",
            "name": "Libraries",
            "url": "https://streambackdrops.com/category/libraries",
            "description": "18 classic library rooms with floor-to-ceiling books"
          },
          {
            "@type": "Collection",
            "name": "Halloween Backgrounds",
            "url": "https://streambackdrops.com/category/halloween-backgrounds",
            "description": "25 festive Halloween backgrounds with seasonal atmosphere"
          }
        ]
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
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": "127"
        }
      }
    ]
  };