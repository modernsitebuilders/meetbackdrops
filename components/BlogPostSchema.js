// components/BlogPostSchema.js

// Utility function for consistent image URLs
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `https://meetbackdrops.com${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
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
      "name": "MeetBackdrops"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MeetBackdrops",
      "url": "https://meetbackdrops.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://meetbackdrops.com/logo.png"
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