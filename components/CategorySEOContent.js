export default function CategorySEOContent({ category }) {
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
        Download free {category.name.toLowerCase()} virtual backgrounds optimized for Zoom, Microsoft Teams, Google Meet, and other video conferencing platforms. These professional backgrounds are designed specifically for video calls, providing excellent edge detection and clear image quality even with standard webcam setups.
      </p>
      <h3 style={{
        fontSize: '1.35rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '1rem',
        marginTop: '2rem'
      }}>
        Perfect for Professional Use
      </h3>
      <p style={{ 
        lineHeight: '1.8', 
        color: '#374151',
        fontSize: '1.05rem',
        marginBottom: '1.5rem'
      }}>
        Our {category.name.toLowerCase()} backgrounds are perfect for remote work, online meetings, and professional presentations. All backgrounds are free to download and use for personal or commercial purposes. Simply click any image to preview in full size, then download directly to your device. For best results, ensure adequate front-facing lighting and position your camera at eye level before your video calls.
      </p>
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