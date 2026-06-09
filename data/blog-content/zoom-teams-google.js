import Link from 'next/link';

export const zoomTeamsGoogleContent = () => {
  return (
    <article style={{ 
      background: '#f8fafc', 
      minHeight: '100vh'
    }}>
      
      {/* PADDING WRAPPER */}
      <div style={{
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        
        {/* MAX-WIDTH CONTAINER */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          paddingTop: '2rem', 
          paddingBottom: '2rem' 
        }}>
          
          {/* WHITE CARD WRAPPER */}
          <div style={{ 
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            
            {/* HERO/HEADER SECTION */}
            <header style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                opacity: '0.9'
              }}>
                Platform Comparison Guide
              </div>
              
              <h1 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                marginBottom: '1rem',
                lineHeight: '1.2'
              }}>
                Zoom vs Teams vs Google Meet: Virtual Background Setup Guide
              </h1>
              
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                opacity: '0.95',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                Compare virtual background features across all platforms
              </p>
            </header>

            {/* ARTICLE CONTENT SECTION */}
            <div style={{
              padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.75'
            }}>

              <p style={{fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem'}}>
                Each major video conferencing platform handles virtual backgrounds differently. Understanding these differences helps you optimize your setup for the best professional appearance across all platforms.
              </p>

              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Platform Comparison Overview
              </h2>

              <div style={{
                background: '#eff6ff',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1e40af', marginBottom: '1rem'}}>
                  Zoom Virtual Backgrounds
                </h3>
                <p style={{color: '#1e40af', marginBottom: '1rem'}}>
                  Zoom pioneered mainstream virtual backgrounds and offers the most robust implementation.
                </p>
                <div style={{color: '#1e40af'}}>
                  <p><strong>Strengths:</strong></p>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem'}}>
                    <li>Best-in-class edge detection</li>
                    <li>Green screen support</li>
                    <li>Custom background uploads</li>
                    <li>Video backgrounds available</li>
                  </ul>
                  <p><strong>System Requirements:</strong> Dual-core 2Ghz+ processor, 4GB RAM minimum</p>
                </div>
              </div>

              <div style={{
                background: '#faf5ff',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#581c87', marginBottom: '1rem'}}>
                  Microsoft Teams Virtual Backgrounds
                </h3>
                <p style={{color: '#581c87', marginBottom: '1rem'}}>
                  Teams integrates virtual backgrounds with the broader Microsoft ecosystem.
                </p>
                <div style={{color: '#581c87'}}>
                  <p><strong>Strengths:</strong></p>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem'}}>
                    <li>Background blur with adjustable intensity</li>
                    <li>OneDrive integration for background storage</li>
                    <li>Corporate-approved background collections</li>
                    <li>IT admin controls for enterprise</li>
                  </ul>
                  <p><strong>System Requirements:</strong> Windows 10 v1903+, macOS 10.14+, specific processors required</p>
                </div>
              </div>

              <div style={{
                background: '#ecfdf5',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#065f46', marginBottom: '1rem'}}>
                  Google Meet Virtual Backgrounds
                </h3>
                <p style={{color: '#065f46', marginBottom: '1rem'}}>
                  Meet focuses on simplicity and browser-based functionality.
                </p>
                <div style={{color: '#065f46'}}>
                  <p><strong>Strengths:</strong></p>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem'}}>
                    <li>Works in web browsers</li>
                    <li>Simple, clean interface</li>
                    <li>Automatic lighting adjustment</li>
                    <li>Low system requirements</li>
                  </ul>
                  <p><strong>System Requirements:</strong> Chrome 88+, Firefox 84+, Safari 14+, or mobile apps</p>
                </div>
              </div>

              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Setup Instructions by Platform
              </h3>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Zoom Detailed Setup
              </h3>
              <ol style={{listStyle: 'decimal', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                <li>Open Zoom desktop client and sign in</li>
                <li>Click the gear icon (Settings) in the top right</li>
                <li>Select "Virtual Background" from the left menu</li>
                <li>Download the smart virtual background package if prompted</li>
                <li>Choose from preset backgrounds or click "+" to upload your own</li>
                <li>Check "I have a green screen" if you're using one</li>
                <li>Test different backgrounds and lighting conditions</li>
              </ol>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Microsoft Teams Detailed Setup
              </h3>
              <ol style={{listStyle: 'decimal', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                <li>Join or start a meeting in Teams</li>
                <li>Click the three dots (More actions) in the meeting toolbar</li>
                <li>Select "Apply background effects"</li>
                <li>Choose from background blur, preset backgrounds, or upload custom</li>
                <li>Click "Apply and turn on camera" or "Preview" to test first</li>
                <li>Adjust background during calls by clicking the camera icon</li>
              </ol>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Google Meet Detailed Setup
              </h3>
              <ol style={{listStyle: 'decimal', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                <li>Join a meeting or start a new one in Google Meet</li>
                <li>Click the three dots (More options) in the bottom toolbar</li>
                <li>Select "Apply visual effects"</li>
                <li>Choose from available backgrounds or slight blur options</li>
                <li>Click "Apply" to activate the background</li>
                <li>Note: Custom uploads may require Google Workspace account</li>
              </ol>

              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Platform-Specific Best Practices
              </h3>

              <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div style={{
                  borderLeft: '4px solid #2563eb',
                  paddingLeft: '1rem',
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0 0.5rem 0.5rem 0'
                }}>
                  <h4 style={{fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem'}}>Zoom Tips</h4>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280'}}>
                    <li>Use "Touch up my appearance" for better results</li>
                    <li>Enable "Mirror my video" to avoid confusion</li>
                    <li>Test backgrounds before important meetings</li>
                  </ul>
                </div>

                <div style={{
                  borderLeft: '4px solid #7c3aed',
                  paddingLeft: '1rem',
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0 0.5rem 0.5rem 0'
                }}>
                  <h4 style={{fontWeight: '600', color: '#581c87', marginBottom: '0.5rem'}}>Teams Tips</h4>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280'}}>
                    <li>Use background blur for professional calls</li>
                    <li>Upload backgrounds to OneDrive for easy access</li>
                    <li>Check with IT for approved corporate backgrounds</li>
                  </ul>
                </div>

                <div style={{
                  borderLeft: '4px solid #059669',
                  paddingLeft: '1rem',
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0 0.5rem 0.5rem 0'
                }}>
                  <h4 style={{fontWeight: '600', color: '#065f46', marginBottom: '0.5rem'}}>Google Meet Tips</h4>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280'}}>
                    <li>Keep backgrounds simple due to limited processing</li>
                    <li>Use Chrome browser for best performance</li>
                    <li>Consider lighting carefully as detection is less sophisticated</li>
                  </ul>
                </div>
              </div>

              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Performance Comparison
              </h3>
              <div style={{
                background: '#f8fafc',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{fontWeight: '600', color: '#111827', marginBottom: '1rem'}}>System Impact (CPU Usage)</h4>
                <ul style={{listStyle: 'none', color: '#6b7280'}}>
                  <li><strong>Zoom:</strong> Medium-high (advanced AI processing)</li>
                  <li><strong>Teams:</strong> Medium (optimized for Microsoft ecosystem)</li>
                  <li><strong>Google Meet:</strong> Low-medium (browser-based efficiency)</li>
                </ul>
              </div>

              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Conclusion
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Each platform has its strengths. Zoom offers the most features and best quality, Teams excels in enterprise environments, and Google Meet provides simplicity and accessibility. Choose based on your primary use case and system capabilities.
              </p>
              <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                Regardless of platform, proper lighting and appropriate background choices matter more than the specific technology used.
              </p>

              <div style={{
                background: '#eff6ff',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginTop: '2rem'
              }}>
                <p style={{color: '#1e40af', fontWeight: '500', marginBottom: '1rem'}}>
                  Browse 1,300+ free virtual backgrounds optimised for Zoom, Teams, and Google Meet — no signup required. Also see: <Link href="/blog/lighting-tips" style={{color: '#1e40af', textDecoration: 'underline'}}>lighting tips</Link> and <Link href="/blog/backgrounds-by-industry" style={{color: '#1e40af', textDecoration: 'underline'}}>backgrounds by industry</Link>.
                </p>
                <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                  <Link href="/category/office-spaces" style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}>
                    Browse Office Backgrounds →
                  </Link>
                  <Link href="/category/bookshelves" style={{
                    background: 'white',
                    color: '#2563eb',
                    border: '2px solid #2563eb',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}>
                    Browse Bookshelf Backgrounds →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};