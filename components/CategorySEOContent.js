import { SEO_DESCRIPTIONS, CATEGORY_KEYWORDS } from '../lib/categories-config';

export default function CategorySEOContent({ category, slug }) {
  const seoDesc = (slug && SEO_DESCRIPTIONS[slug]) || `Download free ${category.name.toLowerCase()} virtual backgrounds optimized for Zoom, Microsoft Teams, Google Meet, and other video conferencing platforms.`;
  const keywords = (slug && CATEGORY_KEYWORDS[slug]) || [];

  return (
    <section style={{
      background: 'white',
      padding: '2rem',
      marginTop: '3rem',
      borderRadius: '0.5rem',
      maxWidth: '800px',
      margin: '3rem auto 0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        fontSize: '1.75rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        About {category.name} Virtual Backgrounds
      </h2>

      <p style={{
        lineHeight: '1.8',
        color: '#374151',
        fontSize: '1.05rem',
        marginBottom: '1.5rem'
      }}>
        {seoDesc}
      </p>

      <p style={{
        lineHeight: '1.8',
        color: '#374151',
        fontSize: '1.05rem',
        marginBottom: '1.5rem'
      }}>
        All backgrounds are free to download and use for personal or commercial purposes. Simply click any image to preview in full size, then download directly to your device. No signup, no watermarks — instant download. For best results, ensure adequate front-facing lighting and position your camera at eye level before your video calls.
      </p>

      {keywords.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {keywords.map(kw => (
              <span
                key={kw}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  border: '1px solid #e5e7eb',
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: '#f8fafc',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        borderLeft: '4px solid #3b82f6'
      }}>
        <h4 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          Pro Tip:
        </h4>
        <p style={{
          margin: 0,
          color: '#374151',
          fontSize: '1rem'
        }}>
          Use a solid colored background behind you and ensure good lighting for the best virtual background results with any video conferencing software.
        </p>
      </div>
    </section>
  );
}
