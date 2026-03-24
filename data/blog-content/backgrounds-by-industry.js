import Link from 'next/link';

export const backgroundsByIndustryContent = () => (
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
              Industry-Specific Background Guide
            </div>
            
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Best Virtual Backgrounds by Industry: Professional Guide 2025
            </h1>
            
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              opacity: '0.95',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Find the perfect background for your profession
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
              Your virtual background matters. Different industries need different looks. What works for a lawyer won't work for a creative designer.
            </p>

            <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
              Why Background Choice Matters by Industry
            </h2>
            
            <p style={{color: '#6b7280', marginBottom: '2rem'}}>
              Your background sends a message before you speak. It shows you understand your industry and pay attention to details.
            </p>
              <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#1e40af'}}>
                <li>First impressions happen in seconds</li>
                <li>The right background builds trust</li>
                <li>Wrong choices can hurt your credibility</li>
                <li>Industry norms matter</li>
              </ul>

            <h3 style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#111827', marginTop: '2.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem'}}>
              Best Backgrounds by Industry
            </h3>

            <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
              {/* Healthcare */}
              <div style={{
                background: '#eff6ff',
                borderRadius: '1rem',
                padding: '1.5rem',
                borderLeft: '4px solid #2563eb'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1rem'}}>
                  Healthcare & Medical
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem'}}>✓ Use These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#1e40af'}}>
                      <li><Link href="/category/office-spaces" style={{color: '#1e40af'}}>Clean professional offices</Link></li>
                      <li>Simple consultation rooms</li>
                      <li><Link href="/category/home-office" style={{color: '#1e40af'}}>Professional home offices</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem'}}>✗ Avoid These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#dc2626'}}>
                      <li>Busy patterns</li>
                      <li>Casual home settings</li>
                      <li>Dark rooms</li>
                    </ul>
                  </div>
                </div>
                <div style={{marginTop: '1rem'}}>
                  <h4 style={{fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem'}}>Why This Works:</h4>
                  <p style={{color: '#1e40af'}}>
                    Clean backgrounds show professionalism. They build trust with patients. White and blue colors suggest cleanliness and calm.
                  </p>
                  <div style={{marginTop: '0.75rem'}}>
                    <span style={{fontWeight: '500', color: '#1e40af'}}>Best Colors: </span>
                    <span style={{color: '#1e40af'}}>White, light blue, soft green</span>
                  </div>
                </div>
              </div>

              {/* Finance */}
              <div style={{
                background: '#ecfdf5',
                borderRadius: '1rem',
                padding: '1.5rem',
                borderLeft: '4px solid #10b981'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#065f46', marginBottom: '1rem'}}>
                  Finance & Banking
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#065f46', marginBottom: '0.5rem'}}>✓ Use These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#065f46'}}>
                      <li><Link href="/category/office-spaces" style={{color: '#065f46'}}>Executive office spaces</Link></li>
                      <li><Link href="/category/bookshelves-dark" style={{color: '#065f46'}}>Wood-paneled bookshelf backgrounds</Link></li>
                      <li><Link href="/category/conference-rooms" style={{color: '#065f46'}}>Modern conference rooms</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem'}}>✗ Avoid These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#dc2626'}}>
                      <li>Casual settings</li>
                      <li>Kitchen backgrounds</li>
                      <li>Trendy designs</li>
                    </ul>
                  </div>
                </div>
                <div style={{marginTop: '1rem'}}>
                  <h4 style={{fontWeight: '600', color: '#065f46', marginBottom: '0.5rem'}}>Why This Works:</h4>
                  <p style={{color: '#065f46'}}>
                    Formal offices show stability. Clients trust you with their money. Books and nice furniture suggest success and expertise.
                  </p>
                  <div style={{marginTop: '0.75rem'}}>
                    <span style={{fontWeight: '500', color: '#065f46'}}>Key Elements: </span>
                    <span style={{color: '#065f46'}}>Professional furniture, books, quality details</span>
                  </div>
                </div>
              </div>

              {/* Legal */}
              <div style={{
                background: '#faf5ff',
                borderRadius: '1rem',
                padding: '1.5rem',
                borderLeft: '4px solid #7c3aed'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#581c87', marginBottom: '1rem'}}>
                  Legal Professionals
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#581c87', marginBottom: '0.5rem'}}>✓ Use These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#581c87'}}>
                      <li><Link href="/category/libraries" style={{color: '#581c87'}}>Law libraries</Link></li>
                      <li><Link href="/category/office-spaces" style={{color: '#581c87'}}>Formal office spaces</Link></li>
                      <li><Link href="/category/conference-rooms" style={{color: '#581c87'}}>Conference rooms</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem'}}>✗ Avoid These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#dc2626'}}>
                      <li>Modern trendy designs</li>
                      <li>Casual home settings</li>
                      <li>Bright colors</li>
                    </ul>
                  </div>
                </div>
                <div style={{marginTop: '1rem'}}>
                  <h4 style={{fontWeight: '600', color: '#581c87', marginBottom: '0.5rem'}}>Why This Works:</h4>
                  <p style={{color: '#581c87'}}>
                    Traditional settings build trust. Books show knowledge. Dark colors suggest seriousness and expertise.
                  </p>
                  <div style={{marginTop: '0.75rem'}}>
                    <span style={{fontWeight: '500', color: '#581c87'}}>Best Colors: </span>
                    <span style={{color: '#581c87'}}>Brown, deep blue, burgundy</span>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div style={{
                background: '#fef3c7',
                borderRadius: '1rem',
                padding: '1.5rem',
                borderLeft: '4px solid #f59e0b'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e', marginBottom: '1rem'}}>
                  Education & Teaching
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#92400e', marginBottom: '0.5rem'}}>✓ Use These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#92400e'}}>
                      <li><Link href="/category/bookshelves-bright" style={{color: '#92400e'}}>Bright, welcoming bookshelves</Link></li>
                      <li><Link href="/category/wall-shelves-bright" style={{color: '#92400e'}}>Clean wall shelves</Link></li>
                      <li><Link href="/category/home-office" style={{color: '#92400e'}}>Clean home offices</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem'}}>✗ Avoid These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#dc2626'}}>
                      <li>Too formal settings</li>
                      <li>Messy backgrounds</li>
                      <li>Dark colors</li>
                    </ul>
                  </div>
                </div>
                <div style={{marginTop: '1rem'}}>
                  <h4 style={{fontWeight: '600', color: '#92400e', marginBottom: '0.5rem'}}>Why This Works:</h4>
                  <p style={{color: '#92400e'}}>
                    Students need to feel welcome. Bright spaces keep attention. Books show expertise without being too formal.
                  </p>
                  <div style={{marginTop: '0.75rem'}}>
                    <span style={{fontWeight: '500', color: '#92400e'}}>Best Colors: </span>
                    <span style={{color: '#92400e'}}>Warm whites, light wood, soft colors</span>
                  </div>
                </div>
              </div>

              {/* Tech & Startups */}
              <div style={{
                background: '#f3f4f6',
                borderRadius: '1rem',
                padding: '1.5rem',
                borderLeft: '4px solid #6b7280'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem'}}>
                  Tech & Startups
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem'}}>✓ Use These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#1f2937'}}>
                      <li><Link href="/category/office-spaces" style={{color: '#1f2937'}}>Modern minimalist office spaces</Link></li>
                      <li><Link href="/category/urban-lofts" style={{color: '#1f2937'}}>Urban loft designs</Link></li>
                      <li><Link href="/category/home-office" style={{color: '#1f2937'}}>Clean home office setups</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem'}}>✗ Avoid These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#dc2626'}}>
                      <li>Old-fashioned offices</li>
                      <li>Heavy furniture</li>
                      <li>Formal libraries</li>
                    </ul>
                  </div>
                </div>
                <div style={{marginTop: '1rem'}}>
                  <h4 style={{fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem'}}>Why This Works:</h4>
                  <p style={{color: '#1f2937'}}>
                    Tech values innovation. Clean designs show you're modern. Simple spaces let your ideas shine.
                  </p>
                  <div style={{marginTop: '0.75rem'}}>
                    <span style={{fontWeight: '500', color: '#1f2937'}}>Best Colors: </span>
                    <span style={{color: '#1f2937'}}>White, gray, light blue</span>
                  </div>
                </div>
              </div>

              {/* Creative & Design */}
              <div style={{
                background: '#fce7f3',
                borderRadius: '1rem',
                padding: '1.5rem',
                borderLeft: '4px solid #ec4899'
              }}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#831843', marginBottom: '1rem'}}>
                  Creative & Design
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#831843', marginBottom: '0.5rem'}}>✓ Use These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#831843'}}>
                      <li><Link href="/category/art-galleries" style={{color: '#831843'}}>Art gallery spaces</Link></li>
                      <li><Link href="/category/urban-lofts" style={{color: '#831843'}}>Creative urban lofts</Link></li>
                      <li><Link href="/category/coffee-shops" style={{color: '#831843'}}>Cozy studio settings</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem'}}>✗ Avoid These:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#dc2626'}}>
                      <li>Corporate offices</li>
                      <li>Boring gray spaces</li>
                      <li>Too formal settings</li>
                    </ul>
                  </div>
                </div>
                <div style={{marginTop: '1rem'}}>
                  <h4 style={{fontWeight: '600', color: '#831843', marginBottom: '0.5rem'}}>Why This Works:</h4>
                  <p style={{color: '#831843'}}>
                    Creativity needs personality. Art on walls shows your eye for design. Color proves you're not afraid to stand out.
                  </p>
                  <div style={{marginTop: '0.75rem'}}>
                    <span style={{fontWeight: '500', color: '#831843'}}>Key Elements: </span>
                    <span style={{color: '#831843'}}>Art, plants, creative touches, good lighting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips Section */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginTop: '3rem',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>
                Quick Tips for Any Industry
              </h3>
              <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#374151', lineHeight: '2'}}>
                <li>Match your background to your audience</li>
                <li>Keep it simple and clean</li>
                <li><Link href="/blog/lighting-tips" style={{color: '#2563eb', textDecoration: 'underline'}}>Good lighting</Link> always matters — it affects how any background looks</li>
                <li>Test before important calls</li>
                <li>When in doubt, go professional — <Link href="/category/office-spaces" style={{color: '#2563eb', textDecoration: 'underline'}}>office spaces</Link> and <Link href="/category/bookshelves-bright" style={{color: '#2563eb', textDecoration: 'underline'}}>bookshelves</Link> work for almost any industry</li>
                <li>Your background should support you, not distract</li>
              </ul>
            </div>

            {/* Conclusion */}
            <div style={{marginTop: '3rem'}}>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>
                The Bottom Line
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Your virtual background is part of your professional image. The right choice builds trust. The wrong choice can hurt your credibility.
              </p>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Choose backgrounds that fit your industry. When you're not sure, pick something professional. You can always adjust later.
              </p>
              <p style={{color: '#6b7280', fontWeight: '500'}}>
                Remember: Your background supports your message. It shouldn't compete with it.
              </p>
            </div>

            {/* CTA */}
            <div style={{
              background: '#eff6ff',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginTop: '2rem'
            }}>
              <p style={{color: '#1e40af', fontWeight: '500', marginBottom: '1rem'}}>
                Browse 1,300+ free professional virtual backgrounds by category — no signup, no watermarks. Or check out our <Link href="/hd" style={{color: '#1e40af', textDecoration: 'underline'}}>HD backgrounds</Link> for higher resolution options.
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
                <Link href="/blog/job-interview-backgrounds" style={{
                  background: 'white',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}>
                  Interview Background Guide →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
);