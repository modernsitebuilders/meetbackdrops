export default function HdFaqSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What resolution are the HD virtual backgrounds?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "StreamBackdrops HD backgrounds are 2912×1632 pixels — exactly twice the resolution of standard backgrounds (1456×816). They render noticeably sharper on high-resolution displays, large monitors, and in recorded video."
        }
      },
      {
        "@type": "Question",
        "name": "How much do HD virtual backgrounds cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "HD backgrounds are available as one-time purchases starting at $4.99 for one image, $6.99 for two, or $8.99 for three. A subscription plan is also available at $9/month, which includes 10 HD downloads per billing period."
        }
      },
      {
        "@type": "Question",
        "name": "Can I preview an HD background before purchasing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Every HD background includes a free interactive comparison preview. Click the 'Preview HD' button on any image to open a side-by-side slider that lets you compare standard and HD quality before you buy."
        }
      },
      {
        "@type": "Question",
        "name": "Do HD backgrounds work with Zoom, Microsoft Teams, and Google Meet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. HD backgrounds work with all major video conferencing platforms including Zoom, Microsoft Teams, Google Meet, Webex, and OBS Studio. The higher resolution is especially noticeable on large monitors and in meeting recordings."
        }
      },
      {
        "@type": "Question",
        "name": "What file format are HD backgrounds delivered in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "HD backgrounds are delivered as PNG files, preserving full detail without compression artifacts. Downloads are available instantly after purchase via a secure link — no account required."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
