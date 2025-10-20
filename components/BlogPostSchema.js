// components/BlogPostSchema.js
export default function BlogPostSchema({ 
  headline, 
  description, 
  image, 
  datePublished, 
  dateModified,
  url 
}) {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "image": `https://streambackdrops.com${image}`,
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