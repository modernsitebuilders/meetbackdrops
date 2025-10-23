// components/BlogPostSchema.js

// Utility function for consistent image URLs
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `https://streambackdrops.com${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

export default function BlogPostSchema({ 
  headline, 
  description, 
  image, 
  datePublished, 
  dateModified,
  url 
}) {
  const fullImageUrl = getFullImageUrl(image);

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "image": fullImageUrl,
    "author": {
      "@type": "Organization",
      "name": "StreamBackdrops"
    },
    "publisher": {
      "@type": "Organization",
      "name": "StreamBackdrops",
      "url": "https://streambackdrops.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://streambackdrops.com/logo.png"
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified,
    "description": description,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleData)
      }}
    />
  );
}