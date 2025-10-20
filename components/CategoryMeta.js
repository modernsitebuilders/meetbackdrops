import Head from 'next/head';
import { folderMap } from '../data/categoryData';

export default function CategoryMeta({ category, slug }) {
  if (!category) {
    return (
      <Head>
        <title>Category Not Found - StreamBackdrops</title>
        <meta name="description" content="Category not found. Browse our free HD virtual backgrounds." />
        <meta name="robots" content="noindex" />
      </Head>
    );
  }

  // Define featured images for each category
  const featuredImages = {
    'halloween-backgrounds': 'halloween-background-20.webp',
    'bookshelves-bright': 'bookshelf-bright-1.webp',
    'bookshelves-dark': 'bookshelf-dark-1.webp',
    'office-spaces': 'office-1.webp',
    'living-rooms': 'living-room-1.webp',
    'kitchens': 'kitchen-1.webp',
    'coffee-shops': 'coffee-shop-01.webp',
    'art-galleries': 'art-gallery-1.webp',
    'urban-lofts': 'urban-loft-1.webp',
    'gardens-patios': 'garden-patio-1.webp',
    'historic-spaces': 'historic-1.webp',
    'nature-landscapes': 'nature-1.webp',
    'libraries': 'library-1.webp'
  };
  
  const featuredImage = featuredImages[slug] || category.images[0]?.filename || 'default.webp';
  const imageUrl = `https://streambackdrops.com/images/${slug}/${featuredImage}`;

  return (
    <Head>
      <title>{category.name} Backgrounds - Free HD | StreamBackdrops</title>
      <meta name="description" content={`Download free ${category.name.toLowerCase()} backgrounds in HD. Perfect for Zoom, Teams & Google Meet.`} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="keywords" content={`${category.name.toLowerCase()}, virtual backgrounds, video calls, ${slug}, professional backgrounds, HD download, Zoom backgrounds, Teams backgrounds`} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="author" content="StreamBackdrops" />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={`${category.name} Backgrounds - Free HD | StreamBackdrops`} />
      <meta property="og:description" content={`Download free ${category.name.toLowerCase()} backgrounds in HD quality. Perfect for professional video calls.`} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1920" />
      <meta property="og:image:height" content="1080" />
      <meta property="og:image:alt" content={`${category.name} Virtual Background Preview`} />
      <meta property="og:url" content={`https://streambackdrops.com/category/${slug}`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="StreamBackdrops" />
      
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={`${category.name} Backgrounds - Free HD`} />
      <meta property="twitter:description" content={`Free HD ${category.name.toLowerCase()} backgrounds for video calls`} />
      <meta property="twitter:image" content={imageUrl} />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `How do I use ${category.name.toLowerCase()} virtual backgrounds?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `To use these ${category.name.toLowerCase()} backgrounds, download your chosen image, then upload it in your video conferencing app's virtual background settings. For Zoom, go to Settings > Background & Effects. For Teams, go to Settings > Devices > Background effects.`
                }
              },
              {
                "@type": "Question",
                "name": "What format are these backgrounds in?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "All backgrounds are available in high-quality PNG format, optimized for video calls. They work with Zoom, Microsoft Teams, Google Meet, and other video conferencing platforms."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use these backgrounds for commercial purposes?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all backgrounds on StreamBackdrops are free to download and use for both personal and commercial purposes, including business meetings, webinars, and professional presentations."
                }
              },
              {
                "@type": "Question",
                "name": "What's the best lighting for virtual backgrounds?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For best results with virtual backgrounds, ensure you have good front-facing lighting. Natural light from a window or a ring light works well. Avoid backlighting, which can cause poor edge detection."
                }
              }
            ]
          })
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://streambackdrops.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": category.name,
                "item": `https://streambackdrops.com/category/${slug}`
              }
            ]
          })
        }}
      />

      {/* ItemList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": `${category.name} Virtual Backgrounds Collection`,
            "description": category.description,
            "numberOfItems": category.images.length,
            "itemListElement": category.images.slice(0, 10).map((image, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": `https://streambackdrops.com/images/${folderMap[slug]}/${image.filename}`,
              "name": image.title,
              "image": `https://streambackdrops.com/images/${folderMap[slug]}/${image.filename}`
            }))
          })
        }}
      />
    </Head>
  );
}