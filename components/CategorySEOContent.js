export default function CategorySEOContent({ category }) {
  return (
    <section style={{
      background: 'white',
      padding: '2rem',
      marginTop: '3rem',
      borderRadius: '0.5rem',
      maxWidth: '800px',
      margin: '3rem auto 0'
    }}>
      <p style={{ 
        lineHeight: '1.8', 
        color: '#374151',
        fontSize: '1.05rem'
      }}>
        Download free {category.name.toLowerCase()} virtual backgrounds optimized for Zoom, Microsoft Teams, Google Meet, and other video conferencing platforms. These professional HD backgrounds are designed specifically for video calls, providing excellent edge detection and clear image quality even with standard webcam setups. Perfect for remote work, online meetings, and professional presentations. All backgrounds are free to download and use for personal or commercial purposes. Simply click any image to preview in full size, then download directly to your device. For best results, ensure adequate front-facing lighting and position your camera at eye level before your video calls.
      </p>
    </section>
  );
}