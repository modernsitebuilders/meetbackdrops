import Link from 'next/link';

export const backgroundMistakesContent = () => (
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
              Virtual Background Setup Guide
            </div>
            
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              15 Virtual Background Mistakes That Ruin Your Professional Image
            </h1>
            
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              opacity: '0.95',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Avoid critical mistakes that undermine your professional image
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
              Virtual backgrounds can transform your video calls from amateur to professional—or they can make you look completely unprepared.
            </p>

            <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
              Why Virtual Background Mistakes Matter
            </h2>
            
            <p style={{color: '#6b7280', marginBottom: '2rem'}}>
              Avoid these critical mistakes that undermine your professional image.
            </p>

            <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
              {/* Mistake 1 */}
              <div style={{
                borderLeft: '4px solid #ef4444',
                paddingLeft: '1rem',
                background: '#fef2f2',
                padding: '1rem',
                borderRadius: '0 0.5rem 0.5rem 0'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b', marginBottom: '0.75rem'}}>
                  1. Using Distracting or Inappropriate Backgrounds
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem'}}>The Problem:</h3>
                    <p style={{color: '#dc2626'}}>
                      Vacation photos, memes, or fantasy scenes during professional calls pull attention from your message and signal you don't understand professional norms.
                    </p>
                  </div>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#059669', marginBottom: '0.5rem'}}>The Fix:</h3>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#059669'}}>
                      <li>Choose simple, professional backgrounds</li>
                      <li>Avoid animated or moving backgrounds</li>
                      <li>Select industry-appropriate options</li>
                      <li>When in doubt, use neutral office backgrounds</li>
                    </ul>
                  </div>
                </div>
                <div style={{
                  marginTop: '1rem',
                  background: 'white',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  border: '1px solid #10b981'
                }}>
                  <p style={{fontWeight: '500', color: '#059669'}}>
                    Professional Alternative: Clean office spaces, minimalist home offices, or simple conference room backgrounds.
                  </p>
                </div>
              </div>

              {/* Mistake 2 */}
              <div style={{
                borderLeft: '4px solid #ef4444',
                paddingLeft: '1rem',
                background: '#fef2f2',
                padding: '1rem',
                borderRadius: '0 0.5rem 0.5rem 0'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b', marginBottom: '0.75rem'}}>
                  2. Poor Edge Detection ("Halo Effect")
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem'}}>The Problem:</h3>
                    <p style={{color: '#dc2626'}}>
                      Fuzzy edges make you appear to "glow" or have body parts disappear, suggesting you haven't tested your setup.
                    </p>
                  </div>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#059669', marginBottom: '0.5rem'}}>The Fix:</h3>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#059669'}}>
                      <li>Position yourself facing a light source</li>
                      <li>Avoid backlighting at all costs</li>
                      <li>Use even lighting across face and torso</li>
                      <li>Wear solid contrasting colors</li>
                    </ul>
                  </div>
                </div>
                <div style={{
                  marginTop: '1rem',
                  background: 'white',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  border: '1px solid #2563eb'
                }}>
                  <p style={{fontWeight: '500', color: '#2563eb'}}>
                    Pro Tip: If edges look fuzzy, try background blur instead of full virtual background.
                  </p>
                </div>
              </div>

              {/* Mistake 3 */}
              <div style={{
                borderLeft: '4px solid #ef4444',
                paddingLeft: '1rem',
                background: '#fef2f2',
                padding: '1rem',
                borderRadius: '0 0.5rem 0.5rem 0'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b', marginBottom: '0.75rem'}}>
                  3. Ignoring System Requirements
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem'}}>The Problem:</h3>
                    <p style={{color: '#dc2626'}}>
                      Using virtual backgrounds on underpowered devices causes poor performance, lag, or complete feature failure.
                    </p>
                  </div>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#059669', marginBottom: '0.5rem'}}>The Fix:</h3>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#059669'}}>
                      <li>Check platform system requirements</li>
                      <li>Update video conferencing software</li>
                      <li>Ensure sufficient RAM and processing power</li>
                      <li>Update graphics drivers</li>
                    </ul>
                  </div>
                </div>
                <div style={{marginTop: '1rem'}}>
                  <p style={{fontWeight: '500', color: '#374151'}}>
                    System Check: Most platforms require at least 4GB RAM and a dual-core processor.
                  </p>
                </div>
              </div>

              {/* Quick Fix Checklist */}
              <div style={{
                background: '#eff6ff',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginTop: '2rem'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1.5rem'}}>
                  Quick Fix Checklist
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem'}}>Technical Setup</h3>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#1e40af', lineHeight: '1.8'}}>
                      <li>Lighting faces toward you</li>
                      <li>Background tested and working</li>
                      <li>Audio quality checked</li>
                      <li>Backup options ready</li>
                    </ul>
                  </div>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem'}}>Professional Appearance</h3>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#1e40af', lineHeight: '1.8'}}>
                      <li>Industry-appropriate background</li>
                      <li>Proper clothing colors</li>
                      <li>No distracting elements</li>
                      <li>Organized physical space</li>
                    </ul>
                  </div>
                  <div>
                    <h3 style={{fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem'}}>Meeting Preparation</h3>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#1e40af', lineHeight: '1.8'}}>
                      <li>Platform requirements met</li>
                      <li>Multiple background options</li>
                      <li>Lighting conditions tested</li>
                      <li>Emergency backup plan</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Conclusion */}
              <div style={{marginTop: '2rem'}}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>
                  Conclusion
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <p style={{color: '#6b7280'}}>
                    Virtual backgrounds are powerful tools that can enhance your professional image, but only when used correctly. Avoid these common mistakes, and you'll project competence and attention to detail in every video call.
                  </p>
                  <p style={{color: '#6b7280', fontWeight: '500'}}>
                    Remember: The goal isn't to have the fanciest virtual background—it's to create a professional environment that supports clear communication and reinforces your credibility.
                  </p>
                  <p style={{color: '#6b7280'}}>
                    When in doubt, simpler is almost always better for professional settings.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div style={{
                background: '#ecfdf5',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginTop: '2rem'
              }}>
                <p style={{color: '#059669', fontWeight: '500', marginBottom: '1rem'}}>
                  Download our professionally designed virtual backgrounds, optimized to avoid all these common mistakes and enhance your professional image.
                </p>
                <Link href="/" style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'background-color 0.2s'
                }}>
                  Get Professional Backgrounds →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
);