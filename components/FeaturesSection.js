export default function FeaturesSection() {
  return (
    <section className="features">
      <div className="container">
        <div style={{textAlign: 'center', marginBottom: '3rem'}}>
          <h2 style={{fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>
            Why Choose MeetBackdrops?
          </h2>
        </div>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">
              <span style={{fontSize: '2rem'}}>🖼️</span>
            </div>
            <h3>High Quality</h3>
            <p>Optimized for all video platforms and calling apps</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <span style={{fontSize: '2rem'}}>💼</span>
            </div>
            <h3>Professional</h3>
            <p>Designed for business meetings and professional calls</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <span style={{fontSize: '2rem'}}>⬇️</span>
            </div>
            <h3>Free Download</h3>
            <p>All backgrounds are completely free to download and use</p>
          </div>
        </div>
      </div>
    </section>
  );
}