// components/HowToSchema.js

// Utility function for consistent image URLs
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `https://streambackdrops.com${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

export default function HowToSchema({ 
  name, 
  description, 
  image,
  totalTime,
  steps 
}) {
  const fullImageUrl = getFullImageUrl(image);

  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "image": fullImageUrl,
    "totalTime": totalTime, // Format: "PT30M" = 30 minutes, "PT1H" = 1 hour
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "url": step.url || `https://streambackdrops.com/blog#step-${index + 1}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(howToData)
      }}
    />
  );
}