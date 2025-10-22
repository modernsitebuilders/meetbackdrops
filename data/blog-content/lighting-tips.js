import Link from 'next/link';

export const lightingTipsContent = () => {
  return (
    <article style={{ 
      background: '#f8fafc', 
      minHeight: '100vh'
    }}>
      <div style={{
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          paddingTop: '2rem', 
          paddingBottom: '2rem' 
        }}>
          <div style={{ 
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Hero Section acts as the header */}
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
                Professional Video Tips
              </div>
              <h1 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                marginBottom: '1rem',
                lineHeight: '1.2'
              }}>
                Perfect Lighting Setup for Virtual Backgrounds
              </h1>
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                opacity: '0.95',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                Master professional lighting techniques and look great on every video call
              </p>
            </header>

            {/* Article Content */}
            <div style={{
              padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.75'
            }}>
              <div style={{
                background: '#fef3c7',
                borderLeft: '4px solid #f59e0b',
                padding: '1.5rem',
                marginBottom: '2rem',
                borderRadius: '0.5rem'
              }}>
                <p style={{fontWeight: '600', color: '#92400e', marginBottom: '0.5rem'}}>
                  ⚡ Quick Takeaway
                </p>
                <p style={{color: '#92400e', marginBottom: 0}}>
                  Great lighting is the #1 factor that separates amateur from professional-looking video calls. Follow these budget-friendly tips to dramatically improve your on-camera appearance.
                </p>
              </div>

              <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Why Lighting Matters More Than You Think
              </h2>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                You can have the best camera, the most professional virtual background, and perfect attire, but if your lighting is poor, you'll still look unprofessional. Good lighting:
              </p>
              <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                <li>Makes you look more alert, healthy, and engaged</li>
                <li>Ensures your facial expressions are clearly visible</li>
                <li>Creates a professional atmosphere that commands respect</li>
                <li>Helps virtual backgrounds work more effectively</li>
              </ul>
              <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                In fact, studies show that proper lighting can increase perceived trustworthiness and competence by up to 30% in video calls.
              </p>

              <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                The Virtual Background Factor
              </h2>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                While professional lighting is important for all video calls, it becomes absolutely crucial when using virtual backgrounds.
              </p>
              <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>When using virtual backgrounds, proper lighting becomes even more critical because:</p>
              <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                <li>Poor lighting creates harsh edges around your silhouette</li>
                <li>Inconsistent lighting makes background replacement look artificial</li>
                <li>Shadows can cause parts of your body to disappear into the background</li>
              </ul>

              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                The Golden Rules of Video Call Lighting
              </h3>
              
              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                1. Face Your Light Source
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                The most important rule: your primary light source should be in front of you, not behind you. Window light, desk lamps, or ring lights should all face toward you.
              </p>
              <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                <strong>Common mistake:</strong> Sitting with a window behind you creates a silhouette effect that makes you nearly invisible.
              </p>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                2. Use Soft, Diffused Light
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Harsh, direct lighting creates unflattering shadows and highlights. Soft, even lighting is much more flattering and professional-looking.
              </p>
              <p style={{color: '#6b7280', marginBottom: '0.5rem'}}><strong>DIY diffusion tricks:</strong></p>
              <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                <li>Hang a thin white sheet in front of a bright light</li>
                <li>Bounce light off a white wall or ceiling</li>
                <li>Use lampshades to soften direct bulbs</li>
              </ul>

              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Lighting Setups by Budget
              </h3>

              <div style={{
                background: '#ecfdf5',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#065f46', marginBottom: '0.75rem'}}>
                  Budget Setup ($0-$25)
                </h3>
                <p style={{color: '#059669', marginBottom: '0.5rem'}}><strong>Natural window light</strong> is your best friend:</p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#059669'}}>
                  <li>Sit facing a large window during daytime</li>
                  <li>Use white poster board as a reflector to fill shadows</li>
                  <li>Close blinds slightly to diffuse harsh sunlight</li>
                  <li>Schedule important calls during optimal lighting hours</li>
                </ul>
              </div>

              <div style={{
                background: '#eff6ff',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem'}}>
                  Mid-Range Setup ($25-$100)
                </h3>
                <p style={{color: '#1e40af', marginBottom: '0.5rem'}}><strong>LED desk lamp + ring light combination:</strong></p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#1e40af'}}>
                  <li>24-inch LED ring light ($40-60)</li>
                  <li>Adjustable desk lamp for fill lighting ($15-25)</li>
                  <li>White foam board for reflection ($5-10)</li>
                </ul>
              </div>

              <div style={{
                background: '#faf5ff',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#581c87', marginBottom: '0.75rem'}}>
                  Professional Setup ($100-$300)
                </h3>
                <p style={{color: '#581c87', marginBottom: '0.5rem'}}><strong>Dedicated studio lighting:</strong></p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#581c87'}}>
                  <li>Key light: Softbox LED panel ($60-100)</li>
                  <li>Fill light: Smaller LED panel or ring light ($30-50)</li>
                  <li>Background light: Strip LED or small spotlight ($20-40)</li>
                  <li>Light stands and diffusers ($30-60)</li>
                </ul>
              </div>

              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Common Lighting Problems and Solutions
              </h3>

              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem'}}>
                <div style={{borderLeft: '4px solid #ef4444', paddingLeft: '1rem'}}>
                  <p style={{fontWeight: '600', color: '#111827'}}>Problem: Dark shadows under your eyes</p>
                  <p style={{color: '#6b7280'}}><strong>Solution:</strong> Add a fill light below your main light source, or use a white surface to bounce light upward.</p>
                </div>

                <div style={{borderLeft: '4px solid #ef4444', paddingLeft: '1rem'}}>
                  <p style={{fontWeight: '600', color: '#111827'}}>Problem: Harsh shadows on one side of your face</p>
                  <p style={{color: '#6b7280'}}><strong>Solution:</strong> Add a second light source on the opposite side, or use a reflector to bounce light into the shadows.</p>
                </div>

                <div style={{borderLeft: '4px solid #ef4444', paddingLeft: '1rem'}}>
                  <p style={{fontWeight: '600', color: '#111827'}}>Problem: Virtual background keeps cutting out parts of your body</p>
                  <p style={{color: '#6b7280'}}><strong>Solution:</strong> Ensure even lighting across your entire torso - no dramatic shadows or bright spots.</p>
                </div>
              </div>

              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Quick Lighting Checklist
              </h3>
              <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>Before every important video call:</p>
              <ul style={{listStyle: 'none', color: '#6b7280', marginBottom: '1.5rem'}}>
                <li>☐ Primary light source is in front of me</li>
                <li>☐ No harsh shadows on my face</li>
                <li>☐ Background is evenly lit (if using physical setup)</li>
                <li>☐ No competing light sources with different color temperatures</li>
                <li>☐ Virtual background edges look clean and professional</li>
                <li>☐ I've tested the setup in current lighting conditions</li>
              </ul>

              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Conclusion
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Great lighting doesn't require expensive equipment - it requires understanding the principles and working with what you have. Start with natural window light, add affordable LED lights as needed, and always prioritize soft, even illumination over harsh, direct lighting.
              </p>
              <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                The investment in good lighting pays dividends in how others perceive your professionalism during video calls. Whether you're meeting with clients, interviewing for jobs, or presenting to your team, proper lighting ensures you always put your best face forward.
              </p>

              <div style={{
                background: '#eff6ff',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginTop: '2rem'
              }}>
                <p style={{color: '#1e40af', fontWeight: '500', marginBottom: '1rem'}}>
                  Pair great lighting with our professional virtual backgrounds for the ultimate video call setup.
                </p>
                <Link href="/" style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'background-color 0.2s'
                }}>
                  Browse Backgrounds →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};